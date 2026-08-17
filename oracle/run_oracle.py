#!/usr/bin/env python3
"""CI oracle runner — emits JSON for every case in fixtures/inputs.json.

Output must byte-match fixtures/expected.json; the workflow gates on it.

Pillar outputs come from lunar_python. Astronomy outputs (solar-term times,
equation of time, true-solar-time offset) come from skyfield + JPL de421 —
the Python reference the TypeScript astronomy port must reproduce.
"""
import json
import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from lunar_python import Solar
from skyfield.api import load
from skyfield.framelib import ecliptic_frame

root = Path(__file__).resolve().parent.parent
inputs = json.loads((root / "fixtures" / "inputs.json").read_text(encoding="utf-8"))

# JPL ephemeris — local copy in ~/wokshop if present, else skyfield auto-downloads
eph_path = root / "de421.bsp"
if not eph_path.exists():
    eph_path = root.parent / "de421.bsp"
eph = load(str(eph_path)) if eph_path.exists() else load("de421.bsp")
ts = load.timescale()
earth, sun = eph["earth"], eph["sun"]

SOLAR_TERMS = [  # apparent ecliptic longitude in degrees
    (285.0, "小寒"), (300.0, "大寒"), (315.0, "立春"), (330.0, "雨水"),
    (345.0, "惊蛰"), (0.0, "春分"), (15.0, "清明"), (30.0, "谷雨"),
    (45.0, "立夏"), (60.0, "小满"), (75.0, "芒种"), (90.0, "夏至"),
    (105.0, "小暑"), (120.0, "大暑"), (135.0, "立秋"), (150.0, "处暑"),
    (165.0, "白露"), (180.0, "秋分"), (195.0, "寒露"), (210.0, "霜降"),
    (225.0, "立冬"), (240.0, "小雪"), (255.0, "大雪"), (270.0, "冬至"),
]


def sun_apparent_lon(t):
    """Apparent geocentric ecliptic longitude of the Sun, degrees 0..360."""
    _, lon, _ = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
    return lon.degrees % 360.0


def wrapped_diff(a, b):
    """Signed difference a−b wrapped to (−180, 180]."""
    return ((a - b + 180.0) % 360.0) - 180.0


def term_time_utc(year, target_deg):
    """UT datetime string of the first crossing of target_deg within `year`.

    The Sun's apparent longitude is strictly increasing (~1°/day), so no
    sign-change detection: accumulate UNWRAPPED longitude and bisect on the
    first time it reaches target_unwrapped. (Sign-change on wrapped
    differences breaks at the ±180° discontinuity — verified the hard way:
    July+ terms duplicated January's.)
    """
    t0, t1 = ts.utc(year, 1, 1), ts.utc(year, 12, 31, 23, 59)
    base = sun_apparent_lon(t0)
    target_unw = target_deg + (0.0 if target_deg >= base else 360.0)

    def unwrapped(tt):
        v = sun_apparent_lon(ts.tt_jd(tt))
        while v < base - 1.0:
            v += 360.0
        return v

    step = 0.5
    t, prev = t0, base
    cross = None
    while t.tt < t1.tt:
        t = ts.tt_jd(t.tt + step)
        cur = unwrapped(t.tt)
        if prev < target_unw <= cur:
            lo, hi = t.tt - step, t.tt
            for _ in range(60):  # bisect on the unwrapped value
                mid = 0.5 * (lo + hi)
                if unwrapped(mid) < target_unw:
                    lo = mid
                else:
                    hi = mid
            cross = ts.tt_jd(0.5 * (lo + hi))
            break
        prev = cur
    if cross is None:
        return None
    return cross.utc_datetime().strftime("%Y-%m-%dT%H:%M:%SZ")


def equation_of_center_deg(t):
    """Equation of center (true − mean longitude) in degrees, Meeus ch. 25
    low precision (~0.01°). This is what separates the sun's TRUE longitude
    from its MEAN longitude — and EoT is defined on the mean longitude."""
    T = (t.tt - 2451545.0) / 36525.0
    M = math.radians((357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360.0)
    return (
        (1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(M)
        + (0.019993 - 0.000101 * T) * math.sin(2 * M)
        + 0.000289 * math.sin(3 * M)
    )


def eot_minutes(t):
    """Equation of time in minutes: apparent solar time − mean solar time.

    E = 4 × (L0 − α_apparent), where L0 = the sun's MEAN longitude
    (apparent longitude − equation of center − aberration 20.49″; nutation
    ≤17″ dropped: ≤1.2s error). Positive = sundial ahead (early November).
    """
    ap = earth.at(t).observe(sun).apparent()
    ra = ap.radec(epoch="date")[0].degrees % 360.0
    _, lon_app, _ = ap.frame_latlon(ecliptic_frame)
    L0 = (lon_app.degrees - equation_of_center_deg(t) - 20.4898 / 3600.0) % 360.0
    return 4.0 * wrapped_diff(L0, ra)


def main():
    out = {}
    for name, case in inputs.items():
        y, m, d, h, mi = case["datetime"]
        loc = case["location"]
        s = Solar.fromYmdHms(y, m, d, h, mi, 0)
        l = s.getLunar()
        ec = l.getEightChar()
        entry = {
            "input": case,
            "year": ec.getYear(),
            "month": ec.getMonth(),
            "day": ec.getDay(),
            "time": ec.getTime(),
            "nayin": [ec.getYearNaYin(), ec.getMonthNaYin(), ec.getDayNaYin(), ec.getTimeNaYin()],
            "hideGan": [ec.getYearHideGan(), ec.getMonthHideGan(), ec.getDayHideGan(), ec.getTimeHideGan()],
            "zodiac": l.getYearShengXiao(),
            "lunar": l.toString(),
        }
        birth_utc = datetime(y, m, d, h, mi, tzinfo=timezone(timedelta(hours=loc["tzHours"]))).astimezone(timezone.utc)
        t_birth = ts.from_datetime(birth_utc)
        eot = eot_minutes(t_birth)
        # true solar time = clock + EoT + 4·(lon_deg − 15·tzHours) minutes
        solar_offset_min = eot + 4.0 * (loc["lon"] - 15.0 * loc["tzHours"])
        entry["astronomy"] = {
            "eotMin": round(eot, 3),
            "solarOffsetMin": round(solar_offset_min, 3),
            "terms": {
                f"{year}": {name: term_time_utc(year, deg) for deg, name in SOLAR_TERMS}
                for year in (y - 1, y, y + 1)
            },
        }
        out[name] = entry

    json.dump(out, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
