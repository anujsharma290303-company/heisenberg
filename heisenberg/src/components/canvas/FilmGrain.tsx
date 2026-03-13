import { useEffect, useRef } from 'react';

import { useUIStore } from '../../stores/useUIStore.ts';

export interface FilmGrainProps {
  intensity?: number;
}

export function FilmGrain({ intensity }: FilmGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const grainIntensity = useUIStore((state) => state.grainIntensity);
  const effectiveIntensity = intensity ?? grainIntensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        resizeCanvas();
      });

      observer.observe(document.body);
      resizeObserverRef.current = observer;
    }

    resizeCanvas();

    const draw = () => {
      const canDraw =
        ctx !== null &&
        typeof ctx.getImageData === 'function' &&
        typeof ctx.putImageData === 'function' &&
        canvas.width > 0 &&
        canvas.height > 0;

      if (canDraw) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          data[i + 3] = Math.random() * 255 * effectiveIntensity;
        }

        ctx.putImageData(imageData, 0, 0);
      }

      frameRef.current = window.requestAnimationFrame(draw);
    };

    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [effectiveIntensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }}
    />
  );
}
