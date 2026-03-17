import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CharacterChip } from '../ui/CharacterChip';
import { ToneFilterBar } from '../ui/ToneFilterBar';
import { QuoteCard } from '../cards/QuoteCard';
import { useQuoteFilter } from '../../hooks/useQuoteFilter';
import { useTypedData } from '../../hooks/useTypedData';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useUIStore } from '../../stores/useUIStore';
import type { Character } from '../../types/character';
import type { Quote } from '../../types/quote';
import styles from './QuotesSection.module.css';

export interface QuotesSectionProps {
  className?: string;
}

export function QuotesSection({ className }: QuotesSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);
  const selectedChar = useExplorerStore((state) => state.selectedChar);
  const toneFilter = useExplorerStore((state) => state.toneFilter);
  const setTone = useExplorerStore((state) => state.setTone);
  const clearChar = useExplorerStore((state) => state.clearChar);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          sectionRef.current?.classList.add('revealed');
          setRevealed(true);
          setSection(2);
        }
      },
      { threshold: 0.45 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [setSection]);

  const quotesLoader = useCallback(async () => {
    const module = await import('../../data/quotes.json');
    return module.default as Quote[];
  }, []);
  const quotesState = useTypedData<Quote[]>(quotesLoader);

  const charactersLoader = useCallback(async () => {
    const module = await import('../../data/characters.json');
    return module.default as Character[];
  }, []);
  const charactersState = useTypedData<Character[]>(charactersLoader);

  const baseQuotes = quotesState.status === 'success' ? quotesState.data : [];
  const { filtered, resultCount, setFilter, setTone: setFilterTone, setCharacterId } = useQuoteFilter<Quote>(baseQuotes);

  useEffect(() => {
    if (selectedChar) {
      setCharacterId(selectedChar.id);
      return;
    }

    setFilter('characterId', undefined);
  }, [selectedChar, setCharacterId, setFilter]);

  useEffect(() => {
    if (toneFilter === 'all') {
      setFilter('tone', undefined);
      return;
    }

    setFilterTone(toneFilter);
  }, [toneFilter, setFilterTone, setFilter]);

  const characterById = useMemo(() => {
    if (charactersState.status !== 'success') {
      return {} as Record<string, Character>;
    }

    return charactersState.data.reduce<Record<string, Character>>((acc, character) => {
      acc[character.id] = character;
      return acc;
    }, {});
  }, [charactersState]);

  const mappedQuotes = filtered
    .map((quote) => {
      const character = characterById[quote.characterId];
      if (!character) {
        return null;
      }

      return { quote, character };
    })
    .filter((item): item is { quote: Quote; character: Character } => item !== null);

  const loading =
    quotesState.status === 'loading' ||
    quotesState.status === 'idle' ||
    charactersState.status === 'loading' ||
    charactersState.status === 'idle';

  const rootClasses = ['section', styles.sectionRoot, revealed ? styles.revealed : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-03" className={rootClasses} ref={sectionRef}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Quotes Wall</h2>
          <p className={styles.count}>
            Results: <span data-testid="quotes-result-count">{resultCount}</span>
          </p>
        </header>

        <div className={styles.controlBar}>
          <div className={styles.filterRow}>
            <ToneFilterBar active={toneFilter} onSelect={setTone} />
          </div>
          {selectedChar ? <CharacterChip character={selectedChar} onClear={clearChar} /> : null}
        </div>

        {loading ? (
          <div className={styles.quotesGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} data-testid="quotes-shimmer" className={`skeleton shimmer ${styles.shimmer}`} />
            ))}
          </div>
        ) : null}

        {quotesState.status === 'error' ? (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{quotesState.error.message}</p>
            <button type="button" className={styles.retryBtn} onClick={quotesState.retry}>
              Retry Quotes
            </button>
          </div>
        ) : null}

        {charactersState.status === 'error' ? (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{charactersState.error.message}</p>
            <button type="button" className={styles.retryBtn} onClick={charactersState.retry}>
              Retry Characters
            </button>
          </div>
        ) : null}

        {quotesState.status === 'success' && charactersState.status === 'success' ? (
          mappedQuotes.length > 0 ? (
            <div className={styles.quotesGrid}>
              {mappedQuotes.map(({ quote, character }, index) => (
                <QuoteCard key={quote.id} quote={quote} character={character} index={index} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No quotes found.</p>
          )
        ) : null}
      </div>
    </section>
  );
}