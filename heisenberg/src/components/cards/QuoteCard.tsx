import type React from 'react';
import { motion } from 'framer-motion';

import { useExplorerStore } from '../../stores/useExplorerStore';
import type { Character } from '../../types/character';
import type { Quote } from '../../types/quote';
import { formatSeason } from '../../utils/formatters';
import styles from './QuoteCard.module.css';

export interface QuoteCardProps {
  quote: Quote;
  character: Character;
  index: number;
  className?: string;
}

type QuoteCardInlineStyle = React.CSSProperties & {
  '--stagger-i'?: number | string;
  '--quote-accent'?: string;
};

const parseEpisodeNumber = (episodeCode: string): number | null => {
  const match = /E(\d{1,2})$/i.exec(episodeCode);
  if (!match?.[1]) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export function QuoteCard({ quote, character, index, className }: QuoteCardProps) {
  const openQuote = useExplorerStore((state) => state.openQuote);
  const episode = parseEpisodeNumber(quote.episode);
  const seasonCode = episode === null ? quote.episode : formatSeason(quote.season, episode);

  const inlineStyle: QuoteCardInlineStyle = {
    '--stagger-i': String(index),
    '--quote-accent': character.color,
    animationDelay: 'calc(var(--stagger-i) * 60ms)',
  };

  const classes = [styles.card, styles.fadeUp, 'fadeUp', styles.hoverable, 'hoverable', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <motion.article
      layoutId={`quote-${quote.id}`}
      className={classes}
      style={inlineStyle}
      data-testid={`quote-card-${quote.id}`}
      data-hover-transform="translateY(-6px) scale(1.01)"
      data-hover-border-color={character.color}
      data-hover-bg-from="#0F0F0F"
      data-hover-bg-to="#161616"
      data-hover-shadow-alpha="0.22"
      onClick={() => {
        openQuote(quote);
      }}
    >
      <span data-testid="quote-open-mark" className={styles.openMark} style={{ color: character.color, opacity: 0.35 }}>
        "
      </span>

      <p data-testid="quote-text" className={`${styles.text} clamp4`}>
        {quote.text}
      </p>

      <footer className={styles.meta}>
        <span data-testid="quote-speaker" className={`${styles.speaker} speaker`}>
          {quote.speaker}
        </span>
        <span data-testid="quote-season" className={styles.seasonCode}>
          {seasonCode}
        </span>
      </footer>
    </motion.article>
  );
}