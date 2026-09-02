import { describe, expect, it } from "vitest";
import { haloStuckGeometry } from "./geometry";
import { runLab } from "./run";
import { sweepOfficialGj } from "./sweep";

describe("stuck e-halo on official geometry", () => {
  const spec = haloStuckGeometry();
  const baseline = runLab({ spec, policy: "baseline" });
  const repaired = runLab({ spec, policy: "repaired" });

  it("is a different incident than the official stuck-wound seed", () => {
    expect(spec.stuckElectrodeId).toBe("e-halo");
    expect(baseline.incidentHash).not.toBe("7b11a7758c9b7cfc");
    expect(repaired.policyHash).toBe("aa5e1478d41aa24d");
  });

  it("names the stuck halo from traces", () => {
    expect(baseline.diagnosis.primary).toBe("electrode:e-halo");
    expect(baseline.diagnosis.flatlineIds).toContain("e-halo");
  });

  it("lets baseline see the wound (score 62) and does not pretend the repair fails", () => {
    expect(baseline.incidentHash).toBe("63539524c7f5899b");
    expect(baseline.score.coordination).toBe(62);
    expect(baseline.score.violated).toContain("halo-hyperpolarization");
    expect(repaired.score.coordination).toBe(94);
    expect(repaired.score.mispatternTicks).toBe(0);
  });
});

describe("official G_GJ sweep", () => {
  it("keeps 9 / 94 at the official 2.5 nS point", () => {
    const pts = sweepOfficialGj();
    const mid = pts.find((p) => p.gGjNs === 2.5);
    expect(mid?.baseline).toBe(9);
    expect(mid?.repaired).toBe(94);
    expect(pts.find((p) => p.gGjNs === 0.5)?.repaired).toBe(53);
    expect(pts.find((p) => p.gGjNs === 1)?.repaired).toBe(74);
  });
});
