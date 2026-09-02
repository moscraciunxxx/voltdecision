import { hashCanonical } from "./hash";
import type { PolicySpec } from "./types";

export const BASELINE_POLICY: PolicySpec = {
  id: "baseline",
  version: "single-electrode-pi-v1",
  kp: 6.0,
  woundTargetMv: -70,
  haloTargetMv: -70,
  useFusion: false,
  ignoreStuck: false,
  ringCurrentPa: 0,
  woundCurrentPa: 0,
  seamBridgePa: 0,
};

export const REPAIRED_POLICY: PolicySpec = {
  id: "repaired",
  version: "kcl-fusion-ring-v1",
  kp: 4.5,
  woundTargetMv: -52,
  haloTargetMv: -88,
  useFusion: true,
  ignoreStuck: true,
  ringCurrentPa: -145,
  woundCurrentPa: -95,
  seamBridgePa: -40,
};

/** Official seed only. Fusion off → e-wound PI to rest (stuck ⇒ error 0). */
export const NO_FUSION_POLICY: PolicySpec = {
  ...REPAIRED_POLICY,
  id: "no-fusion",
  version: "ablate-fusion-v1",
  useFusion: false,
  ignoreStuck: false,
  woundTargetMv: -70,
};

export const NO_RING_POLICY: PolicySpec = {
  ...REPAIRED_POLICY,
  id: "no-ring",
  version: "ablate-ring-v1",
  ringCurrentPa: 0,
  useRing: false,
};

export const NO_BRIDGE_POLICY: PolicySpec = {
  ...REPAIRED_POLICY,
  id: "no-bridge",
  version: "ablate-bridge-v1",
  seamBridgePa: 0,
  useBridge: false,
};

export function policyHash(p: PolicySpec): string {
  return hashCanonical(p);
}

export function incidentPayload(spec: {
  seed: number;
  wound: number[];
  halo: number[];
  blockedEdges: Array<[number, number]>;
  stuckElectrodeId: string;
  stuckValueMv: number;
  dtMs: number;
  steps: number;
}): Record<string, unknown> {
  return {
    seed: spec.seed,
    wound: [...spec.wound].sort((a, b) => a - b),
    halo: [...spec.halo].sort((a, b) => a - b),
    blockedEdges: spec.blockedEdges.map(([a, b]) => [a, b]),
    stuckElectrodeId: spec.stuckElectrodeId,
    stuckValueMv: spec.stuckValueMv,
    dtMs: spec.dtMs,
    steps: spec.steps,
  };
}
