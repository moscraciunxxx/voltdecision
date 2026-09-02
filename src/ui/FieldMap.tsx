import { useEffect, useRef, type MouseEvent } from "react";
import { COLS, E_LEAK_MV, ROWS, type IncidentSpec } from "../engine/types";
import { idx, rc } from "../engine/geometry";

type Props = {
  v: Float64Array | null;
  spec: IncidentSpec;
  residual?: Float64Array | null;
  mode: "voltage" | "residual";
  selected?: number | null;
  onSelect?: (i: number) => void;
  label?: string;
};

function voltageColor(mv: number): string {
  const t = Math.max(-110, Math.min(10, mv));
  if (t <= E_LEAK_MV) {
    const u = (E_LEAK_MV - t) / 40;
    return lerpHex("#8a9178", "#1f6f6a", Math.min(1, u));
  }
  const u = (t - E_LEAK_MV) / 70;
  return lerpHex("#8a9178", "#c4842a", Math.min(1, u));
}

function residualColor(pA: number): string {
  const u = Math.min(1, Math.abs(pA) / 400);
  return lerpHex("#2a2e26", "#9a3b2f", u);
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function hex(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

export function FieldMap({ v, spec, residual, mode, selected, onSelect, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cw = w / COLS;
    const ch = h / ROWS;
    ctx.fillStyle = "#161910";
    ctx.fillRect(0, 0, w, h);
    if (!v) return;
    for (let i = 0; i < v.length; i++) {
      const { r, c } = rc(i);
      ctx.fillStyle = mode === "residual" && residual ? residualColor(residual[i]!) : voltageColor(v[i]!);
      ctx.fillRect(c * cw + 0.6, r * ch + 0.6, cw - 1.2, ch - 1.2);
    }
    ctx.strokeStyle = "rgba(232,234,216,0.18)";
    for (const i of spec.wound) {
      const { r, c } = rc(i);
      ctx.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
    }
    ctx.fillStyle = "#f2efe4";
    for (const e of spec.electrodes) {
      const { r, c } = rc(e.i);
      ctx.beginPath();
      ctx.arc(c * cw + cw / 2, r * ch + ch / 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(154,59,47,0.85)";
    ctx.beginPath();
    ctx.moveTo((spec.seamEastCol + 0.02) * cw, 0);
    ctx.lineTo((spec.seamEastCol + 0.02) * cw, h);
    ctx.stroke();
    if (selected != null && selected >= 0 && selected < v.length) {
      const { r, c } = rc(selected);
      ctx.strokeStyle = "#f2efe4";
      ctx.lineWidth = 2;
      ctx.strokeRect(c * cw + 1.5, r * ch + 1.5, cw - 3, ch - 3);
      ctx.lineWidth = 1;
    }
  }, [v, spec, residual, mode, selected]);

  function handleClick(ev: MouseEvent<HTMLCanvasElement>) {
    if (!onSelect) return;
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor(((ev.clientX - rect.left) / rect.width) * COLS);
    const r = Math.floor(((ev.clientY - rect.top) / rect.height) * ROWS);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
    onSelect(idx(r, c));
  }

  return (
    <div className="field-wrap">
      {label ? <div className="field-label">{label}</div> : null}
      <canvas
        ref={ref}
        className="field"
        width={420}
        height={420}
        aria-label={label ?? "Tissue voltage field"}
        onClick={handleClick}
      />
    </div>
  );
}
