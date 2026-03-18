import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section id="section-02" className={rootClasses} ref={sectionRef}>
      <motion.div
        className={styles.inner}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <header className={styles.header}>
          <motion.p className={styles.kicker} data-reveal="1" variants={itemVariants}>
            02 / CHARACTER TIMELINE
          </motion.p>
        </header>

        <div className={styles.timelineWrap}>
          <motion.div className={styles.timelineTrack} data-reveal="2" variants={itemVariants}>
            <div
              className={styles.timelineFill}
              data-testid="timeline-fill"
              data-animation="expandBar"
              data-timeline="scroll"
            />
          </motion.div>

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
          <motion.div className={styles.cardsRow} data-reveal="3" variants={itemVariants}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} data-testid="timeline-shimmer" className={`skeleton shimmer ${styles.shimmer}`} />
            ))}
          </motion.div>
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
            <motion.div className={styles.cardsRow} data-testid="timeline-cards-row" data-reveal="3" variants={itemVariants}>
              {dataState.data.map((character, index) => (
                <CharCard key={character.id} character={character} index={index} />
              ))}
            </motion.div>
          ) : (
            <p className={styles.emptyText}>No characters found.</p>
          )
        ) : null}

        {dataState.status === 'success' ? (
          <motion.div className={styles.selectionPanel} data-reveal="4" variants={itemVariants}>
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
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}