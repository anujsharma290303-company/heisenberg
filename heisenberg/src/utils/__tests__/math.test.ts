import { describe, expect, it } from 'vitest';
import { clamp, easeInOutCubic, lerp, mapRange, project3D } from '../math.ts';

describe('lerp', () => {
  it('returns start at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns end at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('works with negative values', () => {
    expect(lerp(-10, 10, 0.25)).toBe(-5);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when below range', () => {
    expect(clamp(-2, 0, 10)).toBe(0);
  });

  it('returns max when above range', () => {
    expect(clamp(20, 0, 10)).toBe(10);
  });
});

describe('mapRange', () => {
  it('maps 5 from (0-10) to (0-100) = 50', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
  });

  it('maps minimum correctly', () => {
    expect(mapRange(0, 0, 10, 0, 100)).toBe(0);
  });

  it('maps maximum correctly', () => {
    expect(mapRange(10, 0, 10, 0, 100)).toBe(100);
  });
});

describe('easeInOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeInOutCubic(0)).toBe(0);
  });

  it('returns 1 at t=1', () => {
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('returns 0.5 at t=0.5', () => {
    expect(easeInOutCubic(0.5)).toBe(0.5);
  });

  it('is less than linear in first half', () => {
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
  });

  it('is greater than linear in second half', () => {
    expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
  });
});

describe('project3D', () => {
  it('returns correct scale for z=0', () => {
    const projected = project3D(10, 20, 0, 300, 400);
    expect(projected.scale).toBeCloseTo(300 / 700);
  });

  it('farther z gives smaller scale', () => {
    const near = project3D(0, 0, 0, 300, 400);
    const far = project3D(0, 0, 200, 300, 400);
    expect(far.scale).toBeLessThan(near.scale);
  });

  it('returns sx near 0 for origin point', () => {
    const projected = project3D(0, 0, 0, 300, 400);
    expect(projected.sx).toBeCloseTo(0);
  });
});
