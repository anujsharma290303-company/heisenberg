import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FilmGrain } from '../FilmGrain';

describe('FilmGrain', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders canvas', () => {
    const { container } = render(<FilmGrain />);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
  });

  it('calls getContext 2d on mount', () => {
    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(
        ((contextId: string) => (contextId === '2d' ? ({} as CanvasRenderingContext2D) : null)) as unknown as
          HTMLCanvasElement['getContext']
      );

    render(<FilmGrain />);

    expect(getContextSpy).toHaveBeenCalledWith('2d', { willReadFrequently: true });
  });

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { unmount } = render(<FilmGrain />);
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('disconnects ResizeObserver on unmount', () => {
    const disconnect = vi.fn();

    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const { unmount } = render(<FilmGrain />);
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('updates all RGBA channels to create colored grain noise', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });

    vi.spyOn(Math, 'random').mockReturnValue(1);

    const pixels = new Uint8ClampedArray(4);
    const ctx = {
      getImageData: vi.fn(() => ({ data: pixels } as ImageData)),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      ((contextId: string) => (contextId === '2d' ? ctx : null)) as unknown as HTMLCanvasElement['getContext']
    );

    render(<FilmGrain intensity={0.06} />);

    const drawFrame = rafCallbacks[0];
    if (drawFrame) {
      drawFrame(0);
    }

    expect(pixels[0]).toBe(15);
    expect(pixels[1]).toBe(15);
    expect(pixels[2]).toBe(15);
    expect(pixels[3]).toBe(15);
  });
});