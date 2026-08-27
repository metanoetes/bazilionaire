/** TEMP probe — reidentification fiber sizes for candidate wire payloads. Delete after. */
import { computeChart } from '@bazilionaire/engine';

const t0 = Date.now();

// One full sexagenary cycle (60y) so year-pillar logic is exercised exactly once.
// 2h step = exactly one sample per hour-branch per day (the hour pillar's own granularity).
const YEAR_FROM = 1961;
const YEAR_TO = 2020;

const CANDIDATES: Record<string, (c: any) => string> = {
  'day stem only': (c) => c.day[0],
  '+ strength verdict': (c) => `${c.day[0]}|${c.strength.verdict}`,
  '+ pattern name': (c) => `${c.day[0]}|${c.strength.verdict}|${c.pattern.primary.name}`,
  'day pillar (stem+branch)': (c) => c.day,
  'day + month pillar': (c) => `${c.day}|${c.month}`,
  'year + month + day': (c) => `${c.year}|${c.month}|${c.day}`,
  'all four pillars': (c) => `${c.year}|${c.month}|${c.day}|${c.time}`,
};

const keys = Object.keys(CANDIDATES);
const fns = Object.values(CANDIDATES);
const buckets = keys.map(() => new Map<string, number>());

let n = 0;
let failed = 0;
for (let y = YEAR_FROM; y <= YEAR_TO; y++) {
  for (let m = 1; m <= 12; m++) {
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let d = 1; d <= dim; d++) {
      for (let h = 0; h < 24; h += 2) {
        let c: any;
        try { c = computeChart(y, m, d, h, 0, undefined, 1, 'clock'); } catch { failed++; continue; }
        n++;
        for (let i = 0; i < fns.length; i++) {
          const k = fns[i](c);
          buckets[i].set(k, (buckets[i].get(k) ?? 0) + 1);
        }
      }
    }
  }
  if (y % 10 === 0) console.log(`  ...${y} (${n} moments, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

const stats = (b: Map<string, number>) => {
  const sizes = [...b.values()].sort((x, y) => x - y);
  const total = sizes.reduce((a, v) => a + v, 0);
  let acc = 0;
  let wMedian = sizes[0];
  for (const s of sizes) { acc += s; if (acc >= total / 2) { wMedian = s; break; } }
  return { vectors: b.size, min: sizes[0], p05: sizes[Math.floor(0.05 * (sizes.length - 1))], med: wMedian, singletons: sizes.filter((s) => s === 1).length };
};

console.log('');
console.log(`swept ${n} birth moments (${YEAR_FROM}-${YEAR_TO}, 2h step, one gender), ${failed} failed, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('');
console.log('payload'.padEnd(28) + 'vectors'.padStart(9) + 'minFiber'.padStart(10) + 'p05'.padStart(8) + 'medFiber'.padStart(10) + 'singletons'.padStart(12));
keys.forEach((k, i) => {
  const s = stats(buckets[i]);
  console.log(k.padEnd(28) + String(s.vectors).padStart(9) + String(s.min).padStart(10) + String(s.p05).padStart(8) + String(s.med).padStart(10) + String(s.singletons).padStart(12));
});
