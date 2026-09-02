import {
  COLS,
  E_LEAK_MV,
  Electrode,
  IncidentSpec,
  N,
  HELD_OUT_SEED,
  OFFICIAL_SEED,
  ROWS,
  STEPS,
  DT_MS,
} from "./types";

export function idx(r: number, c: number): number {
  return r * COLS + c;
}

export function rc(i: number): { r: number; c: number } {
  return { r: Math.floor(i / COLS), c: i % COLS };
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < ROWS && c < COLS;
}

const NEI: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function neighbors(i: number): number[] {
  const { r, c } = rc(i);
  const out: number[] = [];
  for (const [dr, dc] of NEI) {
    const rr = r + dr;
    const cc = c + dc;
    if (inBounds(rr, cc)) out.push(idx(rr, cc));
  }
  return out;
}

export function officialGeometry(): IncidentSpec {
  const wound: number[] = [];
  for (let r = 4; r <= 7; r++) {
    for (let c = 1; c <= 2; c++) wound.push(idx(r, c));
  }
  const woundSet = new Set(wound);
  const halo: number[] = [];
  for (const w of wound) {
    for (const n of neighbors(w)) {
      if (!woundSet.has(n) && !halo.includes(n)) halo.push(n);
    }
  }

  const seamWestCol = 3;
  const seamEastCol = 4;
  const blockedEdges: Array<[number, number]> = [];
  for (let r = 0; r < ROWS; r++) {
    const a = idx(r, seamWestCol);
    const b = idx(r, seamEastCol);
    blockedEdges.push([Math.min(a, b), Math.max(a, b)]);
  }

  const electrodes: Electrode[] = [
    { id: "e-wound", i: idx(5, 2), role: "wound" },
    { id: "e-halo", i: idx(5, 3), role: "halo" },
    { id: "e-seam-w", i: idx(6, 3), role: "seam-west" },
    { id: "e-seam-e", i: idx(6, 4), role: "seam-east" },
    { id: "e-far", i: idx(2, 10), role: "far" },
  ];

  return {
    seed: OFFICIAL_SEED,
    wound,
    halo,
    seamWestCol,
    seamEastCol,
    blockedEdges,
    electrodes,
    stuckElectrodeId: "e-wound",
    stuckValueMv: E_LEAK_MV,
    dtMs: DT_MS,
    steps: STEPS,
  };
}

export function farCells(spec: IncidentSpec): number[] {
  const skip = new Set([...spec.wound, ...spec.halo]);
  const out: number[] = [];
  for (let i = 0; i < N; i++) if (!skip.has(i)) out.push(i);
  return out;
}

export function leftBand(col = 2): number[] {
  const out: number[] = [];
  for (let r = 0; r < ROWS; r++) out.push(idx(r, col));
  return out;
}

export function rightBand(col = 9): number[] {
  const out: number[] = [];
  for (let r = 0; r < ROWS; r++) out.push(idx(r, col));
  return out;
}

/**
 * Held-out incident: same failure class, mirrored geometry.
 * Right-edge wound, seam col-7 / col-8, e-wound stuck at rest.
 * The repaired policy was not written against this seed.
 */
export function heldOutGeometry(): IncidentSpec {
  const wound: number[] = [];
  for (let r = 4; r <= 7; r++) {
    for (let c = 9; c <= 10; c++) wound.push(idx(r, c));
  }
  const woundSet = new Set(wound);
  const halo: number[] = [];
  for (const w of wound) {
    for (const n of neighbors(w)) {
      if (!woundSet.has(n) && !halo.includes(n)) halo.push(n);
    }
  }

  const seamWestCol = 7;
  const seamEastCol = 8;
  const blockedEdges: Array<[number, number]> = [];
  for (let r = 0; r < ROWS; r++) {
    const a = idx(r, seamWestCol);
    const b = idx(r, seamEastCol);
    blockedEdges.push([Math.min(a, b), Math.max(a, b)]);
  }

  const electrodes: Electrode[] = [
    { id: "e-wound", i: idx(5, 9), role: "wound" },
    { id: "e-halo", i: idx(5, 8), role: "halo" },
    { id: "e-seam-w", i: idx(6, 7), role: "seam-west" },
    { id: "e-seam-e", i: idx(6, 8), role: "seam-east" },
    { id: "e-far", i: idx(2, 1), role: "far" },
  ];

  return {
    seed: HELD_OUT_SEED,
    wound,
    halo,
    seamWestCol,
    seamEastCol,
    blockedEdges,
    electrodes,
    stuckElectrodeId: "e-wound",
    stuckValueMv: E_LEAK_MV,
    dtMs: DT_MS,
    steps: STEPS,
    scoreWestCol: 2,
    scoreEastCol: 8,
  };
}

/** Official geometry, different lie: e-halo stuck at rest. */
export function haloStuckGeometry(): IncidentSpec {
  return { ...officialGeometry(), stuckElectrodeId: "e-halo" };
}
