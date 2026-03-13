import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGlitchOptions {
  duration?: number;
  always?: boolean;
  intervalMs?: number;
}

export interface UseGlitchResult {
  isGlitching: boolean;
  trigger: () => void;
}

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const useGlitch = (options: UseGlitchOptions = {}): UseGlitchResult => {
  const duration = options.duration ?? 400;
  const always = options.always ?? false;
  const intervalMs = options.intervalMs;

  const [isGlitching, setIsGlitching] = useState(false);
  const isGlitchingRef = useRef(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEndTimer = useCallback(() => {
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  }, []);

  const trigger = useCallback(() => {
    if (isGlitchingRef.current) {
      return;
    }

    isGlitchingRef.current = true;
    setIsGlitching(true);
    clearEndTimer();

    endTimerRef.current = setTimeout(() => {
      isGlitchingRef.current = false;
      setIsGlitching(false);
      endTimerRef.current = null;
    }, duration);
  }, [clearEndTimer, duration]);

  useEffect(() => {
    if (!always) {
      return () => undefined;
    }

    const schedule = (): void => {
      const delay = intervalMs ?? randomInRange(3000, 7000);
      loopTimerRef.current = setTimeout(() => {
        trigger();
        schedule();
      }, delay);
    };

    schedule();

    return () => {
      if (loopTimerRef.current !== null) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
  }, [always, intervalMs, trigger]);

  useEffect(() => {
    return () => {
      clearEndTimer();
      if (loopTimerRef.current !== null) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    };
  }, [clearEndTimer]);

  return {
    isGlitching,
    trigger,
  };
};
