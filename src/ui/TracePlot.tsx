import type { TickRecord } from "../engine/types";

const IDS = ["e-wound", "e-halo", "e-seam-w", "e-seam-e", "e-far"] as const;
const COLORS: Record<(typeof IDS)[number], string> = {
  "e-wound": "#c4842a",
  "e-halo": "#1f6f6a",
  "e-seam-w": "#8a9178",
  "e-seam-e": "#9a3b2f",
  "e-far": "#6b7c8a",
};

const W = 640;
const H = 168;
const PAD = { l: 36, r: 10, t: 10, b: 22 };
const VMIN = -110;
const VMAX = 10;

type Props = {
  ticks: TickRecord[];
  title: string;
};

export function TracePlot({ ticks, title }: Props) {
  if (!ticks.length) {
    return (
      <div className="traces empty">
        <p>Electrode traces appear after Run incident. e-wound should sit flat at −70 mV.</p>
      </div>
    );
  }
  const tMax = ticks[ticks.length - 1]!.t;
  const x = (t: number) => PAD.l + ((W - PAD.l - PAD.r) * t) / tMax;
  const y = (v: number) => PAD.t + ((H - PAD.t - PAD.b) * (VMAX - v)) / (VMAX - VMIN);
  const restY = y(-70);

  return (
    <div className="traces">
      <div className="traces-head">
        <strong>{title}</strong>
        <span>controller observations only · mV vs ms</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="trace-svg" role="img" aria-label={title}>
        <line x1={PAD.l} y1={restY} x2={W - PAD.r} y2={restY} className="rest-line" />
        <text x={4} y={restY + 3} className="axis">
          −70
        </text>
        <text x={4} y={y(-110) + 3} className="axis">
          −110
        </text>
        <text x={4} y={y(10) + 3} className="axis">
          10
        </text>
        {IDS.map((id) => {
          const d = ticks
            .map((tick, i) => {
              const v = tick.observed[id];
              if (typeof v !== "number") return "";
              return `${i === 0 ? "M" : "L"}${x(tick.t).toFixed(1)},${y(v).toFixed(1)}`;
            })
            .join(" ");
          return <path key={id} d={d} fill="none" stroke={COLORS[id]} strokeWidth={id === "e-wound" ? 2.2 : 1.3} />;
        })}
        <text x={PAD.l} y={H - 4} className="axis">
          0 ms
        </text>
        <text x={W - 52} y={H - 4} className="axis">
          {tMax.toFixed(0)} ms
        </text>
      </svg>
      <div className="trace-legend">
        {IDS.map((id) => (
          <span key={id}>
            <i style={{ background: COLORS[id] }} />
            {id}
            {id === "e-wound" ? " · the lie" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
