/**
 * Jacobi-preconditioned CG for A x = b with A SPD, stored as CSR.
 * Used for the implicit-Euler Kirchhoff step.
 */
export type Csr = {
  n: number;
  ptr: Int32Array;
  idx: Int32Array;
  val: Float64Array;
  diag: Float64Array;
};

export function csrFromCoo(n: number, rows: number[], cols: number[], vals: number[]): Csr {
  const counts = new Int32Array(n);
  for (const r of rows) counts[r] = (counts[r] ?? 0) + 1;
  const ptr = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) ptr[i + 1] = (ptr[i] ?? 0) + (counts[i] ?? 0);
  const idx = new Int32Array(rows.length);
  const val = new Float64Array(rows.length);
  const next = ptr.slice();
  const diag = new Float64Array(n);
  for (let k = 0; k < rows.length; k++) {
    const r = rows[k]!;
    const p = next[r]!;
    idx[p] = cols[k]!;
    val[p] = vals[k]!;
    next[r] = p + 1;
    if (cols[k] === r) diag[r] = vals[k]!;
  }
  return { n, ptr, idx, val, diag };
}

function axpy(y: Float64Array, a: number, x: Float64Array): void {
  for (let i = 0; i < y.length; i++) y[i]! += a * x[i]!;
}

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}

function spmv(A: Csr, x: Float64Array, y: Float64Array): void {
  y.fill(0);
  for (let i = 0; i < A.n; i++) {
    const a = A.ptr[i]!;
    const b = A.ptr[i + 1]!;
    let s = 0;
    for (let p = a; p < b; p++) s += A.val[p]! * x[A.idx[p]!]!;
    y[i] = s;
  }
}

export function cgSolve(A: Csr, b: Float64Array, x: Float64Array, opts?: { tol?: number; maxIt?: number }): number {
  const n = A.n;
  const tol = opts?.tol ?? 1e-10;
  const maxIt = opts?.maxIt ?? Math.max(80, n * 2);
  const r = new Float64Array(n);
  const z = new Float64Array(n);
  const p = new Float64Array(n);
  const ap = new Float64Array(n);
  spmv(A, x, r);
  for (let i = 0; i < n; i++) r[i] = b[i]! - r[i]!;
  for (let i = 0; i < n; i++) z[i] = r[i]! / Math.max(A.diag[i]!, 1e-18);
  p.set(z);
  let rz = dot(r, z);
  const bnorm = Math.sqrt(dot(b, b)) || 1;
  for (let it = 0; it < maxIt; it++) {
    if (Math.sqrt(dot(r, r)) / bnorm < tol) return it;
    spmv(A, p, ap);
    const alpha = rz / Math.max(dot(p, ap), 1e-18);
    axpy(x, alpha, p);
    axpy(r, -alpha, ap);
    for (let i = 0; i < n; i++) z[i] = r[i]! / Math.max(A.diag[i]!, 1e-18);
    const rzNext = dot(r, z);
    const beta = rzNext / Math.max(rz, 1e-18);
    for (let i = 0; i < n; i++) p[i] = z[i]! + beta * p[i]!;
    rz = rzNext;
  }
  return maxIt;
}
