import { useEffect, useRef, useState } from 'react';

import { CharCard } from '../cards/CharCard';
import { useTypedData } from '../../hooks/useTypedData';
import { useUIStore } from '../../stores/useUIStore';
import type { Character } from '../../types/character';
import styles from './TimelineSection.module.css';

export interface TimelineSectionProps {
  className?: string;
}

export function TimelineSection({ className }: TimelineSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);

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

  const dataState = useTypedData<Character[]>(async () => {
    const module = await import('../../data/characters.json');
    return module.default as Character[];
  });

  const rootClasses = ['section', styles.sectionRoot, revealed ? styles.revealed : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-02" className={rootClasses} ref={sectionRef}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>Character Timeline</p>
          <h2 className={styles.title}>Select A Character</h2>
        </header>

        {dataState.status === 'loading' || dataState.status === 'idle' ? (
          <div className={styles.grid}>
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
            <div className={styles.grid}>
              {dataState.data.map((character, index) => (
                <CharCard key={character.id} character={character} index={index} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No characters found.</p>
          )
        ) : null}
      </div>
    </section>
  );
}