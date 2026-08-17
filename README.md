# Bazilionaire

**The chart is a map; Christ is the way.**

Bazilionaire (ba-ZI-LION-aire) is a free, open-source, nonprofit **Bazi (八字) learning center and research commons** for English-speaking audiences. Everywhere in the project, Chinese terms appear as 汉字 (pinyin, English gloss) — per-character tables that teach the language as they teach the chart.

- 八字 (bā zì, "Eight Characters") — the chart, the map.
- 犹大之狮 (Yóudà zhī shī, the Lion of Judah, Rev 5:5) — Christ, the way.
- 气 (qì) — the created medium, fractal monism's field.

## What this repo is

1. **`engine/`** — the deterministic Bazi computation engine, a TypeScript port that runs entirely client-side (birth data never leaves the browser). The Python reference (lunar_python) lives in `oracle/` and is used **only** as a test oracle in CI.
2. **`fixtures/`** — the pinned anchor chain (published historical dates) that both implementations must agree on.
3. **`oracle/`** — the Python referee. Its output is regenerated in CI and must byte-match the committed expectations.

## Verification loop — "computed, not generated"

Every push runs two gates:

- **Oracle regression:** `oracle/run_oracle.py` regenerates outputs for the fixture inputs; the result must byte-match `fixtures/expected.json`.
- **Engine tests:** the TS port computes the same fixtures and asserts equality against the pinned oracle output, plus published anchor values (1949-10-01 = 甲子, 2000-01-01 = 戊午, 2024-02-10 = 甲辰).

The green badge is the trust artifact.

## Current state

Sprints 1–3 shipped (verified in CI against the Python oracle):

- **Pillars**: year (立春 exact, local time), month (节 exact, 五虎遁), day (JDN), hour (clock + 真太阳时 solar schools, 五鼠遁).
- **Astronomy**: VSOP87D solar terms (±120 s vs skyfield), equation of time (±30 s), true-solar-time offsets, ΔT, nutation, obliquity. Generated tables in `engine/src/vsop87-earth-l.ts` (provenance: `tools/gen_vsop87.py` + `fixtures/VSOP87D.ear`).
- **Doctrine**: 十神 (Ten Gods), 空亡 (void branches), 起运/大运 (decade luck, pinned against lunar_python including 虚岁 start ages), 神煞 tables (驿马/羊刃/华盖/天乙/文昌/桃花/禄).
- **Boundary honesty**: ±1 min around every 节 gets an explicit school-split warning.

Not yet: 流年 (annual transits), 合婚 pair analysis, the web app, LLM tutor layer.

## Mission boundaries

- Verdicts as weather, never sentences. Tool informs, user decides.
- 善人不为命所缚 — the good are not bound by fate. Every reading ends here.
- No predictive-certainty claims (health/death/money). No "scientific validity" claims — computational rigor + tradition.
- Birth data is held only under covenant: explicit opt-in, hashed, deletable, never minors.

## License

MIT — engine. Content (when it lands) CC-BY-SA.
