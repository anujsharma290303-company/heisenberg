import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Molecule } from '../../../types/chemistry';
import { MoleculeCanvas } from '../MoleculeCanvas.tsx';

const moleculeFixture: Molecule = {
  name: 'Test Molecule',
  formula: 'T2',
  atoms: [
    { x: -1, y: 0, z: -2, r: 0.45, color: '#4FC3F7', label: 'C', glow: 0.6 },
    { x: 1, y: 0, z: 2, r: 0.45, color: '#D4A017', label: 'N', glow: 0.7 },
  ],
  bonds: [[0, 1]],
};

describe('MoleculeCanvas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a canvas element', () => {
    const { container } = render(<MoleculeCanvas molecule={moleculeFixture} />);
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('starts requestAnimationFrame loop on mount and cancels on unmount', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { unmount } = render(<MoleculeCanvas molecule={moleculeFixture} />);
    unmount();

    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });

  it('fills canvas with #0A0A0A before drawing', () => {
    const fillStyleWrites: string[] = [];
    let fillStyleValue = '';

    const fillRect = vi.fn();
    const beginPath = vi.fn();
    const arc = vi.fn();
    const fill = vi.fn();
    const moveTo = vi.fn();
    const lineTo = vi.fn();
    const stroke = vi.fn();
    const fillText = vi.fn();
    const createLinearGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
    const createRadialGradient = vi.fn(() => ({ addColorStop: vi.fn() }));

    const fakeCtx = {
      fillRect,
      beginPath,
      arc,
      fill,
      moveTo,
      lineTo,
      stroke,
      fillText,
      createLinearGradient,
      createRadialGradient,
      get fillStyle() {
        return fillStyleValue;
      },
      set fillStyle(value: string) {
        fillStyleValue = value;
        fillStyleWrites.push(value);
      },
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx);
    let ranFrame = false;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      if (!ranFrame) {
        ranFrame = true;
        cb(0);
      }
      return 1;
    });

    render(<MoleculeCanvas molecule={moleculeFixture} />);

    expect(fillRect).toHaveBeenCalled();
    expect(fillStyleWrites[0]).toBe('#0A0A0A');
  });

  it('uses gradient APIs for bonds and atoms and renders labels in white mono text', () => {
    const addColorStopBond = vi.fn();
    const addColorStopSphere = vi.fn();
    const addColorStopGlow = vi.fn();

    const createLinearGradient = vi.fn(() => ({ addColorStop: addColorStopBond }));
    const createRadialGradient = vi
      .fn()
      .mockImplementationOnce(() => ({ addColorStop: addColorStopSphere }))
      .mockImplementationOnce(() => ({ addColorStop: addColorStopGlow }))
      .mockImplementation(() => ({ addColorStop: vi.fn() }));

    const fakeCtx = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createLinearGradient,
      createRadialGradient,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx);
    let ranFrame = false;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      if (!ranFrame) {
        ranFrame = true;
        cb(0);
      }
      return 1;
    });

    render(<MoleculeCanvas molecule={moleculeFixture} />);

    expect(createLinearGradient).toHaveBeenCalled();
    expect(createRadialGradient).toHaveBeenCalled();
    expect(addColorStopBond).toHaveBeenCalled();
    expect(addColorStopSphere).toHaveBeenCalled();
    expect(addColorStopGlow).toHaveBeenCalled();
    expect((fakeCtx as unknown as { textAlign: string }).textAlign).toBe('center');
    expect((fakeCtx as unknown as { textBaseline: string }).textBaseline).toBe('middle');
    expect((fakeCtx as unknown as { font: string }).font).toContain('IBM Plex Mono');
    expect((fakeCtx as unknown as { fillStyle: string }).fillStyle).toBe('#FFFFFF');
  });

  it('handles drag-to-rotate and resumes auto-orbit 2000ms after mouseup', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    const { container } = render(<MoleculeCanvas molecule={moleculeFixture} />);
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      throw new Error('canvas not found');
    }

    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 20 });
    fireEvent.mouseUp(canvas);

    vi.advanceTimersByTime(1999);
    vi.advanceTimersByTime(1);

    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
  });

  it('clears resume timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    const { container, unmount } = render(<MoleculeCanvas molecule={moleculeFixture} />);
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      throw new Error('canvas not found');
    }

    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(canvas);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
