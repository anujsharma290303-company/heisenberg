import type React from 'react';

import type { Character } from '../../types/character';
import { useExplorerStore } from '../../stores/useExplorerStore';
import styles from './CharCard.module.css';

export interface CharCardProps {
  character: Character;
  index: number;
  className?: string;
}

type CharCardInlineStyle = React.CSSProperties & {
  '--char-accent'?: string;
};

export function CharCard({ character, index, className }: CharCardProps) {
  const selectedChar = useExplorerStore((state) => state.selectedChar);
  const selectChar = useExplorerStore((state) => state.selectChar);
  const clearChar = useExplorerStore((state) => state.clearChar);
  const isSelected = selectedChar?.id === character.id;

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
    animationDelay: `${(index * 0.1).toFixed(1)}s`,
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
      <h3 className={styles.name}>{character.name}</h3>
      <p className={styles.alias}>{character.alias}</p>
      <p className={styles.description}>{character.desc}</p>

      <div className={styles.badges}>
        <span className={styles.badge}>{character.seasons.map((season) => `S${season}`).join(', ')}</span>
        <span className={styles.badge}>{character.role}</span>
      </div>
    </button>
  );
}