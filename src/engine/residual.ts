import { E_LEAK_MV, G_GJ_NS, G_LEAK_NS, N } from "./types";
import { neighbors } from "./geometry";

/**
 * Kirchhoff residual assuming *intact* 2.5 nS junctions.
 * A blocked seam produces a large residual even though the true g_ij is 0.
 * Diagnostic map only — never fed back into the controller.
 */
export function kclResidualAssumingFullCoupling(v: Float64Array, iTotal: Float64Array): Float64Array {
  const r = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let iGj = 0;
    for (const j of neighbors(i)) iGj += G_GJ_NS * (v[j]! - v[i]!);
    r[i] = iGj - G_LEAK_NS * (v[i]! - E_LEAK_MV) + iTotal[i]!;
  }
  return r;
}

export function maxAbs(xs: Float64Array): number {
  let m = 0;
  for (let i = 0; i < xs.length; i++) m = Math.max(m, Math.abs(xs[i]!));
  return m;
}
