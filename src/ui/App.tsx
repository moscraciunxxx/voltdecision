import { useMemo, useState } from "react";
import { officialGeometry } from "../engine/geometry";
import { kclResidualAssumingFullCoupling } from "../engine/residual";
import { runLab } from "../engine/run";
import { E_LEAK_MV, N, type RunResult } from "../engine/types";
import { FieldMap } from "./FieldMap";

type Phase = "idle" | "baseline" | "repaired";

export function App() {
  const spec = useMemo(() => officialGeometry(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const [baseline, setBaseline] = useState<RunResult | null>(null);
  const [repaired, setRepaired] = useState<RunResult | null>(null);
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<"voltage" | "residual">("voltage");

  const restField = useMemo(() => {
    const v = new Float64Array(N);
    v.fill(E_LEAK_MV);
    return v;
  }, []);
  const active = phase === "repaired" ? repaired : baseline;
  const frame = active?.ticks[Math.min(tick, (active.ticks.length || 1) - 1)] ?? null;
  const displayV = frame?.v ?? restField;
  const residual = useMemo(() => {
    if (!frame) return null;
    const iTotal = new Float64Array(frame.v.length);
    for (let i = 0; i < iTotal.length; i++) iTotal[i] = frame.injuryPa[i]! + frame.stimPa[i]!;
    return kclResidualAssumingFullCoupling(frame.v, iTotal);
  }, [frame]);

  const score = phase === "idle" ? null : (active?.score.coordination ?? null);
  const scoreTone = score === null ? "" : score < 30 ? "is-low" : score >= 80 ? "is-high" : "";

  function runIncident() {
    const b = runLab({ policy: "baseline" });
    setBaseline(b);
    setRepaired(null);
    setPhase("baseline");
    setTick(b.ticks.length - 1);
    setMode("voltage");
  }

  function replayRepair() {
    const r = runLab({ policy: "repaired" });
    setRepaired(r);
    setPhase("repaired");
    setTick(r.ticks.length - 1);
    setMode("voltage");
  }

  function reset() {
    setPhase("idle");
    setBaseline(null);
    setRepaired(null);
    setTick(0);
  }

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
          <div className="hud-value">{score === null ? "—" : score}</div>
          <div className="hud-label">Coordination Score</div>
          {active && (
            <div className="hud-sub">
              {active.score.mispatternTicks} mispattern ticks · {active.score.violated.length} invariants down
            </div>
          )}
        </div>
      </header>

      <div className="actions">
        <button type="button" className="primary" onClick={runIncident}>
          Run incident
        </button>
        <button type="button" disabled={!baseline} onClick={replayRepair}>
          Apply repair &amp; replay
        </button>
        <button type="button" className="ghost" onClick={reset} disabled={phase === "idle"}>
          Reset
        </button>
        <div className="phase-tag">{phase === "idle" ? "idle" : phase === "baseline" ? "baseline policy" : "repaired policy"}</div>
      </div>

      <section className="stage">
        <div className="stage-main">
          <FieldMap v={displayV} spec={spec} residual={residual} mode={mode} />
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
              <button type="button" className={mode === "residual" ? "on" : ""} onClick={() => setMode("residual")} disabled={!frame}>
                KCL residual
              </button>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h2>Official compound incident</h2>
          <ol>
            <li>Injury current on the left wound (depolarizing).</li>
            <li>Gap junctions uncoupled on the col-3 / col-4 seam.</li>
            <li>
              Electrode <code>e-wound</code> stuck at −70 mV (reports rest).
            </li>
            <li>Baseline policy is single-electrode PI to rest — error is zero, so it never stims.</li>
          </ol>
          <p className="note">
            Controllers see five electrodes only. The 12×12 field is hidden state. Implicit Euler on
            the Kirchhoff graph, 0.5 ms × 160 steps.
          </p>

          {baseline && (
            <>
              <h2>Baseline diagnosis (from traces)</h2>
              <p className="primary-cause">
                {baseline.diagnosis.primary}{" "}
                <span>conf {baseline.diagnosis.confidence.toFixed(2)}</span>
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
                Same seed. Same injury. Same stuck channel. Same open seam. Different policy hash.
                Coordination Score {baseline.score.coordination} → {repaired.score.coordination}.
              </p>
            </>
          )}
        </aside>
      </section>

      <section className="arch">
        <h2>What is actually being solved</h2>
        <svg viewBox="0 0 920 86" className="arch-svg" role="img" aria-label="Architecture">
          <text x="8" y="38" fill="#e8ead8" fontSize="13">
            C V̇ = −gℓ(V−Eℓ) + Σ gij(Vj−Vi) + Iinj + Iπ
          </text>
          <text x="8" y="64" fill="#9aa08c" fontSize="12">
            implicit Euler · Jacobi-CG · electrode-only policy · FNV-1a replay hashes
          </text>
        </svg>
        <p className="scope">
          Hackathon prototype on simulated epithelium. Not a medical device, not a safety
          certification, not a claim that a dish was on this desk. The Coordination Score is scoped
          to this official incident’s four pattern checks.
        </p>
      </section>
    </div>
  );
}
