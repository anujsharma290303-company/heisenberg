import { useEffect, useRef } from 'react';

import { hexToRgba } from '../../utils/color';
import type { Atom, Molecule } from '../../types/chemistry';
import styles from './MoleculeCanvas.module.css';

export interface MoleculeCanvasProps {
  molecule: Molecule;
  className?: string;
  width?: number;
  height?: number;
}

type RotationRef = {
  x: number;
  y: number;
};

type DragRef = {
  dragging: boolean;
  lastX: number;
  lastY: number;
};

type ProjectedAtom = Atom & {
  index: number;
  sx: number;
  sy: number;
  scale: number;
  depth: number;
  radius: number;
};

const FOV = 520;
const Z_OFFSET = 400;
const AUTO_ORBIT_STEP = 0.008;
const DRAG_SENSITIVITY = 0.005;
const RESUME_DELAY_MS = 2000;
const MODEL_SCALE = 120;

const rotateAndProject = (
  atom: Atom,
  index: number,
  width: number,
  height: number,
  rotation: RotationRef
): ProjectedAtom => {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);

  const x1 = atom.x * cosY + atom.z * sinY;
  const z1 = -atom.x * sinY + atom.z * cosY;

  const y2 = atom.y * cosX - z1 * sinX;
  const z2 = atom.y * sinX + z1 * cosX;

  const scale = FOV / (FOV + z2 + Z_OFFSET);
  const sx = x1 * MODEL_SCALE * scale + width / 2;
  const sy = y2 * MODEL_SCALE * scale + height / 2;
  const radius = Math.max(1, atom.r * 34 * scale);

  return {
    ...atom,
    index,
    sx,
    sy,
    scale,
    depth: z2,
    radius,
  };
};

export function MoleculeCanvas({ molecule, className, width = 960, height = 480 }: MoleculeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const rotationRef = useRef<RotationRef>({ x: 0.24, y: 0 });
  const dragRef = useRef<DragRef>({ dragging: false, lastX: 0, lastY: 0 });
  const autoOrbitRef = useRef(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const draw = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (autoOrbitRef.current) {
        rotationRef.current.y += AUTO_ORBIT_STEP;
      }

      // 1) Rotation matrices, 2) projection
      const projected = molecule.atoms
        .map((atom, index) => rotateAndProject(atom, index, canvas.width, canvas.height, rotationRef.current));

      // 3) Depth sort (far first, near last)
      const depthSorted = [...projected].sort((a, b) => b.depth - a.depth);
      const projectedByIndex = new Map(projected.map((atom) => [atom.index, atom]));

      // 4) Bonds
      for (const [aIndex, bIndex] of molecule.bonds) {
        const atomA = projectedByIndex.get(aIndex);
        const atomB = projectedByIndex.get(bIndex);
        if (!atomA || !atomB) {
          continue;
        }

        const bondGradient = ctx.createLinearGradient(atomA.sx, atomA.sy, atomB.sx, atomB.sy);
        bondGradient.addColorStop(0, atomA.color);
        bondGradient.addColorStop(1, atomB.color);

        ctx.beginPath();
        ctx.moveTo(atomA.sx, atomA.sy);
        ctx.lineTo(atomB.sx, atomB.sy);
        ctx.strokeStyle = bondGradient;
        ctx.lineWidth = Math.max(1.5, (atomA.radius + atomB.radius) * 0.13);
        ctx.stroke();
      }

      // 5) Sphere shading
      for (const atom of depthSorted) {
        const sphereGradient = ctx.createRadialGradient(
          atom.sx - atom.radius * 0.35,
          atom.sy - atom.radius * 0.35,
          atom.radius * 0.15,
          atom.sx,
          atom.sy,
          atom.radius
        );
        sphereGradient.addColorStop(0, '#FFFFFF');
        sphereGradient.addColorStop(0.5, atom.color);
        sphereGradient.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.fillStyle = sphereGradient;
        ctx.arc(atom.sx, atom.sy, atom.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6) Glow pass (radius 3x atom size)
      for (const atom of depthSorted) {
        const glowRadius = atom.radius * 3;
        const glowGradient = ctx.createRadialGradient(atom.sx, atom.sy, atom.radius * 0.2, atom.sx, atom.sy, glowRadius);
        glowGradient.addColorStop(0, hexToRgba(atom.color, 0.33 * atom.glow));
        glowGradient.addColorStop(1, hexToRgba(atom.color, 0));

        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(atom.sx, atom.sy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7) Labels last
      for (const atom of depthSorted) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.max(10, atom.radius * 0.95)}px "IBM Plex Mono"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.label, atom.sx, atom.sy);
      }

      frameIdRef.current = window.requestAnimationFrame(draw);
    };

    frameIdRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [height, molecule, width]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    autoOrbitRef.current = false;

    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.dragging) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.lastX;
    const deltaY = event.clientY - dragRef.current.lastY;

    rotationRef.current.y += deltaX * DRAG_SENSITIVITY;
    rotationRef.current.x += deltaY * DRAG_SENSITIVITY;

    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
  };

  const handleMouseUp = () => {
    if (!dragRef.current.dragging) {
      return;
    }

    dragRef.current.dragging = false;

    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(() => {
      autoOrbitRef.current = true;
    }, RESUME_DELAY_MS);
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
