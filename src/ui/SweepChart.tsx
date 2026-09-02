import { G_GJ_NS } from "../engine/types";
import type { GjSweepPoint } from "../engine/sweep";

const W = 640;
const H = 180;
const PAD = { l: 36, r: 16, t: 12, b: 28 };

type Props = {
  points: GjSweepPoint[];
  gGjNs: number;
  onPick: (g: number) => void;
};

export function SweepChart({ points, gGjNs, onPick }: Props) {
  if (!points.length) return null;
  const gMin = points[0]!.gGjNs;
  const gMax = points[points.length - 1]!.gGjNs;
  const x = (g: number) => PAD.l + ((W - PAD.l - PAD.r) * (g - gMin)) / (gMax - gMin);
  const y = (s: number) => PAD.t + ((H - PAD.t - PAD.b) * (100 - s)) / 100;
  const baseD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.gGjNs).toFixed(1)},${y(p.baseline).toFixed(1)}`)
    .join(" ");
  const repD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.gGjNs).toFixed(1)},${y(p.repaired).toFixed(1)}`)
    .join(" ");
  const curX = x(gGjNs);
  const officialX = x(G_GJ_NS);

  return (
    <div className="sweep">
      <div className="traces-head">
        <strong>Coordination Score vs intact G<sub>GJ</sub></strong>
        <span>official geometry · blocked seam stays open · nS</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="trace-svg" role="img" aria-label="Score versus gap-junction conductance">
        <line x1={officialX} y1={PAD.t} x2={officialX} y2={H - PAD.b} className="rest-line" />
        <line x1={curX} y1={PAD.t} x2={curX} y2={H - PAD.b} stroke="#e8ead8" strokeWidth={1} />
        <path d={baseD} fill="none" stroke="#9a3b2f" strokeWidth={1.6} />
        <path d={repD} fill="none" stroke="#3d8f5a" strokeWidth={1.8} />
        {points.map((p) => (
          <g key={p.gGjNs}>
            <circle cx={x(p.gGjNs)} cy={y(p.baseline)} r={2.4} fill="#9a3b2f" />
            <circle cx={x(p.gGjNs)} cy={y(p.repaired)} r={2.4} fill="#3d8f5a" />
          </g>
        ))}
        <text x={4} y={y(100) + 3} className="axis">
          100
        </text>
        <text x={4} y={y(0) + 3} className="axis">
          0
        </text>
        <text x={PAD.l} y={H - 6} className="axis">
          {gMin} nS
        </text>
        <text x={officialX - 14} y={H - 6} className="axis">
          2.5
        </text>
        <text x={W - 40} y={H - 6} className="axis">
          {gMax} nS
        </text>
      </svg>
      <label className="sweep-ctrl">
        G<sub>GJ</sub> = {gGjNs.toFixed(1)} nS
        <input
          type="range"
          min={gMin}
          max={gMax}
          step={0.5}
          value={gGjNs}
          onChange={(e) => onPick(Number(e.target.value))}
        />
        <span>Baseline stays near 9. Repair needs coupling; official lock is 2.5 nS.</span>
      </label>
    </div>
  );
}
