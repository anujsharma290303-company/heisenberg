import { useMemo, useReducer } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface UseSortResult<T extends Record<string, unknown>> {
  sorted: T[];
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  toggleSort: (key: keyof T) => void;
  clearSort: () => void;
}

interface SortState<T> {
  sortKey: keyof T | null;
  sortDirection: SortDirection;
}

type SortAction<T> =
  | { type: 'toggle'; key: keyof T }
  | { type: 'clear' };

function sortReducer<T extends Record<string, unknown>>(
  state: SortState<T>,
  action: SortAction<T>
): SortState<T> {
  switch (action.type) {
    case 'toggle': {
      if (state.sortKey !== action.key) {
        return { sortKey: action.key, sortDirection: 'asc' };
      }
      if (state.sortDirection === 'asc') {
        return { sortKey: action.key, sortDirection: 'desc' };
      }
      if (state.sortDirection === 'desc') {
        return { sortKey: null, sortDirection: null };
      }
      return { sortKey: action.key, sortDirection: 'asc' };
    }
    case 'clear':
      return { sortKey: null, sortDirection: null };
  }
}

const compareValues = (a: unknown, b: unknown): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  const aText = String(a);
  const bText = String(b);

  if (aText < bText) {
    return -1;
  }

  if (aText > bText) {
    return 1;
  }

  return 0;
};

export const useSort = <T extends Record<string, unknown>>(
  data: T[]
): UseSortResult<T> => {
  const [{ sortKey, sortDirection }, dispatch] = useReducer(
    sortReducer<T>,
    { sortKey: null, sortDirection: null }
  );

  const toggleSort = (key: keyof T): void => {
    dispatch({ type: 'toggle', key });
  };

  const clearSort = (): void => {
    dispatch({ type: 'clear' });
  };

  const sorted = useMemo(() => {
    if (sortKey === null || sortDirection === null) {
      return data;
    }

    const clone = [...data];
    clone.sort((left, right) => {
      const result = compareValues(left[sortKey], right[sortKey]);
      return sortDirection === 'asc' ? result : -result;
    });

    return clone;
  }, [data, sortDirection, sortKey]);

  return {
    sorted,
    sortKey,
    sortDirection,
    toggleSort,
    clearSort,
  };
};
