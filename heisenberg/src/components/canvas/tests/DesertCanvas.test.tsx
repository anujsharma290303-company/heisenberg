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
});
