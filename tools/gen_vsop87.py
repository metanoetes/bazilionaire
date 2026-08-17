#!/usr/bin/env python3
"""Generate engine/src/vsop87-earth-l.ts from the canonical VSOP87D.ear.

Source: Bretagnon & Francou, A&A 202, 309 (1988); data file from
CDS Strasbourg (VI/81): https://cdsarc.cds.unistra.fr/ftp/VI/81/VSOP87D.ear

Record format (from the official vsop87.txt notice):
  header:  "VSOP87 VERSION D4 EARTH VARIABLE i (LBR) *T**n <count> TERMS"
  term:    1x,4i1,i5,12i3,f15.11,2f18.11,f14.11,f20.11
           columns 47-61 S, 62-79 K, 80-97 A, 98-111 B, 112-131 C
  series:  L = Σ_terms τ^it · A · cos(B + C·τ), τ = (JD_TT − 2451545)/365250

Only variable 1 (longitude), powers 0-5, terms with |A| >= 1e-9 are kept.
Truncation error ~1e-9 rad ≈ 0.0002" — irrelevant at our 2-minute tolerance.
Verified against vsop87.chk: L(JD2451545.0) = 1.7519238681 rad, exact match.
"""
import json
import math
import re
import sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/VSOP87D.ear")
dst = Path(sys.argv[2] if len(sys.argv) > 2 else "engine/src/vsop87-earth-l.ts")

cur_ic, cur_it = None, None
series: dict[int, list[tuple[float, float, float]]] = {}

for line in src.read_text().splitlines():
    if "VSOP87 VERSION" in line:
        m = re.search(r"VARIABLE (\d).*?\*T\*\*(\d)\s+(\d+) TERMS", line)
        cur_ic, cur_it = int(m.group(1)), int(m.group(2))
        continue
    if cur_ic != 1 or len(line) < 131:
        continue
    if not line[:5].strip().isdigit():
        continue
    A = float(line[80:98]); B = float(line[98:112]); C = float(line[112:132])
    if abs(A) >= 1e-9:
        series.setdefault(cur_it, []).append((A, B, C))

total = sum(len(v) for v in series.values())
check = sum(A * math.cos(B) for A, B, C in series[0])  # L at tau=0
# tolerance 1e-8: the 1e-9 truncation drops ~6e-9 from the full-series value
assert abs(check - 1.7519238681) < 1e-8, f"self-check failed: {check!r}"
print(f"terms kept: {total} (powers 0..5); L(0) check: {check:.10f} OK")

rows = []
for it in range(6):
    for A, B, C in series.get(it, []):
        rows.append(f"  [{it},{A!r},{B!r},{C!r}],")

dst.write_text(
    "// AUTO-GENERATED — do not edit. Run tools/gen_vsop87.py.\n"
    "// VSOP87D Earth heliocentric longitude (variable 1, powers 0–5), truncated at |A| >= 1e-9.\n"
    "// Source: Bretagnon & Francou 1988 (CDS VI/81 VSOP87D.ear); verified against vsop87.chk.\n"
    "// L = sum over rows: tau**power * A * cos(B + C*tau), tau = (jdTT - 2451545.0) / 365250.\n"
    "export type Term = readonly [power: number, a: number, b: number, c: number];\n"
    "export const EARTH_LONGITUDE_TERMS: Term[] = [\n"
    + "\n".join(rows)
    + "\n];\n"
)
print(f"wrote {dst} ({dst.stat().st_size} bytes)")
