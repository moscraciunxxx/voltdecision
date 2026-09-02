import { describe, expect, it } from "vitest";
import { heldOutGeometry } from "./geometry";
import { replayContract, runLab } from "./run";

describe("held-out incident (seed 20260912)", () => {
  const spec = heldOutGeometry();
  const baseline = runLab({ spec, policy: "baseline" });
  const repaired = runLab({ spec, policy: "repaired" });

  it("is a different incident hash than the official seed", () => {
    expect(baseline.incidentHash).toBe("6a4940669c5ce2c2");
    expect(baseline.incidentHash).not.toBe("7b11a7758c9b7cfc");
  });

  it("keeps the official repaired policy hash — the controller was not rewritten", () => {
    expect(repaired.policyHash).toBe("aa5e1478d41aa24d");
    expect(replayContract(baseline, repaired).sameIncident).toBe(true);
    expect(replayContract(baseline, repaired).differentPolicy).toBe(true);
  });

  it("lets baseline miss the mirrored wound-closure decision", () => {
    expect(baseline.score.coordination).toBe(11);
    expect(baseline.score.mispatternTicks).toBe(152);
    expect(baseline.diagnosis.primary).toBe("electrode:e-wound");
  });

  it("raises Coordination Score without being fitted to 94", () => {
    expect(repaired.score.coordination).toBe(89);
    expect(repaired.score.mispatternTicks).toBe(0);
    expect(repaired.score.wound).toBeGreaterThan(0.5);
    expect(repaired.score.halo).toBeGreaterThan(0.5);
  });
});

describe("official-seed ablation", () => {
  it("needs fusion: no-fusion matches the blind baseline", () => {
    const r = runLab({ policy: "no-fusion" });
    expect(r.score.coordination).toBe(9);
    expect(r.score.mispatternTicks).toBe(152);
    expect(r.incidentHash).toBe("7b11a7758c9b7cfc");
    expect(r.policyHash).toBe("5266c5a56828891d");
  });

  it("needs the hyperpolarizing ring", () => {
    const r = runLab({ policy: "no-ring" });
    expect(r.score.coordination).toBe(20);
    expect(r.score.wound).toBeLessThan(0.5);
    expect(r.score.halo).toBeLessThan(0.5);
    expect(r.policyHash).toBe("b16a996122e3ee4e");
  });

  it("does not need the seam bridge for 94 — say so", () => {
    const r = runLab({ policy: "no-bridge" });
    expect(r.score.coordination).toBe(94);
    expect(r.score.mispatternTicks).toBe(0);
    expect(r.policyHash).toBe("03759b8e793589d7");
  });
});
