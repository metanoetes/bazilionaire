#!/usr/bin/env python3
"""Bazi pillar referee — ALWAYS run this before publishing any chart.
Usage: python verify_bazi.py YYYY M D [HH [MM]]
Prints pillars, nayin, hidden stems, zodiac. Uses lunar_python (pip install lunar_python).
"""
import sys
from lunar_python import Solar


def verify(y, m, d, h=12, mi=0):
    s = Solar.fromYmdHms(y, m, d, h, mi, 0)
    l = s.getLunar()
    ec = l.getEightChar()
    print(f"{y:04d}-{m:02d}-{d:02d} {h:02d}:{mi:02d} | 农历: {l.toString()}")
    print(f"年柱: {ec.getYear()} | 月柱: {ec.getMonth()} | 日柱: {ec.getDay()} | 时柱: {ec.getTime()}")
    print(f"纳音: {ec.getYearNaYin()} {ec.getMonthNaYin()} {ec.getDayNaYin()} {ec.getTimeNaYin()}")
    print(f"藏干: {ec.getYearHideGan()} {ec.getMonthHideGan()} {ec.getDayHideGan()} {ec.getTimeHideGan()}")
    print(f"生肖: {l.getYearShengXiao()}")


if __name__ == "__main__":
    args = [int(x) for x in sys.argv[1:]]
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    verify(*args)
