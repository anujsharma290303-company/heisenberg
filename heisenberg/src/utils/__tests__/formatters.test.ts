import { describe, expect, it } from 'vitest';
import { formatSeason, groupBy, slugify, truncate } from '../formatters.ts';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Walter White')).toBe('walter-white');
  });

  it('lowercases the string', () => {
    expect(slugify('HeIsEnBeRg')).toBe('heisenberg');
  });

  it('removes special characters', () => {
    expect(slugify('Cap\'n Cook!')).toBe('capn-cook');
  });
});

describe('formatSeason', () => {
  it('formats season 4 episode 7 as S04E07', () => {
    expect(formatSeason(4, 7)).toBe('S04E07');
  });

  it('pads single digit season', () => {
    expect(formatSeason(3, 12)).toBe('S03E12');
  });

  it('handles double digit episode', () => {
    expect(formatSeason(5, 10)).toBe('S05E10');
  });
});

describe('truncate', () => {
  it('returns string unchanged if under max', () => {
    expect(truncate('Heisenberg', 20)).toBe('Heisenberg');
  });

  it('truncates with ellipsis', () => {
    expect(truncate('I am the one who knocks', 12)).toBe('I am the...');
  });

  it('does not cut in middle of word', () => {
    expect(truncate('Say my name now', 11)).toBe('Say my...');
  });
});

describe('groupBy', () => {
  it('groups items by key', () => {
    const quotes = [
      { id: '1', tone: 'menacing' },
      { id: '2', tone: 'humorous' },
      { id: '3', tone: 'menacing' },
    ];

    const grouped = groupBy(quotes, (quote) => quote.tone);

    expect(grouped.menacing).toHaveLength(2);
    expect(grouped.humorous).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBy([], (item: { key: string }) => item.key)).toEqual({});
  });
});
