import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DesertCanvas } from '../DesertCanvas.tsx';

describe('DesertCanvas', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders a canvas element', () => {
    const { container } = render(<DesertCanvas />);

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('calls getContext 2d on mount', () => {
    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(
        ((contextId: string) => (contextId === '2d' ? ({} as CanvasRenderingContext2D) : null)) as unknown as
          HTMLCanvasElement['getContext']
      );

    render(<DesertCanvas />);

    expect(getContextSpy).toHaveBeenCalledWith('2d');
  });

  it('starts requestAnimationFrame loop on mount', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    render(<DesertCanvas />);

    expect(rafSpy).toHaveBeenCalled();
  });

  it('cancels animation frame on unmount', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { unmount } = render(<DesertCanvas />);
    unmount();

    expect(cancelSpy).toHaveBeenCalledWith(42);
  });

  it('disconnects ResizeObserver on unmount', () => {
    const disconnect = vi.fn();

    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const { unmount } = render(<DesertCanvas />);
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('renders amber and white particle variants for cinematic dust/smoke feel', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });

    const sequence = [
      0.5, 0.5, 0.5, 0.5, 0.2,
      0.5, 0.5, 0.5, 0.5, 0.95,
    ];
    let pointer = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const value = sequence[pointer % sequence.length];
      pointer += 1;
      return value;
    });

    const fillStyles: string[] = [];
    const contextStub = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      set fillStyle(value: string) {
        fillStyles.push(value);
      },
      get fillStyle() {
        return '';
      },
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      ((contextId: string) => (contextId === '2d' ? contextStub : null)) as unknown as HTMLCanvasElement['getContext']
    );

    render(<DesertCanvas particleCount={2} />);

    const firstFrame = rafCallbacks[0];
    if (firstFrame) {
      firstFrame(0);
    }

    expect(fillStyles.some((style) => style.startsWith('rgba(212, 160, 23,'))).toBe(true);
    expect(fillStyles.some((style) => style.startsWith('rgba(255, 255, 255,'))).toBe(true);
  });

  it('uses a minimum particle radius of 1 for far particles', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(1);
    const arcSpy = vi.fn();
    const contextStub = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: arcSpy,
      fill: vi.fn(),
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      ((contextId: string) => (contextId === '2d' ? contextStub : null)) as unknown as HTMLCanvasElement['getContext']
    );

    render(<DesertCanvas particleCount={1} />);

    const firstFrame = rafCallbacks[0];
    if (firstFrame) {
      firstFrame(0);
    }

    const radius = arcSpy.mock.calls[0]?.[2] as number;
    expect(radius).toBeGreaterThanOrEqual(1);

    randomSpy.mockRestore();
  });
});
