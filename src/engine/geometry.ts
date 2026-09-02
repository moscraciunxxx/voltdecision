import {
  COLS,
  E_LEAK_MV,
  Electrode,
  IncidentSpec,
  N,
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

export function leftBand(): number[] {
  const out: number[] = [];
  for (let r = 0; r < ROWS; r++) out.push(idx(r, 2));
  return out;
}

export function rightBand(): number[] {
  const out: number[] = [];
  for (let r = 0; r < ROWS; r++) out.push(idx(r, 9));
  return out;
}
