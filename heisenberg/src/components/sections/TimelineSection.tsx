import { useCallback, useEffect, useRef, useState } from 'react';

import { CharCard } from '../cards/CharCard';
import { GlitchText } from '../ui/GlitchText';
import { useTypedData } from '../../hooks/useTypedData';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useUIStore } from '../../stores/useUIStore';
import type { Character } from '../../types/character';
import styles from './TimelineSection.module.css';

export interface TimelineSectionProps {
  className?: string;
}

type SeasonMarker = {
  label: 'S01' | 'S02' | 'S03' | 'S04' | 'S05';
  positionPct: 10 | 30 | 50 | 70 | 90;
};

const SEASON_MARKERS: SeasonMarker[] = [
  { label: 'S01', positionPct: 10 },
  { label: 'S02', positionPct: 30 },
  { label: 'S03', positionPct: 50 },
  { label: 'S04', positionPct: 70 },
  { label: 'S05', positionPct: 90 },
];

export function TimelineSection({ className }: TimelineSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);
  const selectedChar = useExplorerStore((state) => state.selectedChar);
  const clearChar = useExplorerStore((state) => state.clearChar);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          sectionRef.current?.classList.add('revealed');
          setRevealed(true);
          setSection(1);
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

  const dataLoader = useCallback(async () => {
    const module = await import('../../data/characters.json');
    return module.default as Character[];
  }, []);
  const dataState = useTypedData<Character[]>(dataLoader);

  const rootClasses = ['section', styles.sectionRoot, revealed ? styles.revealed : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-02" className={rootClasses} ref={sectionRef}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>02 / CHARACTER TIMELINE</p>
        </header>

        <div className={styles.timelineWrap}>
          <div className={styles.timelineTrack}>
            <div
              className={styles.timelineFill}
              data-testid="timeline-fill"
              data-animation="expandBar"
              data-timeline="scroll"
            />
          </div>

          <div className={styles.markerRow}>
            {SEASON_MARKERS.map((marker) => (
              <div
                key={marker.label}
                className={styles.marker}
                data-testid="season-marker"
                data-position={String(marker.positionPct)}
                style={{ left: `${marker.positionPct}%` }}
              >
                <span className={styles.markerDot} />
                <span className={styles.markerLabel}>{marker.label}</span>
              </div>
            ))}
          </div>
        </div>

        {dataState.status === 'loading' || dataState.status === 'idle' ? (
          <div className={styles.cardsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} data-testid="timeline-shimmer" className={`skeleton ${styles.shimmer}`} />
            ))}
          </div>
        ) : null}

        {dataState.status === 'error' ? (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{dataState.error.message}</p>
            <button type="button" onClick={dataState.retry} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        ) : null}

        {dataState.status === 'success' ? (
          dataState.data.length > 0 ? (
            <div className={styles.cardsRow} data-testid="timeline-cards-row">
              {dataState.data.map((character, index) => (
                <CharCard key={character.id} character={character} index={index} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No characters found.</p>
          )
        ) : null}

        {dataState.status === 'success' ? (
          <div className={styles.selectionPanel}>
            {selectedChar ? (
              <>
                <GlitchText
                  always={true}
                  className={styles.selectionName}
                  style={{ color: selectedChar.color }}
                >
                  {selectedChar.name}
                </GlitchText>
                <button
                  type="button"
                  className={styles.clearBtn}
                  style={{ color: selectedChar.color, borderColor: selectedChar.color }}
                  aria-label="Clear Selection"
                  onClick={clearChar}
                >
                  CLEAR
                </button>
              </>
            ) : (
              <p className={styles.selectionHint}>Select a character card to focus the quote wall.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}