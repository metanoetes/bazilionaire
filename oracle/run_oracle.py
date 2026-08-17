#!/usr/bin/env python3
"""CI oracle runner — emits JSON for every case in fixtures/inputs.json.

Output must byte-match fixtures/expected.json; the workflow gates on it.
"""
import json
import sys
from pathlib import Path

from lunar_python import Solar

root = Path(__file__).resolve().parent.parent
inputs = json.loads((root / "fixtures" / "inputs.json").read_text(encoding="utf-8"))

out = {}
for name, case in inputs.items():
    y, m, d, h, mi = case
    s = Solar.fromYmdHms(y, m, d, h, mi, 0)
    l = s.getLunar()
    ec = l.getEightChar()
    out[name] = {
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

json.dump(out, sys.stdout, ensure_ascii=False, indent=2)
print()
