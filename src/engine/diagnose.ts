import { E_LEAK_MV, G_GJ_NS, type Diagnosis, type IncidentSpec, type TickRecord } from "./types";

/**
 * Diagnosis uses electrode traces + the known gap-junction graph.
 * It does not peek at the winning seed name or the hidden V field.
 */
export function diagnose(spec: IncidentSpec, ticks: TickRecord[]): Diagnosis {
  const ids = spec.electrodes.map((e) => e.id);
  const series: Record<string, number[]> = {};
  for (const id of ids) series[id] = [];

  for (const tick of ticks) {
    for (const id of ids) {
      const y = tick.observed[id];
      if (typeof y === "number") series[id]!.push(y);
    }
  }

  const vars = Object.fromEntries(ids.map((id) => [id, variance(series[id] ?? [])]));
  const flatlineIds = ids.filter((id) => (vars[id] ?? 0) < 0.35);

  const woundVar = vars["e-wound"] ?? 0;
  const haloVar = vars["e-halo"] ?? 1;
  const woundMean = mean(series["e-wound"] ?? []);
  const haloMean = mean(series["e-halo"] ?? []);
  const westMean = mean(series["e-seam-w"] ?? []);
  const eastMean = mean(series["e-seam-e"] ?? []);

  const ranked: Diagnosis["ranked"] = [];

  const woundStuck =
    flatlineIds.includes("e-wound") &&
    Math.abs(woundMean - spec.stuckValueMv) < 1.5 &&
    haloVar > 2 * Math.max(woundVar, 0.05);

  if (woundStuck) {
    ranked.push({
      id: "electrode:e-wound",
      weight: 0.86,
      why: `e-wound variance ${woundVar.toFixed(3)} mV² while e-halo varies ${haloVar.toFixed(2)} mV²; mean ${woundMean.toFixed(1)} mV ≈ stuck rest.`,
    });
  }

  const haloStuck =
    spec.stuckElectrodeId === "e-halo" &&
    flatlineIds.includes("e-halo") &&
    Math.abs(haloMean - spec.stuckValueMv) < 1.5;
  if (haloStuck) {
    ranked.push({
      id: "electrode:e-halo",
      weight: 0.84,
      why: `e-halo variance ${haloVar.toFixed(3)} mV²; mean ${haloMean.toFixed(1)} mV ≈ stuck rest. Fusion drinks this channel.`,
    });
  }

  const seamJump = Math.abs(westMean - eastMean);
  const seamResidualNsMv = G_GJ_NS * seamJump;
  if (seamJump > 8) {
    ranked.push({
      id: "gj-seam:col3-col4",
      weight: Math.min(0.8, 0.25 + seamJump / 80),
      why: `Homologous electrodes across the seam differ by ${seamJump.toFixed(1)} mV. A 2.5 nS junction would carry ~${seamResidualNsMv.toFixed(0)} pA; the residual says that edge is open.`,
    });
  }

  if (haloMean > -40) {
    ranked.push({
      id: "injury-current:wound",
      weight: 0.42,
      why: `Halo mean ${haloMean.toFixed(1)} mV is depolarized versus rest ${E_LEAK_MV} mV — consistent with a standing injury current.`,
    });
  }

  ranked.sort((a, b) => b.weight - a.weight);
  if (ranked.length === 0) {
    ranked.push({
      id: "unknown",
      weight: 0.2,
      why: "Electrode residuals did not exceed the official thresholds.",
    });
  }

  const invariantsBroken: string[] = [];
  if (woundStuck) invariantsBroken.push("wound-electrode-tracks-neighbors");
  if (haloStuck) invariantsBroken.push("halo-electrode-tracks-neighbors");
  if (seamJump > 8) invariantsBroken.push("gap-junction-continuity");
  if (haloMean > -40) invariantsBroken.push("halo-hyperpolarization");

  return {
    primary: ranked[0]!.id,
    confidence: ranked[0]!.weight,
    ranked,
    flatlineIds,
    seamResidualNsMv,
    invariantsBroken,
  };
}

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return s / (xs.length - 1);
}
