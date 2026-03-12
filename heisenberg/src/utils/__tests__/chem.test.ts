import { describe, expect, it } from 'vitest';
import { cpkColor, parseChemFormula } from '../chem.ts';

describe('parseChemFormula', () => {
  it('parses C10H15N into 3 elements', () => {
    const parsed = parseChemFormula('C10H15N');
    expect(parsed).toHaveLength(3);
  });

  it('carbon count is 10', () => {
    const parsed = parseChemFormula('C10H15N');
    const carbon = parsed.find((entry) => entry.symbol === 'C');

    expect(carbon?.count).toBe(10);
  });

  it('single atom with no count = 1', () => {
    const parsed = parseChemFormula('N');
    expect(parsed[0]?.count).toBe(1);
  });

  it('parses PH3 correctly', () => {
    const parsed = parseChemFormula('PH3');
    expect(parsed).toEqual([
      { symbol: 'P', count: 1 },
      { symbol: 'H', count: 3 },
    ]);
  });

  it('parses BaCl2 correctly', () => {
    const parsed = parseChemFormula('BaCl2');
    expect(parsed).toEqual([
      { symbol: 'Ba', count: 1 },
      { symbol: 'Cl', count: 2 },
    ]);
  });
});

describe('cpkColor', () => {
  it('returns correct color for H (#FFFFFF)', () => {
    expect(cpkColor('H')).toBe('#FFFFFF');
  });

  it('returns correct color for C (#404040)', () => {
    expect(cpkColor('C')).toBe('#404040');
  });

  it('returns fallback #AAAAAA for unknown symbol', () => {
    expect(cpkColor('Xx')).toBe('#AAAAAA');
  });
});
