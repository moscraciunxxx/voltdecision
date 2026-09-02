import { E_LEAK_MV, type IncidentSpec, type ScoreBreakdown, type TickRecord } from "./types";
import { farCells, leftBand, rightBand } from "./geometry";

const WOUND_OK = -45;
const HALO_OK = -82;
const FAR_BAND = 12;

/**
 * Incident-scoped Coordination Score. Not a reliability %, not a
 * certification, not a calibrated probability. Four checks on this
 * official wound-closure pattern only.
 */
export function scoreRun(spec: IncidentSpec, ticks: TickRecord[]): ScoreBreakdown {
  const far = farCells(spec);
  const left = leftBand(spec.scoreWestCol ?? 2);
  const right = rightBand(spec.scoreEastCol ?? 9);
  let mispatternTicks = 0;
  const last = ticks[ticks.length - 1];
  if (!last) {
    return {
      coordination: 0,
      wound: 0,
      halo: 0,
      far: 0,
      consensus: 0,
      mispatternTicks: 0,
      violated: ["empty-run"],
    };
  }

  for (const tick of ticks) {
    const w = fraction(tick.v, spec.wound, (x) => x <= WOUND_OK);
    const h = fraction(tick.v, spec.halo, (x) => x <= HALO_OK);
    if (w < 0.5 && h < 0.5) mispatternTicks += 1;
  }

  const wound = fraction(last.v, spec.wound, (x) => x <= WOUND_OK);
  const halo = fraction(last.v, spec.halo, (x) => x <= HALO_OK);
  const farS = fraction(last.v, far, (x) => Math.abs(x - E_LEAK_MV) <= FAR_BAND);
  const jump = meanAbsDiff(last.v, left, right);
  const consensus = 1 - clamp(jump / 40, 0, 1);

  const raw = 100 * (0.34 * wound + 0.34 * halo + 0.16 * farS + 0.16 * consensus);
  const latePenalty = mispatternTicks > spec.steps * 0.85 ? 0.55 : mispatternTicks > spec.steps * 0.5 ? 0.8 : 1;
  const coordination = clamp(Math.round(raw * latePenalty), 0, 100);

  const violated: string[] = [];
  if (wound < 0.5) violated.push("wound-repolarization");
  if (halo < 0.5) violated.push("halo-hyperpolarization");
  if (farS < 0.5) violated.push("far-field-rest");
  if (consensus < 0.45) violated.push("left-right-consensus");

  return { coordination, wound, halo, far: farS, consensus, mispatternTicks, violated };
}

function fraction(v: Float64Array, cells: number[], pred: (x: number) => boolean): number {
  if (!cells.length) return 0;
  let n = 0;
  for (const i of cells) if (pred(v[i]!)) n += 1;
  return n / cells.length;
}

function meanAbsDiff(v: Float64Array, a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let s = 0;
  for (let k = 0; k < n; k++) s += Math.abs(v[a[k]!]! - v[b[k]!]!);
  return s / n;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
