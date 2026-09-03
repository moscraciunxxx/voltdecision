import { useMemo, useRef, useState } from "react";
import { haloStuckGeometry, heldOutGeometry, officialGeometry, rc } from "../engine/geometry";
import { kclResidualAssumingFullCoupling, maxAbs } from "../engine/residual";
import { runLab } from "../engine/run";
import { sweepOfficialGj } from "../engine/sweep";
import { E_LEAK_MV, G_GJ_NS, N, type IncidentSpec, type RunResult } from "../engine/types";
import { FieldMap } from "./FieldMap";
import { SweepChart } from "./SweepChart";
import { TracePlot } from "./TracePlot";

type Phase = "idle" | "baseline" | "repaired";
type IncidentId = "official" | "held-out" | "halo-stuck";

function specFor(id: IncidentId, gGjNs: number): IncidentSpec {
  if (id === "held-out") return heldOutGeometry();
  if (id === "halo-stuck") return haloStuckGeometry();
  return { ...officialGeometry(), gGjNs };
}

function cellKind(spec: IncidentSpec, i: number): string {
  if (spec.wound.includes(i)) return "wound";
  if (spec.halo.includes(i)) return "halo";
  const { c } = rc(i);
  if (c === spec.seamWestCol || c === spec.seamEastCol) return "seam column";
  const elec = spec.electrodes.find((e) => e.i === i);
  if (elec) return `electrode ${elec.id}`;
  return "far field";
}

export function App() {
  const proofs = useMemo(() => {
    const official = officialGeometry();
    const held = heldOutGeometry();
    return {
      officialB: runLab({ spec: official, policy: "baseline" }),
      officialR: runLab({ spec: official, policy: "repaired" }),
      heldB: runLab({ spec: held, policy: "baseline" }),
      heldR: runLab({ spec: held, policy: "repaired" }),
      noFusion: runLab({ spec: official, policy: "no-fusion" }),
      noRing: runLab({ spec: official, policy: "no-ring" }),
      noBridge: runLab({ spec: official, policy: "no-bridge" }),
      haloB: runLab({ spec: haloStuckGeometry(), policy: "baseline" }),
      haloR: runLab({ spec: haloStuckGeometry(), policy: "repaired" }),
      sweep: sweepOfficialGj(),
    };
  }, []);

  const [incident, setIncident] = useState<IncidentId>("official");
  const [gGjNs, setGGjNs] = useState(G_GJ_NS);
  const spec = useMemo(() => specFor(incident, gGjNs), [incident, gGjNs]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [baseline, setBaseline] = useState<RunResult | null>(null);
  const [repaired, setRepaired] = useState<RunResult | null>(null);
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<"voltage" | "residual">("voltage");
  const [selected, setSelected] = useState<number | null>(null);
  const replayTimer = useRef<number | null>(null);

  function clearReplayTimer() {
    if (replayTimer.current != null) {
      window.clearTimeout(replayTimer.current);
      replayTimer.current = null;
    }
  }

  const restField = useMemo(() => {
    const v = new Float64Array(N);
    v.fill(E_LEAK_MV);
    return v;
  }, []);

  const active = phase === "repaired" ? repaired : baseline;
  const frame = active?.ticks[Math.min(tick, (active.ticks.length || 1) - 1)] ?? null;
  const baseFrame = baseline?.ticks[Math.min(tick, (baseline.ticks.length || 1) - 1)] ?? null;
  const repairFrame = repaired?.ticks[Math.min(tick, (repaired.ticks.length || 1) - 1)] ?? null;

  const residual = useMemo(() => {
    if (!frame) return null;
    const iTotal = new Float64Array(frame.v.length);
    for (let i = 0; i < iTotal.length; i++) iTotal[i] = frame.injuryPa[i]! + frame.stimPa[i]!;
    return kclResidualAssumingFullCoupling(frame.v, iTotal);
  }, [frame]);

  const residualBase = useMemo(() => {
    if (!baseFrame) return null;
    const iTotal = new Float64Array(baseFrame.v.length);
    for (let i = 0; i < iTotal.length; i++) iTotal[i] = baseFrame.injuryPa[i]! + baseFrame.stimPa[i]!;
    return kclResidualAssumingFullCoupling(baseFrame.v, iTotal);
  }, [baseFrame]);

  const residualRepair = useMemo(() => {
    if (!repairFrame) return null;
    const iTotal = new Float64Array(repairFrame.v.length);
    for (let i = 0; i < iTotal.length; i++) iTotal[i] = repairFrame.injuryPa[i]! + repairFrame.stimPa[i]!;
    return kclResidualAssumingFullCoupling(repairFrame.v, iTotal);
  }, [repairFrame]);

  const lock =
    incident === "held-out"
      ? { from: proofs.heldB, to: proofs.heldR, name: "Held-out lock" }
      : incident === "halo-stuck"
        ? { from: proofs.haloB, to: proofs.haloR, name: "Stuck e-halo lock" }
        : { from: proofs.officialB, to: proofs.officialR, name: "Official lock" };
  const lockFrom = lock.from.score.coordination;
  const lockTo = lock.to.score.coordination;
  const score = phase === "idle" ? null : (active?.score.coordination ?? null);
  const scoreTone = phase === "idle" ? "is-lock" : score !== null && score < 30 ? "is-low" : score !== null && score >= 80 ? "is-high" : "";

  function runIncident() {
    clearReplayTimer();
    const b = runLab({ spec, policy: "baseline" });
    setBaseline(b);
    setRepaired(null);
    setPhase("baseline");
    setTick(b.ticks.length - 1);
    setMode("voltage");
  }

  function replayRepair() {
    clearReplayTimer();
    const r = runLab({ spec, policy: "repaired" });
    setRepaired(r);
    setPhase("repaired");
    setTick(r.ticks.length - 1);
    setMode("voltage");
  }

  function replayLock() {
    clearReplayTimer();
    const b = runLab({ spec, policy: "baseline" });
    setBaseline(b);
    setRepaired(null);
    setPhase("baseline");
    setTick(b.ticks.length - 1);
    setMode("voltage");
    replayTimer.current = window.setTimeout(() => {
      const r = runLab({ spec, policy: "repaired" });
      setRepaired(r);
      setPhase("repaired");
      setTick(r.ticks.length - 1);
    }, 1100);
  }

  function reset() {
    clearReplayTimer();
    setPhase("idle");
    setBaseline(null);
    setRepaired(null);
    setTick(0);
    setSelected(null);
  }

  function switchIncident(id: IncidentId) {
    clearReplayTimer();
    setIncident(id);
    setPhase("idle");
    setBaseline(null);
    setRepaired(null);
    setTick(0);
    setSelected(null);
  }

  const inspect =
    selected != null && frame
      ? {
          i: selected,
          ...rc(selected),
          v: frame.v[selected]!,
          inj: frame.injuryPa[selected]!,
          stim: frame.stimPa[selected]!,
          kcl: residual?.[selected] ?? 0,
          kind: cellKind(spec, selected),
        }
      : null;

  const lastKcl = residual ? maxAbs(residual) : null;

  return (
    <div className="page">
      <header className="mast">
        <div>
          <p className="kicker">VoltHacks 2026 · digital twin · no hardware claimed</p>
          <h1>VoltDecision</h1>
          <p className="lede">
            Inject a voltage pattern. Watch tissue decide. Repair the policy. Prove the replay.
          </p>
        </div>
        <div className={`hud ${scoreTone}`} aria-live="polite">
          <div className="hud-value">{phase === "idle" ? `${lockFrom} → ${lockTo}` : score}</div>
          <div className="hud-label">
            {phase === "idle"
              ? `${lock.name} · Coordination Score`
              : phase === "baseline"
                ? `Baseline live · lock ${lockTo}`
                : `Repaired live · lock ${lockFrom} → ${lockTo}`}
          </div>
          {phase === "idle" && (
            <>
              <div className="hud-sub">one tap Replay {lockFrom} → {lockTo} — you will see the lie, then the repair</div>
              <div className="parts">
                <span>baseline {lockFrom}</span>
                <span>repaired {lockTo}</span>
                <span>wound {lock.to.score.wound.toFixed(2)}</span>
                <span>halo {lock.to.score.halo.toFixed(2)}</span>
              </div>
            </>
          )}
          {active && (
            <>
              <div className="hud-sub">
                {phase === "baseline"
                  ? `live ${score} · lock still ${lockTo} · Apply repair next`
                  : `${active.score.mispatternTicks} mispattern ticks · ${active.score.violated.length} invariants down`}
              </div>
              <div className="parts">
                <span>wound {active.score.wound.toFixed(2)}</span>
                <span>halo {active.score.halo.toFixed(2)}</span>
                <span>far {active.score.far.toFixed(2)}</span>
                <span>consensus {active.score.consensus.toFixed(2)}</span>
              </div>
              <div className="hud-sub">
                CG {active.cgItersLast} iters · max |KCL| {active.maxAbsKcl.toFixed(0)} pA
                {lastKcl != null ? ` · this frame ${lastKcl.toFixed(0)} pA` : ""}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="actions">
        <div className="incident-switch" role="tablist" aria-label="Incident">
          <button type="button" className={incident === "official" ? "on" : ""} onClick={() => switchIncident("official")}>
            Official seed 20260905
          </button>
          <button type="button" className={incident === "held-out" ? "on" : ""} onClick={() => switchIncident("held-out")}>
            Held-out seed 20260912
          </button>
          <button type="button" className={incident === "halo-stuck" ? "on" : ""} onClick={() => switchIncident("halo-stuck")}>
            Stuck e-halo
          </button>
        </div>
        <button type="button" className="primary" onClick={replayLock}>
          Replay {lockFrom} → {lockTo}
        </button>
        <button type="button" onClick={runIncident}>
          Run incident only
        </button>
        <button type="button" disabled={!baseline} onClick={replayRepair}>
          Apply repair &amp; replay
        </button>
        <button type="button" className="ghost" onClick={reset} disabled={phase === "idle"}>
          Reset
        </button>
        <div className="phase-tag">
          {incident} · {phase === "idle" ? "idle" : phase === "baseline" ? "baseline policy" : "repaired policy"}
        </div>
      </div>

      <section className="stage">
        <div className="stage-main">
          <div className={repaired ? "fields split" : "fields"}>
            {repaired && baseFrame ? (
              <>
                <FieldMap
                  v={baseFrame.v}
                  spec={spec}
                  residual={residualBase}
                  mode={mode}
                  selected={selected}
                  onSelect={setSelected}
                  label={`Baseline · score ${baseline?.score.coordination ?? "—"}`}
                />
                <FieldMap
                  v={repairFrame?.v ?? restField}
                  spec={spec}
                  residual={residualRepair}
                  mode={mode}
                  selected={selected}
                  onSelect={setSelected}
                  label={`Repaired · score ${repaired.score.coordination}`}
                />
              </>
            ) : (
              <FieldMap
                v={frame?.v ?? restField}
                spec={spec}
                residual={residual}
                mode={mode}
                selected={selected}
                onSelect={setSelected}
                label={phase === "idle" ? "Rest field −70 mV · click a cell" : "Baseline field · click a cell"}
              />
            )}
          </div>
          <div className="legend">
            <span className="swatch hyper" /> hyperpolarized
            <span className="swatch rest" /> rest −70 mV
            <span className="swatch depol" /> depolarized
            <span className="swatch seam" /> open GJ seam
            <span className="swatch elec" /> electrode
          </div>
          <div className="scrub">
            <label>
              t = {frame ? frame.t.toFixed(1) : "0.0"} ms
              <input
                type="range"
                min={0}
                max={Math.max((active?.ticks.length ?? 1) - 1, 0)}
                value={tick}
                disabled={!active}
                onChange={(e) => setTick(Number(e.target.value))}
              />
            </label>
            <div className="toggles">
              <button type="button" className={mode === "voltage" ? "on" : ""} onClick={() => setMode("voltage")}>
                V<sub>m</sub>
              </button>
              <button
                type="button"
                className={mode === "residual" ? "on" : ""}
                onClick={() => setMode("residual")}
                disabled={!frame}
              >
                KCL residual
              </button>
            </div>
          </div>
          <TracePlot
            ticks={baseline?.ticks ?? []}
            overlayTicks={repaired?.ticks}
            title={
              repaired
                ? "Electrode traces — solid baseline, dashed repaired. The lie stays on the stuck channel."
                : baseline
                  ? "Baseline electrode traces — the controller’s only inputs"
                  : "Electrode traces"
            }
          />
          {inspect && (
            <dl className="inspector">
              <div>
                <dt>cell</dt>
                <dd>
                  r{inspect.r} c{inspect.c} · {inspect.kind}
                </dd>
              </div>
              <div>
                <dt>V<sub>m</sub></dt>
                <dd>{inspect.v.toFixed(2)} mV</dd>
              </div>
              <div>
                <dt>I<sup>inj</sup></dt>
                <dd>{inspect.inj.toFixed(1)} pA</dd>
              </div>
              <div>
                <dt>I<sup>π</sup></dt>
                <dd>{inspect.stim.toFixed(1)} pA</dd>
              </div>
              <div>
                <dt>KCL residual</dt>
                <dd>{inspect.kcl.toFixed(1)} pA</dd>
              </div>
            </dl>
          )}
        </div>

        <aside className="panel">
          <h2>
            {incident === "official"
              ? "Official compound incident"
              : incident === "held-out"
                ? "Held-out compound incident"
                : "Third fault — stuck e-halo"}
          </h2>
          {incident === "official" ? (
            <ol>
              <li>Injury current on the left wound (depolarizing).</li>
              <li>Gap junctions uncoupled on the col-3 / col-4 seam.</li>
              <li>
                Electrode <code>e-wound</code> stuck at −70 mV (reports rest).
              </li>
              <li>Baseline policy is single-electrode PI to rest — error is zero, so it never stims.</li>
            </ol>
          ) : incident === "held-out" ? (
            <ol>
              <li>Same failure class, mirrored: injury on a right-edge wound.</li>
              <li>Gap junctions uncoupled on the col-7 / col-8 seam.</li>
              <li>
                <code>e-wound</code> still stuck at −70 mV — electrodes were remapped, policy was not.
              </li>
              <li>Repaired policy hash stays <code>aa5e1478d41aa24d</code>. Score is 11 → 89, not a fitted 94.</li>
            </ol>
          ) : (
            <ol>
              <li>Official wound and seam. The lie moves: <code>e-halo</code> is stuck at −70 mV.</li>
              <li>Baseline can see the wound, so it is no longer helpless — score 62, halo still fails.</li>
              <li>Repaired fusion drinks the stuck halo plus <code>e-seam-w</code>. Score stays 94. We do not pretend it failed.</li>
              <li>Incident hash <code>63539524c7f5899b</code>. Official 9 → 94 is not retuned.</li>
            </ol>
          )}
          <p className="note">
            Controllers see five electrodes only. The 12×12 field is hidden state. Implicit Euler on the Kirchhoff
            graph, 0.5 ms × 160 steps. Click a cell for units.
          </p>

          {baseline && (
            <>
              <h2>Baseline diagnosis (from traces)</h2>
              <p className="primary-cause">
                {baseline.diagnosis.primary} <span>conf {baseline.diagnosis.confidence.toFixed(2)}</span>
              </p>
              <ul className="ranked">
                {baseline.diagnosis.ranked.map((c) => (
                  <li key={c.id}>
                    <strong>{c.id}</strong>
                    <span>{c.why}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {baseline && repaired && (
            <>
              <h2>Replay contract</h2>
              <dl className="hashes">
                <div>
                  <dt>Incident input</dt>
                  <dd>
                    <code>{baseline.incidentHash}</code>
                    {baseline.incidentHash === repaired.incidentHash ? " · match" : " · mismatch"}
                  </dd>
                </div>
                <div>
                  <dt>Baseline policy</dt>
                  <dd>
                    <code>{baseline.policyHash}</code>
                  </dd>
                </div>
                <div>
                  <dt>Repaired policy</dt>
                  <dd>
                    <code>{repaired.policyHash}</code>
                  </dd>
                </div>
              </dl>
              <p className="note">
                Same seed. Same injury. Same stuck channel. Same open seam. Different policy hash. Coordination Score{" "}
                {baseline.score.coordination} → {repaired.score.coordination}.
              </p>
            </>
          )}
        </aside>
      </section>

      <section className="proofs">
        <h2>Held-out transfer · same repaired policy</h2>
        <p className="note">
          Seed <code>20260912</code> was not used to write the controller. Incident hash{" "}
          <code>{proofs.heldB.incidentHash}</code> ≠ official <code>{proofs.officialB.incidentHash}</code>. Policy hash
          stays <code>{proofs.officialR.policyHash}</code>.
        </p>
        <table className="matrix">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Baseline</th>
              <th>Repaired</th>
              <th>Incident hash</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Official 20260905</td>
              <td className="num low">{proofs.officialB.score.coordination}</td>
              <td className="num high">{proofs.officialR.score.coordination}</td>
              <td>
                <code>{proofs.officialB.incidentHash}</code>
              </td>
            </tr>
            <tr>
              <td>Held-out 20260912</td>
              <td className="num low">{proofs.heldB.score.coordination}</td>
              <td className="num high">{proofs.heldR.score.coordination}</td>
              <td>
                <code>{proofs.heldB.incidentHash}</code>
              </td>
            </tr>
            <tr>
              <td>Stuck e-halo (official mesh)</td>
              <td className="num">{proofs.haloB.score.coordination}</td>
              <td className="num high">{proofs.haloR.score.coordination}</td>
              <td>
                <code>{proofs.haloB.incidentHash}</code>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          Stuck <code>e-halo</code> is a different lie. Baseline is 62, not 9 — it can see the wound. Repair still
          94. Shown because it is true, not because we needed a third win.
        </p>

        <h2>Official-seed ablation</h2>
        <p className="note">
          Drop one piece of the repaired policy. Fusion and the hyperpolarizing ring are required for 94. The seam
          bridge is not — consensus moves 0.75 → 0.74. Say so.
        </p>
        <table className="matrix">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Score</th>
              <th>Mispattern ticks</th>
              <th>What was removed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>repaired (all three)</td>
              <td className="num high">{proofs.officialR.score.coordination}</td>
              <td className="num">{proofs.officialR.score.mispatternTicks}</td>
              <td>nothing</td>
            </tr>
            <tr>
              <td>no-fusion</td>
              <td className="num low">{proofs.noFusion.score.coordination}</td>
              <td className="num">{proofs.noFusion.score.mispatternTicks}</td>
              <td>halo fusion — e-wound PI to rest, error 0</td>
            </tr>
            <tr>
              <td>no-ring</td>
              <td className="num low">{proofs.noRing.score.coordination}</td>
              <td className="num">{proofs.noRing.score.mispatternTicks}</td>
              <td>hyperpolarizing ring on halo cells</td>
            </tr>
            <tr>
              <td>no-bridge</td>
              <td className="num high">{proofs.noBridge.score.coordination}</td>
              <td className="num">{proofs.noBridge.score.mispatternTicks}</td>
              <td>seam-east current — not required for 94</td>
            </tr>
          </tbody>
        </table>

        <h2>Kirchhoff claim — vary G<sub>GJ</sub></h2>
        <p className="note">
          One slider. Same official incident, same policies. The seam stays uncoupled. Baseline cannot use extra
          coupling because it never stims. Repair needs the graph; below 2 nS the halo does not close. Official lock
          remains 2.5 nS → 94. Moving the slider sets G<sub>GJ</sub> for the next <strong>Run incident</strong> on the
          official seed.
        </p>
        <SweepChart
          points={proofs.sweep}
          gGjNs={gGjNs}
          onPick={(g) => {
            setGGjNs(g);
            if (incident === "official") reset();
          }}
        />
      </section>

      <section className="arch">
        <h2>What is actually being solved</h2>
        <svg viewBox="0 0 920 86" className="arch-svg" role="img" aria-label="Architecture">
          <text x="8" y="38" fill="#e8ead8" fontSize="13">
            C V̇ = −gℓ(V−Eℓ) + Σ gij(Vj−Vi) + Iinj + Iπ
          </text>
          <text x="8" y="64" fill="#9aa08c" fontSize="12">
            implicit Euler · Jacobi-CG · electrode-only policy · FNV-1a replay hashes · held-out + ablation
          </text>
        </svg>
        <p className="scope">
          Hackathon prototype on simulated epithelium. Not a medical device, not a safety certification, not a claim
          that a dish was on this desk. Coordination Score is four pattern checks on the named incident. Held-out score
          89 is not a second official lock of 94.
        </p>
        <p className="scope">
          Monday path: a wet lab would next inject this repaired policy into five electrodes and keep the same replay
          hashes. This page is the twin. That dish is not here. The pattern class is wound current and gap-junction
          coupling (McCaig et al., Physiol. Rev. 2005; Levin, Cell 2021) — not a claim that those experiments ran here.
        </p>
      </section>
    </div>
  );
}
