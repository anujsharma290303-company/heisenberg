import styles from './GlitchText.module.css';
import { useGlitch } from '../../hooks/useGlitch.ts';

export interface GlitchTextProps {
  children: string;
  always?: boolean;
  className?: string;
  duration?: number;
}

export function GlitchText({
  children,
  always = false,
  className,
  duration = 400,
}: GlitchTextProps) {
  const { isGlitching, trigger } = useGlitch({ always, duration });

  const classes = [styles.glitchText, className, isGlitching ? styles.active : '', isGlitching ? 'active' : '']
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
