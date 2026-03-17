import { useEffect, useRef } from 'react';

import { useChemStore } from '../stores/useChemStore';
import { useExplorerStore } from '../stores/useExplorerStore';
import type { Molecule } from '../types/chemistry';
import type { Quote } from '../types/quote';

const ELEMENT_PARAM = 'element';
const QUOTE_PARAM = 'quote';

const toSearchString = (params: URLSearchParams): string => {
  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
};

const buildNextUrl = (search: string): string => {
  const { pathname, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

export function useURLSync(): void {
  const activeElement = useChemStore((state) => state.activeElement);
  const activeQuoteId = useExplorerStore((state) => state.activeQuote?.id ?? null);
  const hydratedOnceRef = useRef(false);
  const firstSyncRunRef = useRef(true);

  // Hydration: read URL params on first mount and update stores.
  useEffect(() => {
    if (hydratedOnceRef.current) {
      // StrictMode second invocation — skip repeat hydration.
      return;
    }

    hydratedOnceRef.current = true;

    let cancelled = false;

    const hydrateFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlElement = params.get(ELEMENT_PARAM);
      const urlQuoteId = params.get(QUOTE_PARAM);

      if (!urlElement && !urlQuoteId) {
        return;
      }

      const [quotesModule, moleculesModule, elementsModule] = await Promise.all([
        import('../data/quotes.json'),
        import('../data/molecules.json'),
        import('../data/elements.json'),
      ]);

      if (cancelled) {
        return;
      }

      const quotes = quotesModule.default as Quote[];
      const molecules = moleculesModule.default as Molecule[];
      const validElements = new Set((elementsModule.default as { symbol: string }[]).map((entry) => entry.symbol));

      if (urlElement && validElements.has(urlElement)) {
        useChemStore.getState().selectElement(urlElement, molecules);
      }

      if (urlQuoteId) {
        const matchingQuote = quotes.find((quote) => quote.id === urlQuoteId);
        if (matchingQuote) {
          useExplorerStore.getState().openQuote(matchingQuote);
        }
      }
    };

    void hydrateFromUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync: keep URL search params in sync with store whenever they change.
  // Skip replaceState if computed URL hasn't actually changed to prevent unnecessary writes.
  useEffect(() => {
      const currentParams = new URLSearchParams(window.location.search);

      // On first run, skip if URL already matches store state to prevent unnecessary write during mount
      if (
        firstSyncRunRef.current &&
        currentParams.get(ELEMENT_PARAM) === activeElement &&
        currentParams.get(QUOTE_PARAM) === activeQuoteId
      ) {
        firstSyncRunRef.current = false;
        return;
      }
      firstSyncRunRef.current = false;

    const params = new URLSearchParams(window.location.search);

    if (activeElement) {
      params.set(ELEMENT_PARAM, activeElement);
    } else {
      params.delete(ELEMENT_PARAM);
    }

    if (activeQuoteId) {
      params.set(QUOTE_PARAM, activeQuoteId);
    } else {
      params.delete(QUOTE_PARAM);
    }

    window.history.replaceState(null, '', buildNextUrl(toSearchString(params)));
  }, [activeElement, activeQuoteId]);
}
