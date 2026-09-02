import type { IncidentSpec, PolicySpec } from "./types";
import { COLS, N } from "./types";

/**
 * Controllers see electrodes only. Full V is hidden state.
 *
 * Baseline: PI on e-wound targeting rest. A channel stuck at rest
 * produces zero error, so injury current wins.
 *
 * Repaired: drop e-wound, fuse e-halo + e-seam-w, apply a hyperpolarizing
 * ring plus a weak current east of the uncoupled seam.
 */
export function applyPolicy(
  spec: IncidentSpec,
  policy: PolicySpec,
  observed: Record<string, number | null>,
  stim: Float64Array,
): void {
  stim.fill(0);

  if (!policy.useFusion) {
    const y = observed["e-wound"];
    if (y === null || y === undefined) return;
    const err = policy.woundTargetMv - y;
    const i = policy.kp * err;
    for (const w of spec.wound) stim[w] = i;
    return;
  }

  const haloObs = meanDefined([observed["e-halo"], observed["e-seam-w"]]);
  const eastObs = observed["e-seam-e"];
  const vWoundEst = haloObs ?? -20;

  const woundErr = policy.woundTargetMv - vWoundEst;
  const woundI = policy.woundCurrentPa + policy.kp * woundErr * 0.15;
  for (const w of spec.wound) stim[w] = woundI;

  if (policy.useRing !== false) {
    const haloErr = policy.haloTargetMv - (haloObs ?? -70);
    const ringI = policy.ringCurrentPa + policy.kp * haloErr * 0.08;
    for (const h of spec.halo) stim[h] = ringI;
  }

  if (policy.useBridge !== false && eastObs !== null && eastObs !== undefined) {
    const bridge = policy.seamBridgePa + 0.4 * (policy.haloTargetMv - eastObs);
    for (let i = 0; i < N; i++) {
      const c = i % COLS;
      if (c === spec.seamEastCol || c === spec.seamEastCol + 1) {
        stim[i] = (stim[i] ?? 0) + bridge * 0.12;
      }
    }
  }
}

function meanDefined(xs: Array<number | null | undefined>): number | null {
  const v = xs.filter((x): x is number => typeof x === "number");
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}
