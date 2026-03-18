import type React from 'react';

import type { Character } from '../../types/character';
import { useExplorerStore } from '../../stores/useExplorerStore';
import styles from './CharCard.module.css';
import walterImage from '../../data/images/walter.jpg';
import jesseImage from '../../data/images/jesse_pinkman.jpg';
import gusImage from '../../data/images/gustavo_fring.jpg';
import hankImage from '../../data/images/hank.jpg';
import mikeImage from '../../data/images/mike.jpg';
import saulImage from '../../data/images/saul.jpg';

export interface CharCardProps {
  character: Character;
  index: number;
  className?: string;
}

type CharCardInlineStyle = React.CSSProperties & {
  '--char-accent'?: string;
  '--card-color'?: string;
  '--deal-delay'?: string;
  '--deal-rotate'?: string;
};

const DEAL_ROTATIONS = [-3, -1, 1, 3, 0] as const;

const CHARACTER_IMAGE_BY_ID: Record<string, string> = {
  walt: walterImage,
  jesse: jesseImage,
  gus: gusImage,
  hank: hankImage,
  mike: mikeImage,
  saul: saulImage,
};

export function CharCard({ character, index, className }: CharCardProps) {
  const selectedChar = useExplorerStore((state) => state.selectedChar);
  const selectChar = useExplorerStore((state) => state.selectChar);
  const clearChar = useExplorerStore((state) => state.clearChar);
  const isSelected = selectedChar?.id === character.id;
  const imageSrc = CHARACTER_IMAGE_BY_ID[character.id] ?? null;

  const handleClick = () => {
    if (isSelected) {
      clearChar();
      return;
    }

    selectChar(character);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    element.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${y * 16}deg) scale(1.04) translateY(-6px)`;
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.transform = '';
  };

  const inlineStyle: CharCardInlineStyle = {
    '--char-accent': character.color,
    '--card-color': character.color,
    '--deal-delay': `${(index * 0.15).toFixed(2)}s`,
    '--deal-rotate': `${DEAL_ROTATIONS[index % DEAL_ROTATIONS.length]}deg`,
  };

  const classes = [
    styles.card,
    styles.charIn,
    'charIn',
    isSelected ? styles.selected : '',
    isSelected ? 'selected' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={inlineStyle}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-testid={`char-card-${character.id}`}
      data-selected={isSelected ? 'true' : 'false'}
      data-accent-height="3px"
      data-selected-shadow={isSelected ? '0 0 20px' : ''}
      aria-pressed={isSelected}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          {imageSrc ? (
            <div className={styles.media}>
              <img
                src={imageSrc}
                alt={character.name}
                className={styles.portrait}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.mediaShade} />
            </div>
          ) : null}

          <h3 className={styles.name}>{character.name}</h3>
          <p className={styles.alias}>{character.alias}</p>
          <p className={styles.description}>{character.desc}</p>

          <div className={styles.badges}>
            <span className={styles.badge}>{character.seasons.map((season) => `S${season}`).join(', ')}</span>
            <span className={styles.badge}>{character.role}</span>
          </div>

          <div className={styles.cardShine} />
        </div>

        <div className={styles.cardBack}>
          <p className={styles.quote}>
            "{character.bestQuote}"
          </p>
          <span className={styles.quoteAuthor}>- {character.name}</span>
        </div>
      </div>
    </button>
  );
}