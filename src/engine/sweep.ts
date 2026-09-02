import { officialGeometry } from "./geometry";
import { runLab } from "./run";
import { G_GJ_NS } from "./types";

export const GJ_SWEEP_NS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4] as const;

export type GjSweepPoint = {
  gGjNs: number;
  baseline: number;
  repaired: number;
};

export function sweepOfficialGj(): GjSweepPoint[] {
  const base = officialGeometry();
  return GJ_SWEEP_NS.map((gGjNs) => {
    const spec = { ...base, gGjNs };
    return {
      gGjNs,
      baseline: runLab({ spec, policy: "baseline" }).score.coordination,
      repaired: runLab({ spec, policy: "repaired" }).score.coordination,
    };
  });
}

export function isOfficialGj(g: number): boolean {
  return Math.abs(g - G_GJ_NS) < 1e-9;
}
