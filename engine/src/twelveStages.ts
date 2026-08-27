/**
 * 十二长生 (shí èr cháng shēng) — the twelve stages of growth, mapping each
 * of the ten stems' life-cycle stage onto each of the twelve branches.
 * Yang stems run FORWARD from their own 长生 seat; yin stems run BACKWARD —
 * both directions verified byte-for-byte against the lunar_python oracle
 * (ec.getDayDiShi() swept across all stem×branch pairs), not re-derived from
 * a formula, per this project's pin-to-oracle convention (see tables.ts).
 * Curriculum module 9's honesty note ("the engine does not yet compute this
 * table") is superseded — this is that table.
 */
import { BRANCHES } from './sexagenary.js';

export type GrowthStage =
  | '长生' | '沐浴' | '冠带' | '临官' | '帝旺' | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养';

/** Stem → stage per branch, in BRANCHES order (子丑寅卯辰巳午未申酉戌亥). Oracle-verified. */
export const TWELVE_STAGES: Record<string, GrowthStage[]> = {
  甲: ['沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养', '长生'],
  乙: ['病', '衰', '帝旺', '临官', '冠带', '沐浴', '长生', '养', '胎', '绝', '墓', '死'],
  丙: ['胎', '养', '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝'],
  丁: ['绝', '墓', '死', '病', '衰', '帝旺', '临官', '冠带', '沐浴', '长生', '养', '胎'],
  戊: ['胎', '养', '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝'],
  己: ['绝', '墓', '死', '病', '衰', '帝旺', '临官', '冠带', '沐浴', '长生', '养', '胎'],
  庚: ['死', '墓', '绝', '胎', '养', '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病'],
  辛: ['长生', '养', '胎', '绝', '墓', '死', '病', '衰', '帝旺', '临官', '冠带', '沐浴'],
  壬: ['帝旺', '衰', '病', '死', '墓', '绝', '胎', '养', '长生', '沐浴', '冠带', '临官'],
  癸: ['临官', '冠带', '沐浴', '长生', '养', '胎', '绝', '墓', '死', '病', '衰', '帝旺'],
};

/** The stem's growth stage at a given branch (e.g. twelveStageOf('甲', '亥') === '长生'). */
export function twelveStageOf(stem: string, branch: string): GrowthStage {
  const row = TWELVE_STAGES[stem];
  const idx = BRANCHES.indexOf(branch as (typeof BRANCHES)[number]);
  return row[idx];
}

/** 帝旺/临官/长生 read as a real root (peak-strength seats); 死/绝/病 read as the weakest. */
export const STRONG_STAGES: ReadonlySet<GrowthStage> = new Set(['长生', '临官', '帝旺']);
export const WEAK_STAGES: ReadonlySet<GrowthStage> = new Set(['死', '绝', '病']);
