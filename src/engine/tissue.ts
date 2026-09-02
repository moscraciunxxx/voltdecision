import { csrFromCoo, cgSolve, type Csr } from "./linalg";
import { gauss, mulberry32 } from "./prng";
import {
  C_PF,
  E_LEAK_MV,
  G_GJ_NS,
  G_LEAK_NS,
  INJURY_PA,
  N,
  NOISE_PA,
  type IncidentSpec,
} from "./types";
import { neighbors } from "./geometry";

export type Coupling = {
  /** g_ij for i < j, 0 if blocked */
  g: Map<string, number>;
  A: Csr;
  buildRhs: (v: Float64Array, iTotal: Float64Array, out: Float64Array) => void;
};

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function assembleCoupling(spec: IncidentSpec): Coupling {
  const blocked = new Set(spec.blockedEdges.map(([a, b]) => edgeKey(a, b)));
  const g = new Map<string, number>();
  for (let i = 0; i < N; i++) {
    for (const j of neighbors(i)) {
      if (j < i) continue;
      const k = edgeKey(i, j);
      g.set(k, blocked.has(k) ? 0 : (spec.gGjNs ?? G_GJ_NS));
    }
  }

  const dt = spec.dtMs;
  const rows: number[] = [];
  const cols: number[] = [];
  const vals: number[] = [];
  const add = (r: number, c: number, v: number) => {
    rows.push(r);
    cols.push(c);
    vals.push(v);
  };

  for (let i = 0; i < N; i++) {
    let gsum = 0;
    for (const j of neighbors(i)) {
      const gg = g.get(edgeKey(i, j)) ?? 0;
      if (gg === 0) continue;
      gsum += gg;
      add(i, j, -gg);
    }
    // (C/dt + g_leak + Σ g_ij) V_i
    add(i, i, C_PF / dt + G_LEAK_NS + gsum);
  }

  const A = csrFromCoo(N, rows, cols, vals);
  const buildRhs = (v: Float64Array, iTotal: Float64Array, out: Float64Array) => {
    for (let i = 0; i < N; i++) {
      out[i] = (C_PF / dt) * v[i]! + G_LEAK_NS * E_LEAK_MV + iTotal[i]!;
    }
  };
  return { g, A, buildRhs };
}

export function injuryCurrent(spec: IncidentSpec, out: Float64Array): void {
  out.fill(0);
  for (const i of spec.wound) out[i] = INJURY_PA;
}

export function stepTissue(
  couple: Coupling,
  v: Float64Array,
  iTotal: Float64Array,
  scratch: Float64Array,
): number {
  couple.buildRhs(v, iTotal, scratch);
  return cgSolve(couple.A, scratch, v, { tol: 1e-9, maxIt: 220 });
}

export function makeNoise(seed: number): (step: number, i: number) => number {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  return () => NOISE_PA * gauss(rand);
}
