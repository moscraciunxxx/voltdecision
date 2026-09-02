/** FNV-1a 64-bit, hex. Sync and deterministic across browsers/Node. */
export function fnv1a64(text: string): string {
  let h = 0xcbf29ce484222325n;
  const p = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i));
    h = (h * p) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "null";
      return Number.isInteger(value) ? String(value) : value.toFixed(8);
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(",")}}`;
}

export function hashCanonical(value: unknown): string {
  return fnv1a64(canonical(value));
}
