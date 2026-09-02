import { describe, expect, it } from "vitest";
import { replayContract, runLab } from "./run";
import { OFFICIAL_SEED } from "./types";

describe("official VoltDecision incident", () => {
  const baseline = runLab({ seed: OFFICIAL_SEED, policy: "baseline" });
  const repaired = runLab({ seed: OFFICIAL_SEED, policy: "repaired" });

  it("is deterministic across two baseline runs", () => {
    const again = runLab({ seed: OFFICIAL_SEED, policy: "baseline" });
    expect(again.incidentHash).toBe(baseline.incidentHash);
    expect(again.policyHash).toBe(baseline.policyHash);
    expect(again.score.coordination).toBe(baseline.score.coordination);
    expect(again.score.mispatternTicks).toBe(baseline.score.mispatternTicks);
  });

  it("keeps the same incident hash and a different policy hash under replay", () => {
    const c = replayContract(baseline, repaired);
    expect(c.sameIncident).toBe(true);
    expect(c.differentPolicy).toBe(true);
    expect(baseline.incidentHash).toHaveLength(16);
  });

  it("lets the baseline miss the wound-closure decision", () => {
    expect(baseline.score.coordination).toBe(9);
    expect(baseline.score.violated).toContain("halo-hyperpolarization");
    expect(baseline.score.mispatternTicks).toBe(152);
  });

  it("ranks the stuck wound electrode first from traces only", () => {
    expect(baseline.diagnosis.primary).toBe("electrode:e-wound");
    expect(baseline.diagnosis.flatlineIds).toContain("e-wound");
    expect(baseline.diagnosis.confidence).toBeGreaterThanOrEqual(0.7);
    expect(baseline.diagnosis.invariantsBroken).toContain("gap-junction-continuity");
  });

  it("raises Coordination Score after the inspectable repair", () => {
    expect(repaired.score.coordination).toBe(94);
    expect(repaired.score.mispatternTicks).toBe(0);
    expect(repaired.score.halo).toBeGreaterThan(0.5);
    expect(repaired.score.wound).toBeGreaterThan(0.5);
  });

  it("does not treat CG as a failed solve on the official mesh", () => {
    expect(baseline.cgItersLast).toBeLessThan(200);
    expect(repaired.cgItersLast).toBeLessThan(200);
  });

  it("locks the official hashes a judge can quote", () => {
    expect(baseline.incidentHash).toBe("7b11a7758c9b7cfc");
    expect(baseline.policyHash).toBe("9c1ba8546fc879b9");
    expect(repaired.policyHash).toBe("aa5e1478d41aa24d");
  });
});
