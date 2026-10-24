const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

function parse(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;

/** Mix `hex` toward black by `amount` (0..1). Used for the bevel under glossy buttons. */
export function darken(hex: string, amount: number): string {
  const rgb = parse(hex);
  if (!rgb) return hex;
  return toHex(rgb[0] * (1 - amount), rgb[1] * (1 - amount), rgb[2] * (1 - amount));
}

/** Mix `hex` toward white by `amount` (0..1). */
export function lighten(hex: string, amount: number): string {
  const rgb = parse(hex);
  if (!rgb) return hex;
  return toHex(
    rgb[0] + (255 - rgb[0]) * amount,
    rgb[1] + (255 - rgb[1]) * amount,
    rgb[2] + (255 - rgb[2]) * amount,
  );
}

/** True for pure white / near-white fills, where a gloss highlight would be invisible. */
export function isLight(hex: string): boolean {
  const rgb = parse(hex);
  return !!rgb && rgb[0] + rgb[1] + rgb[2] > 735;
}
