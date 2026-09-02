import { applyPolicy } from "./controller";
import { diagnose } from "./diagnose";
import { officialGeometry } from "./geometry";
import { hashCanonical } from "./hash";
import {
  BASELINE_POLICY,
  NO_BRIDGE_POLICY,
  NO_FUSION_POLICY,
  NO_RING_POLICY,
  REPAIRED_POLICY,
  incidentPayload,
  policyHash,
} from "./policy";
import { kclResidualAssumingFullCoupling, maxAbs } from "./residual";
import { scoreRun } from "./score";
import { assembleCoupling, injuryCurrent, makeNoise, stepTissue } from "./tissue";
import {
  E_LEAK_MV,
  N,
  type IncidentSpec,
  type PolicyId,
  type PolicySpec,
  type RunResult,
  type TickRecord,
} from "./types";

export function policyById(id: PolicyId): PolicySpec {
  switch (id) {
    case "repaired":
      return REPAIRED_POLICY;
    case "no-fusion":
      return NO_FUSION_POLICY;
    case "no-ring":
      return NO_RING_POLICY;
    case "no-bridge":
      return NO_BRIDGE_POLICY;
    default:
      return BASELINE_POLICY;
  }
}

export function resolvePolicy(policy?: PolicyId | PolicySpec): PolicySpec {
  if (!policy) return BASELINE_POLICY;
  if (typeof policy === "string") return policyById(policy);
  return policy;
}

export function runLab(opts?: { spec?: IncidentSpec; policy?: PolicyId | PolicySpec; seed?: number }): RunResult {
  const base = opts?.spec ?? officialGeometry();
  const spec: IncidentSpec = { ...base, seed: opts?.seed ?? base.seed };
  const policy = resolvePolicy(opts?.policy);
  const couple = assembleCoupling(spec);
  const v = new Float64Array(N);
  v.fill(E_LEAK_MV);
  const stim = new Float64Array(N);
  const injury = new Float64Array(N);
  const iTotal = new Float64Array(N);
  const rhs = new Float64Array(N);
  injuryCurrent(spec, injury);
  const noise = makeNoise(spec.seed);

  const ticks: TickRecord[] = [];
  let observed = readElectrodes(spec, v, true);
  let cgItersLast = 0;
  let maxAbsKcl = 0;

  for (let s = 0; s < spec.steps; s++) {
    applyPolicy(spec, policy, observed, stim);
    for (let i = 0; i < N; i++) iTotal[i] = injury[i]! + stim[i]! + noise(s, i);
    cgItersLast = stepTissue(couple, v, iTotal, rhs);
    observed = readElectrodes(spec, v, true);
    const resid = kclResidualAssumingFullCoupling(v, iTotal);
    maxAbsKcl = Math.max(maxAbsKcl, maxAbs(resid));
    ticks.push({
      t: (s + 1) * spec.dtMs,
      v: Float64Array.from(v),
      observed: { ...observed },
      stimPa: Float64Array.from(stim),
      injuryPa: Float64Array.from(injury),
    });
  }

  return {
    incidentHash: hashCanonical(incidentPayload(spec)),
    policyHash: policyHash(policy),
    policyId: policy.id,
    ticks,
    diagnosis: diagnose(spec, ticks),
    score: scoreRun(spec, ticks),
    cgItersLast,
    maxAbsKcl,
  };
}

function readElectrodes(
  spec: IncidentSpec,
  v: Float64Array,
  applyFault: boolean,
): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const e of spec.electrodes) {
    if (applyFault && e.id === spec.stuckElectrodeId) {
      out[e.id] = spec.stuckValueMv;
    } else {
      out[e.id] = v[e.i]!;
    }
  }
  return out;
}

export function replayContract(
  a: RunResult,
  b: RunResult,
): {
  sameIncident: boolean;
  differentPolicy: boolean;
} {
  return {
    sameIncident: a.incidentHash === b.incidentHash,
    differentPolicy: a.policyHash !== b.policyHash,
  };
}
