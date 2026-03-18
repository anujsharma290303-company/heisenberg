import { useCallback, useMemo, useState } from 'react';

type FilterMap<T> = Partial<T>;
type ToneValue<T> = T extends { tone: infer U } ? U : never;
type CharacterIdValue<T> = T extends { characterId: infer U } ? U : never;

interface UseQuoteFilterResult<T extends object> {
  filtered: T[];
  resultCount: number;
  setFilter: <K extends keyof T>(key: K, value: T[K] | null | undefined) => void;
  setTone: T extends { tone: infer U } ? (tone: U) => void : (tone: never) => void;
  setCharacterId: T extends { characterId: infer U }
    ? (characterId: U) => void
    : (characterId: never) => void;
  resetFilters: () => void;
}

export const useQuoteFilter = <T extends object>(
  data: T[]
): UseQuoteFilterResult<T> => {
  const [filters, setFilters] = useState<FilterMap<T>>({});

  const setFilter = useCallback(<K extends keyof T>(
    key: K,
    value: T[K] | null | undefined
  ): void => {
    setFilters((prev) => {
      if (value === null || typeof value === 'undefined') {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    const entries = Object.entries(filters) as Array<[keyof T, T[keyof T]]>;

    if (entries.length === 0) {
      return data;
    }

    return data.filter((item) => {
      return entries.every(([key, value]) => item[key] === value);
    });
  }, [data, filters]);

  const resetFilters = useCallback((): void => {
    setFilters({});
  }, []);

  const setTone = useCallback((tone: ToneValue<T>) => {
    setFilter('tone' as keyof T, tone as T[keyof T]);
  }, [setFilter]) as UseQuoteFilterResult<T>['setTone'];

  const setCharacterId = useCallback((characterId: CharacterIdValue<T>) => {
    setFilter('characterId' as keyof T, characterId as T[keyof T]);
  }, [setFilter]) as UseQuoteFilterResult<T>['setCharacterId'];

  return {
    filtered,
    resultCount: filtered.length,
    setFilter,
    setTone,
    setCharacterId,
    resetFilters,
  };
};
