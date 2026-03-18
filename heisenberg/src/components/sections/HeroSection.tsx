import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
    <section id="section-01" className={rootClasses} ref={sectionRef}>
      <div className={styles.backgroundLayer} data-reveal="1">
        <DesertCanvas />
      </div>

      <motion.div
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h1 className={styles.title} data-reveal="2" variants={itemVariants}>
          <GlitchText always={true}>HEISENBERG</GlitchText>
        </motion.h1>

        <motion.div className={styles.subtitle} data-reveal="3" variants={itemVariants}>
          <Typewriter
            text="I am the one who knocks."
            onComplete={() => {
              setHeroTyped(true);
              setGrainIntensity(0.07);
            }}
          />
        </motion.div>

        {heroTyped ? (
          <motion.div className={styles.counters} data-reveal="4" variants={itemVariants}>
            <Counter to={5} label="SEASONS" />
            <Counter to={62} label="EPISODES" />
            <Counter to={16} label="EMMY AWARDS" suffix="+" />
            <Counter to={9} label="IMDB RATING" suffix=".5/10" />
          </motion.div>
        ) : null}
      </motion.div>

      <div className={styles.scrollPrompt} data-testid="scroll-prompt" data-reveal="5">
        SCROLL
      </div>
    </section>
  );
}