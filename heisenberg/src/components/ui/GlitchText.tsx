import styles from './GlitchText.module.css';
import { useGlitch } from '../../hooks/useGlitch';

export interface GlitchTextProps {
  children: string;
  always?: boolean;
  className?: string;
  duration?: number;
  intervalMs?: number;
}

export function GlitchText({
  children,
  always = false,
  className,
  duration = 400,
  intervalMs,
}: GlitchTextProps) {
  const { isGlitching, trigger } = useGlitch({ always, duration, intervalMs });

  const classes = [
    styles.glitch,
    isGlitching ? styles.active : '',
    isGlitching ? 'active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      data-text={children}
      onMouseEnter={() => {
        if (!always) {
          trigger();
        }
      }}
    >
      {children}
    </span>
  );
}
