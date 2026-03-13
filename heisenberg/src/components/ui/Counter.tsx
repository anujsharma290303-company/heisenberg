import { useEffect, useRef, useState } from 'react';

import { easeInOutCubic } from '../../utils/math';
import styles from './Counter.module.css';

export interface CounterProps {
  to: number;
  duration?: number;
  suffix?: string;
  label: string;
}

export function Counter({ to, duration = 1200, suffix = '', label }: CounterProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = rootRef.current;

    if (node === null) {
      return () => undefined;
    }

    const stopFrame = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const nextValue = progress >= 1 ? to : Math.floor(to * easedProgress);

      setValue(Object.is(nextValue, -0) ? 0 : nextValue);

      if (progress >= 1) {
        completedRef.current = true;
        frameRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current || completedRef.current) {
          return;
        }

        startedRef.current = true;
        frameRef.current = requestAnimationFrame(animate);
      },
      { threshold: 0.45 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      stopFrame();
    };
  }, [duration, to]);

  return (
    <div className={styles.root} ref={rootRef}>
      <span className={styles.value}>{`${value}${suffix}`}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}