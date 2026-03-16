import { hexToRgba } from '../../utils/color';
import type { Character } from '../../types/character';
import styles from './CharacterChip.module.css';

export interface CharacterChipProps {
  character: Character;
  onClear: () => void;
}

export function CharacterChip({ character, onClear }: CharacterChipProps) {
  return (
    <div
      className={styles.chip}
      data-testid="character-chip"
      style={{ backgroundColor: hexToRgba(character.color, 0.18) }}
    >
      <span className={styles.name} style={{ color: character.color }}>
        {character.name}
      </span>
      <button
        type="button"
        className={styles.clear}
        aria-label={`Clear ${character.name} filter`}
        onClick={onClear}
      >
        ×
      </button>
    </div>
  );
}
