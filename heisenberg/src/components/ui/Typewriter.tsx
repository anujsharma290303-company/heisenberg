import { useEffect, useRef, useState } from 'react';

import styles from './Typewriter.module.css';

export interface TypewriterProps {
  text: string;
  onComplete?: () => void;
  className?: string;
}

type TypewriterState = 'idle' | 'typing' | 'complete';

export function Typewriter({ text, onComplete, className }: TypewriterProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTextRef = useRef(text);
  const didCompleteRef = useRef(false);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const changedText = prevTextRef.current !== text;
    prevTextRef.current = text;
    didCompleteRef.current = false;

    if (changedText) {
      timeoutRef.current = setTimeout(() => {
        setVisibleCount(0);
      }, 0);
    }

    if (text.length === 0) {
      if (!didCompleteRef.current) {
        didCompleteRef.current = true;
        if (onComplete) {
          onComplete();
        }
      }
      return () => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    let index = 0;
    const tick = () => {
      index += 1;
      setVisibleCount(index);

      if (index >= text.length) {
        if (!didCompleteRef.current) {
          didCompleteRef.current = true;
          if (onComplete) {
            onComplete();
          }
        }
        return;
      }

      const nextDelay = 70 + Math.random() * 50;
      timeoutRef.current = setTimeout(tick, nextDelay);
    };

    const firstDelay = 70 + Math.random() * 50;
    timeoutRef.current = setTimeout(tick, firstDelay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, onComplete]);

  const visibleText = text.slice(0, visibleCount);
  const state: TypewriterState = text.length === 0 ? 'idle' : visibleCount < text.length ? 'typing' : 'complete';
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <span className={classes} data-state={state} data-testid="typewriter-root">
      {visibleText}
      {state === 'typing' ? (
        <span className={styles.cursor} data-testid="typewriter-cursor">
          |
        </span>
      ) : null}
    </span>
  );
}
