import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useQuoteFilter } from '../useQuoteFilter.ts';

type MockQuote = {
  id: string;
  tone: 'menacing' | 'humorous' | 'reflective';
  characterId: 'walt' | 'jesse';
};

const mockData: MockQuote[] = [
  { id: '1', tone: 'menacing', characterId: 'walt' },
  { id: '2', tone: 'humorous', characterId: 'jesse' },
  { id: '3', tone: 'menacing', characterId: 'jesse' },
  { id: '4', tone: 'reflective', characterId: 'walt' },
];

describe('useQuoteFilter', () => {
  it('returns all data when no filters set', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    expect(result.current.filtered).toEqual(mockData);
  });

  it('filters by tone correctly', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    act(() => {
      result.current.setTone('menacing');
    });

    expect(result.current.filtered).toEqual([
      { id: '1', tone: 'menacing', characterId: 'walt' },
      { id: '3', tone: 'menacing', characterId: 'jesse' },
    ]);
  });

  it('filters by characterId correctly', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    act(() => {
      result.current.setCharacterId('jesse');
    });

    expect(result.current.filtered).toEqual([
      { id: '2', tone: 'humorous', characterId: 'jesse' },
      { id: '3', tone: 'menacing', characterId: 'jesse' },
    ]);
  });

  it('combines filters with AND logic', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    act(() => {
      result.current.setTone('menacing');
      result.current.setCharacterId('jesse');
    });

    expect(result.current.filtered).toEqual([
      { id: '3', tone: 'menacing', characterId: 'jesse' },
    ]);
  });

  it('resetFilters returns all data', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    act(() => {
      result.current.setTone('menacing');
      result.current.setCharacterId('jesse');
      result.current.resetFilters();
    });

    expect(result.current.filtered).toEqual(mockData);
  });

  it('resultCount matches filtered length', () => {
    const { result } = renderHook(() => useQuoteFilter(mockData));

    act(() => {
      result.current.setTone('menacing');
    });

    expect(result.current.resultCount).toBe(result.current.filtered.length);
  });
});
