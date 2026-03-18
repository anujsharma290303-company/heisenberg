import { useEffect, useRef, useState } from 'react';

import { DesertCanvas } from '../canvas/DesertCanvas';
import { Counter } from '../ui/Counter';
import { GlitchText } from '../ui/GlitchText';
import { Typewriter } from '../ui/Typewriter';
import { useUIStore } from '../../stores/useUIStore';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [heroTyped, setHeroTyped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);
  const setGrainIntensity = useUIStore((state) => state.setGrainIntensity);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          setSection(0);
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

  const rootClasses = [
    'section',
    styles.sectionRoot,
    className,
    revealed ? styles.revealed : '',
    revealed ? 'revealed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-01" className={rootClasses} ref={sectionRef}>
      <div className={styles.backgroundLayer}>
        <DesertCanvas />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <GlitchText always={true}>HEISENBERG</GlitchText>
        </h1>

        <div className={styles.subtitle}>
          <Typewriter
            text="I am the one who knocks."
            onComplete={() => {
              setHeroTyped(true);
              setGrainIntensity(0.07);
            }}
          />
        </div>

        {heroTyped ? (
          <div className={styles.counters}>
            <Counter to={5} label="SEASONS" />
            <Counter to={62} label="EPISODES" />
            <Counter to={16} label="EMMY AWARDS" suffix="+" />
            <Counter to={9} label="IMDB RATING" suffix=".5/10" />
          </div>
        ) : null}
      </div>

      <div className={styles.scrollPrompt} data-testid="scroll-prompt">
        SCROLL
      </div>
    </section>
  );
}