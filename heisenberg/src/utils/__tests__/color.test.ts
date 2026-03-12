import { describe, expect, it } from 'vitest';
import { hexToRgb, interpolateColor } from '../color.ts';

describe('hexToRgb', () => {
  it('converts #4FC3F7 to {r:79, g:195, b:247}', () => {
    expect(hexToRgb('#4FC3F7')).toEqual({ r: 79, g: 195, b: 247 });
  });

  it('converts #000000 to {r:0, g:0, b:0}', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('handles lowercase hex', () => {
    expect(hexToRgb('#ff00aa')).toEqual({ r: 255, g: 0, b: 170 });
  });
});

describe('interpolateColor', () => {
  it('returns first color at t=0', () => {
    expect(interpolateColor('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
  });

  it('returns second color at t=1', () => {
    expect(interpolateColor('#000000', '#ffffff', 1)).toBe('rgb(255, 255, 255)');
  });

  it('returns midpoint at t=0.5', () => {
    expect(interpolateColor('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
  });
});
