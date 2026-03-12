import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSort } from '../useSort.ts';

type SortItem = {
  name: string;
  season: number;
};

const mockData: SortItem[] = [
  { name: 'Jesse', season: 1 },
  { name: 'Walt', season: 3 },
  { name: 'Gus', season: 2 },
];

describe('useSort', () => {
  it('returns data unsorted by default', () => {
    const { result } = renderHook(() => useSort(mockData));

    expect(result.current.sorted).toEqual(mockData);
  });

  it('sortKey is null by default', () => {
    const { result } = renderHook(() => useSort(mockData));

    expect(result.current.sortKey).toBeNull();
  });

  it('toggleSort once sorts ascending', () => {
    const { result } = renderHook(() => useSort(mockData));

    act(() => {
      result.current.toggleSort('season');
    });

    expect(result.current.sorted).toEqual([
      { name: 'Jesse', season: 1 },
      { name: 'Gus', season: 2 },
      { name: 'Walt', season: 3 },
    ]);
  });

  it('toggleSort twice sorts descending', () => {
    const { result } = renderHook(() => useSort(mockData));

    act(() => {
      result.current.toggleSort('season');
      result.current.toggleSort('season');
    });

    expect(result.current.sorted).toEqual([
      { name: 'Walt', season: 3 },
      { name: 'Gus', season: 2 },
      { name: 'Jesse', season: 1 },
    ]);
  });

  it('toggleSort three times clears sort', () => {
    const { result } = renderHook(() => useSort(mockData));

    act(() => {
      result.current.toggleSort('season');
      result.current.toggleSort('season');
      result.current.toggleSort('season');
    });

    expect(result.current.sortKey).toBeNull();
    expect(result.current.sorted).toEqual(mockData);
  });

  it('clearSort removes sorting', () => {
    const { result } = renderHook(() => useSort(mockData));

    act(() => {
      result.current.toggleSort('season');
      result.current.clearSort();
    });

    expect(result.current.sortKey).toBeNull();
    expect(result.current.sorted).toEqual(mockData);
  });
});
