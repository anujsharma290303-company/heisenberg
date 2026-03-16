import type { ExplorerToneFilter } from '../../stores/useExplorerStore';
import styles from './ToneFilterBar.module.css';

export interface ToneFilterBarProps {
  active: ExplorerToneFilter;
  onSelect: (tone: ExplorerToneFilter) => void;
}

const PILLS: { label: string; value: ExplorerToneFilter }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'MENACING', value: 'menacing' },
  { label: 'HUMOROUS', value: 'humorous' },
  { label: 'REFLECTIVE', value: 'reflective' },
  { label: 'VULNERABLE', value: 'vulnerable' },
];

export function ToneFilterBar({ active, onSelect }: ToneFilterBarProps) {
  return (
    <div className={styles.row} role="toolbar" aria-label="Tone filter">
      {PILLS.map((pill) => {
        const isActive = active === pill.value;
        return (
          <button
            key={pill.value}
            type="button"
            className={`${styles.pill}${isActive ? ` ${styles.pillActive}` : ''}`}
            aria-pressed={isActive}
            data-active={String(isActive)}
            onClick={() => {
              if (!isActive) onSelect(pill.value);
            }}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
