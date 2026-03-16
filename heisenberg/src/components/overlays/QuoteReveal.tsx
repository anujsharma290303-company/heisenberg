import { useCallback, useEffect } from 'react';
import type React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { GlitchText } from '../ui/GlitchText';
import { useExplorerStore } from '../../stores/useExplorerStore';
import { useUIStore } from '../../stores/useUIStore';
import type { Character } from '../../types/character';
import styles from './QuoteReveal.module.css';

export interface QuoteRevealProps {
  /** Character whose color drives the opening-mark tint; resolved by caller from characterId */
  character: Character | null;
}

type RevealInlineStyle = React.CSSProperties & {
  '--reveal-accent'?: string;
};

export function QuoteReveal({ character }: QuoteRevealProps) {
  const activeQuote = useExplorerStore((state) => state.activeQuote);
  const closeQuote = useExplorerStore((state) => state.closeQuote);
  const setGrainIntensity = useUIStore((state) => state.setGrainIntensity);

  // Elevate grain on mount, restore on unmount
  useEffect(() => {
    setGrainIntensity(0.07);
    return () => {
      setGrainIntensity(0.028);
    };
  }, [setGrainIntensity]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeQuote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeQuote]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        closeQuote();
      }
    },
    [closeQuote]
  );

  const accentColor = character?.color ?? 'var(--color-crystal)';

  const contentStyle: RevealInlineStyle = {
    '--reveal-accent': accentColor,
  };

  return (
    <AnimatePresence>
      {activeQuote && (
        <motion.div
          key="reveal-overlay"
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
          data-testid="quote-reveal-overlay"
        >
          <motion.div
            layoutId={`quote-${activeQuote.id}`}
            className={styles.content}
            style={contentStyle}
            data-testid="quote-reveal-content"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span
              className={styles.openMark}
              style={{ color: accentColor, animationDelay: '0s' }}
              data-testid="quote-reveal-mark"
            >
              &ldquo;
            </span>

            <p
              className={styles.quoteText}
              style={{ animationDelay: '0.1s' }}
              data-testid="quote-reveal-text"
            >
              {activeQuote.text}
            </p>

            <span
              className={styles.speakerWrap}
              style={{ animationDelay: '0.3s' }}
            >
              <GlitchText always={true} className={styles.speaker}>
                {activeQuote.speaker}
              </GlitchText>
            </span>

            <div className={styles.meta}>
              <span data-testid="quote-reveal-episode">{activeQuote.episode}</span>
              <span data-testid="quote-reveal-tone">{activeQuote.tone.toUpperCase()}</span>
            </div>

            <p
              className={styles.hint}
              style={{ animationDelay: '0.5s' }}
              data-testid="quote-reveal-hint"
            >
              click anywhere to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
