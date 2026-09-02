# VoltDecision

**Ten-second try:** https://moscraciunxxx.github.io/voltdecision/

Inject a voltage pattern. Watch tissue decide. Repair the policy. Prove the replay.

A deterministic digital twin of an epithelial voltage network. Cells couple through gap junctions (Kirchhoff / graph Laplacian). An official compound incident breaks a wound-closure decision. A single-electrode controller misses it. Residual diagnosis names the stuck electrode. An inspectable repair is replayed on the **same incident hash**. Coordination Score moves **9 → 94**.

The same repaired policy, not rewritten, is then run on a **held-out** mirrored incident (**11 → 89**). Ablation on the official seed: fusion and the hyperpolarizing ring are required; the seam bridge is not.

No physical hardware is connected. This is not a medical device.

## What a judge should see

1. Open the URL above. The first number is **Coordination Score**.
2. Click **Run incident**. Score becomes **9**. `e-wound` is a flat −70 mV trace. Diagnosis ranks it first.
3. Click **Apply repair & replay**. Split field. Score becomes **94**. Incident hash stays `7b11a7758c9b7cfc`. Policy hash changes.
4. Scroll to the 2×2 table: held-out seed `20260912` is **11 → 89** on policy hash `aa5e1478d41aa24d`.
5. Ablation: no-fusion **9**, no-ring **20**, no-bridge **94**.
6. Dashed traces are the repaired policy. **Stuck e-halo** is a third fault (baseline 62, repaired 94). The G<sub>GJ</sub> slider shows why coupling matters.

Click a cell for \(V_m\), \(I^{\mathrm{inj}}\), \(I^{\pi}\), KCL residual.

## Model (units: mV, nS, pF, pA, ms)

\[
C \dot V_i = -g_\ell(V_i - E_\ell) + \sum_j g_{ij}(V_j - V_i) + I_i^{\mathrm{inj}} + I_i^{\pi}
\]

Implicit Euler, Jacobi-preconditioned CG, 12×12 mesh, \(dt = 0.5\,\mathrm{ms}\), 160 steps. Controllers observe five electrodes only.

Official incident (seed `20260905`):

- Depolarizing injury current on a left-edge wound
- Gap junctions open (uncoupled) on the col-3 / col-4 seam
- `e-wound` stuck at rest (−70 mV)
- Baseline: PI on that channel toward rest → error 0 → no stim

Held-out incident (seed `20260912`): right-edge wound, seam col-7 / col-8, same stuck-electrode lie. Controller code is unchanged.

Coordination Score is scoped to four pattern checks on the named incident (wound repolarization, halo hyperpolarization, far-field rest, left–right consensus). It is not a reliability percentage or a certification.

## Verify locally

```bash
npm test
npm run build
```

`npm run dev` is for editing. The judged door is the GitHub Pages URL.

## License

MIT
