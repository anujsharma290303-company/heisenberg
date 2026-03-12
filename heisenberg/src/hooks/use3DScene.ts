import { useCallback, useEffect, useRef } from 'react';

export type SceneType = 'desert' | 'molecule';

export interface Use3DSceneOptions {
  scene: SceneType;
}

export interface Use3DSceneResult {
  scene: SceneType;
  onMouseDown: (event: MouseEventLike) => void;
  onMouseMove: (event: MouseEventLike) => void;
  onMouseUp: () => void;
}

interface MouseEventLike {
  clientX: number;
  clientY: number;
}

interface Point {
  x: number;
  y: number;
}

export const use3DScene = (options: Use3DSceneOptions): Use3DSceneResult => {
  const sceneRef = useRef<SceneType>(options.scene);
  const isDraggingRef = useRef(false);
  const autoOrbitRef = useRef(true);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const rotationRef = useRef<Point>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const resumeOrbitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sceneRef.current = options.scene;
  }, [options.scene]);

  const onMouseDown = useCallback((event: MouseEventLike) => {
    isDraggingRef.current = true;
    autoOrbitRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };

    if (resumeOrbitTimerRef.current !== null) {
      clearTimeout(resumeOrbitTimerRef.current);
      resumeOrbitTimerRef.current = null;
    }
  }, []);

  const onMouseMove = useCallback((event: MouseEventLike) => {
    if (!isDraggingRef.current) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;

    rotationRef.current = {
      x: rotationRef.current.x + dy * 0.005,
      y: rotationRef.current.y + dx * 0.005,
    };

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;

    if (resumeOrbitTimerRef.current !== null) {
      clearTimeout(resumeOrbitTimerRef.current);
    }

    resumeOrbitTimerRef.current = setTimeout(() => {
      autoOrbitRef.current = true;
      resumeOrbitTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    const tick = (): void => {
      if (autoOrbitRef.current && !isDraggingRef.current) {
        rotationRef.current.y += sceneRef.current === 'molecule' ? 0.008 : 0.004;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (resumeOrbitTimerRef.current !== null) {
        clearTimeout(resumeOrbitTimerRef.current);
        resumeOrbitTimerRef.current = null;
      }
    };
  }, []);

  return {
    scene: options.scene,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
