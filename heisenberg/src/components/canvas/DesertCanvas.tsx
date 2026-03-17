import { useEffect, useRef } from 'react';

export interface DesertCanvasProps {
  particleCount?: number;
}

interface DesertParticle {
  x: number;
  y: number;
  z: number;
  speed: number;
}

const X_RANGE = 780;
const Y_RANGE = 520;
const Z_RANGE = 280;

const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

const createParticle = (): DesertParticle => ({
  x: randomInRange(-X_RANGE, X_RANGE),
  y: randomInRange(-Y_RANGE, Y_RANGE),
  z: randomInRange(-Z_RANGE, Z_RANGE),
  speed: randomInRange(0.3, 1.2),
});

export function DesertCanvas({ particleCount = 1400 }: DesertCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const particlesRef = useRef<DesertParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle());

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
      const context = ctxRef.current;
      if (context) {
        const width = canvas.width;
        const height = canvas.height;

        context.clearRect(0, 0, width, height);

        for (const particle of particlesRef.current) {
          const scale = 300 / (300 + particle.z + 400);
          const sx = particle.x * scale + width / 2;
          const sy = particle.y * scale + height / 2;
          const opacity = Math.max(0, Math.min(1, (particle.z + Z_RANGE) / (Z_RANGE * 2)));
          const radius = Math.max(0.7, scale * 2.2);

          context.beginPath();
          context.fillStyle = `rgba(46, 204, 113, ${opacity})`;
          context.arc(sx, sy, radius, 0, Math.PI * 2);
          context.fill();

          particle.x -= particle.speed;

          if (particle.x < -X_RANGE) {
            particle.x = X_RANGE;
            particle.y = randomInRange(-Y_RANGE, Y_RANGE);
            particle.z = randomInRange(-Z_RANGE, Z_RANGE);
            particle.speed = randomInRange(0.3, 1.2);
          }
        }
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
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
