import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroSection } from '../HeroSection';
import { useUIStore } from '../../../stores/useUIStore';

vi.mock('../../canvas/DesertCanvas', () => ({
  DesertCanvas: () => <div data-testid="desert-canvas" />,
}));

vi.mock('../../ui/GlitchText', () => ({
  GlitchText: ({ children }: { children: string }) => (
    <span data-testid="glitch-title">{children}</span>
  ),
}));

vi.mock('../../ui/Typewriter', () => ({
  Typewriter: ({ text, onComplete }: { text: string; onComplete?: () => void }) => (
    <button
      type="button"
      data-testid="typewriter"
      data-text={text}
      onClick={() => {
        if (onComplete) {
          onComplete();
        }
      }}
    >
      typewriter
    </button>
  ),
}));

vi.mock('../../ui/Counter', () => ({
  Counter: ({
    to,
    label,
    suffix,
  }: {
    to: number;
    label: string;
    suffix?: string;
  }) => (
    <div
      data-testid="counter"
      data-to={String(to)}
      data-label={label}
      data-suffix={suffix ?? ''}
    >
      {label}
    </div>
  ),
}));

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

const mockedUseUIStore = vi.mocked(useUIStore);

describe('HeroSection', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observerOptions: IntersectionObserverInit | undefined;
  let observedElement: Element | null = null;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let setSectionSpy: (index: number) => void;

  const triggerVisibility = (isIntersecting: boolean) => {
    if (observerCallback === null || observedElement === null) {
      throw new Error('IntersectionObserver has not been initialized');
    }

    const callback = observerCallback;
    const target = observedElement;

    act(() => {
      callback(
        [
          {
            isIntersecting,
            target,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    observerCallback = null;
    observerOptions = undefined;
    observedElement = null;

    disconnectSpy = vi.fn();
    setSectionSpy = vi.fn<(index: number) => void>();

    mockedUseUIStore.mockImplementation((selector) =>
      selector({
        activeSection: 0,
        grainIntensity: 0.028,
        setSection: setSectionSpy,
        setGrainIntensity: vi.fn(),
      })
    );

    class IntersectionObserverMock {
      observe = vi.fn((element: Element) => {
        observedElement = element;
      });

      unobserve = vi.fn();
      disconnect = disconnectSpy;

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerCallback = callback;
        observerOptions = options;
      }
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);
  });

  it('renders section root with id section-01 and class section', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('#section-01');
    expect(section).not.toBeNull();
    expect(section).toHaveClass('section');
  });

  it('renders DesertCanvas as background content', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('desert-canvas')).toBeInTheDocument();
  });

  it('renders GlitchText showing HEISENBERG', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('glitch-title')).toHaveTextContent('HEISENBERG');
  });

  it('renders Typewriter showing I am the one who knocks.', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('typewriter')).toHaveAttribute('data-text', 'I am the one who knocks.');
  });

  it('renders a scroll prompt at bottom area', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('scroll-prompt')).toBeInTheDocument();
  });

  it('does not render counters before typewriter completion', () => {
    render(<HeroSection />);

    expect(screen.queryAllByTestId('counter')).toHaveLength(0);
  });

  it('renders the 4 required counters after typewriter onComplete', () => {
    render(<HeroSection />);

    fireEvent.click(screen.getByTestId('typewriter'));

    expect(screen.getAllByTestId('counter')).toHaveLength(4);
  });

  it('renders EMMY AWARDS counter with suffix +', () => {
    render(<HeroSection />);

    fireEvent.click(screen.getByTestId('typewriter'));

    const emmy = screen
      .getAllByTestId('counter')
      .find((node) => node.getAttribute('data-label') === 'EMMY AWARDS');
    expect(emmy).toHaveAttribute('data-to', '16');
    expect(emmy).toHaveAttribute('data-suffix', '+');
  });

  it('renders IMDB RATING counter with suffix .5/10', () => {
    render(<HeroSection />);

    fireEvent.click(screen.getByTestId('typewriter'));

    const imdb = screen
      .getAllByTestId('counter')
      .find((node) => node.getAttribute('data-label') === 'IMDB RATING');
    expect(imdb).toHaveAttribute('data-to', '9');
    expect(imdb).toHaveAttribute('data-suffix', '.5/10');
  });

  it('creates IntersectionObserver with threshold 0.45', () => {
    render(<HeroSection />);

    expect(observerOptions).toEqual({ threshold: 0.45 });
  });

  it('adds revealed class when section becomes visible', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('#section-01');

    expect(section).not.toHaveClass('revealed');

    triggerVisibility(true);

    expect(section).toHaveClass('revealed');
  });

  it('calls useUIStore.setSection with 0 when section becomes visible', () => {
    render(<HeroSection />);

    triggerVisibility(true);

    expect(setSectionSpy).toHaveBeenCalledWith(0);
  });

  it('disconnects IntersectionObserver on unmount', () => {
    const { unmount } = render(<HeroSection />);

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});