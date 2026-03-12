import { clamp, lerp } from './math';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const hexToRgb = (hex: string): RGB => {
  const normalized = hex.trim().replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

export const interpolateColor = (a: string, b: string, t: number): string => {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  const factor = clamp(t, 0, 1);

  const r = Math.round(lerp(from.r, to.r, factor));
  const g = Math.round(lerp(from.g, to.g, factor));
  const bChannel = Math.round(lerp(from.b, to.b, factor));

  return `rgb(${r}, ${g}, ${bChannel})`;
};
