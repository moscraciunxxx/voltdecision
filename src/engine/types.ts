export const ROWS = 12;
export const COLS = 12;
export const N = ROWS * COLS;
export const DT_MS = 0.5;
export const STEPS = 160;
export const C_PF = 20;
export const G_LEAK_NS = 1.0;
export const E_LEAK_MV = -70;
export const G_GJ_NS = 2.5;
export const INJURY_PA = 190;
export const NOISE_PA = 2.2;
export const OFFICIAL_SEED = 20260905;

export type PolicyId = "baseline" | "repaired";

export type Electrode = {
  id: string;
  i: number;
  role: "wound" | "halo" | "seam-west" | "seam-east" | "far";
};

export type IncidentSpec = {
  seed: number;
  wound: number[];
  halo: number[];
  seamWestCol: number;
  seamEastCol: number;
  blockedEdges: Array<[number, number]>;
  electrodes: Electrode[];
  stuckElectrodeId: string;
  stuckValueMv: number;
  dtMs: number;
  steps: number;
};

export type PolicySpec = {
  id: PolicyId;
  version: string;
  kp: number;
  woundTargetMv: number;
  haloTargetMv: number;
  useFusion: boolean;
  ignoreStuck: boolean;
  ringCurrentPa: number;
  woundCurrentPa: number;
  seamBridgePa: number;
};

export type TickRecord = {
  t: number;
  v: Float64Array;
  observed: Record<string, number | null>;
  stimPa: Float64Array;
  injuryPa: Float64Array;
};

export type Diagnosis = {
  primary: string;
  confidence: number;
  ranked: Array<{ id: string; weight: number; why: string }>;
  flatlineIds: string[];
  seamResidualNsMv: number;
  invariantsBroken: string[];
};

export type ScoreBreakdown = {
  coordination: number;
  wound: number;
  halo: number;
  far: number;
  consensus: number;
  mispatternTicks: number;
  violated: string[];
};

export type RunResult = {
  incidentHash: string;
  policyHash: string;
  policyId: PolicyId;
  ticks: TickRecord[];
  diagnosis: Diagnosis;
  score: ScoreBreakdown;
  cgItersLast: number;
};
