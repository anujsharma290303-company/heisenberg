import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../../App';
import { useExplorerStore } from '../../../stores/useExplorerStore';
import { useUIStore } from '../../../stores/useUIStore';
import type { Character } from '../../../types/character';
import type { Quote } from '../../../types/quote';
import { QuoteReveal } from '../QuoteReveal.tsx';

// ---------------------------------------------------------------------------
// Framer Motion mock — AnimatePresence passes children through; motion.div
// renders as a plain div, forwarding layoutId as data-layout-id.
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      layoutId,
      ...props
    }: ComponentProps<'div'> & { layoutId?: string }) => (
      <div data-layout-id={layoutId} {...props}>
        {children}
      </div>
    ),
  },
}));

// ---------------------------------------------------------------------------
// Store mocks
// ---------------------------------------------------------------------------
vi.mock('../../../stores/useExplorerStore', () => ({
  useExplorerStore: vi.fn(),
}));

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

// ---------------------------------------------------------------------------
// GlitchText mock — renders a span with observable props
// ---------------------------------------------------------------------------
vi.mock('../../ui/GlitchText', () => ({
  GlitchText: ({
    children,
    always,
    className,
  }: {
    children: string;
    always?: boolean;
    className?: string;
  }) => (
    <span
      data-testid="glitch-text"
      data-always={String(always ?? false)}
      className={className}
    >
      {children}
    </span>
  ),
}));

// ---------------------------------------------------------------------------
// App-level mocks (for App wiring tests only)
// ---------------------------------------------------------------------------
vi.mock('../../canvas/FilmGrain', () => ({
  FilmGrain: () => <div data-testid="film-grain" />,
}));

vi.mock('../../canvas/Scanlines', () => ({
  Scanlines: () => <div data-testid="scanlines" />,
}));

vi.mock('../../ui/DotNav', () => ({
  DotNav: () => <nav data-testid="dot-nav" />,
}));

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(() => ({ status: 'idle' })),
}));

vi.mock('../../sections/HeroSection', () => ({
  HeroSection: () => <section id="section-01" data-testid="hero-section" />,
}));

vi.mock('../../sections/TimelineSection', () => ({
  TimelineSection: () => <section id="section-02" data-testid="timeline-section" />,
}));

vi.mock('../../sections/QuotesSection', () => ({
  QuotesSection: () => <section id="section-03" data-testid="quotes-section" />,
}));

vi.mock('../../sections/ChemistrySection', () => ({
  ChemistrySection: () => <section id="section-04" data-testid="chemistry-section" />,
}));

vi.mock('../../cards/QuoteCard', () => ({
  QuoteCard: () => <article />,
}));

vi.mock('../../../hooks/useQuoteFilter', () => ({
  useQuoteFilter: vi.fn(() => ({
    filtered: [],
    resultCount: 0,
    setFilter: vi.fn(),
    setTone: vi.fn(),
    setCharacterId: vi.fn(),
    resetFilters: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const characterFixture: Character = {
  id: 'walt',
  name: 'Walter White',
  alias: 'Heisenberg',
  bestQuote: 'I am the one who knocks.',
  desc: 'A chemistry teacher turned meth kingpin.',
  color: '#4FC3F7',
  seasons: [1, 2, 3, 4, 5],
  role: 'protagonist',
};

const quoteFixture: Quote = {
  id: 'q-001',
  text: 'I am not in danger, Skyler. I am the danger.',
  speaker: 'Walter White',
  characterId: 'walt',
  season: 4,
  episode: 'S04E06',
  tone: 'menacing',
  contextNote: 'Walt asserts dominance.',
};

// ---------------------------------------------------------------------------
// Store mock helpers
// ---------------------------------------------------------------------------
const mockedUseExplorerStore = vi.mocked(useExplorerStore);
const mockedUseUIStore = vi.mocked(useUIStore);

function mockStores({
  activeQuote = null,
  closeQuote = vi.fn<() => void>(),
  setGrainIntensity = vi.fn<(value: number) => void>(),
}: {
  activeQuote?: Quote | null;
  closeQuote?: ReturnType<typeof vi.fn<() => void>>;
  setGrainIntensity?: ReturnType<typeof vi.fn<(value: number) => void>>;
} = {}) {
  mockedUseExplorerStore.mockImplementation((selector) =>
    selector({
      selectedChar: null,
      activeQuote,
      toneFilter: 'all',
      selectChar: vi.fn(),
      clearChar: vi.fn(),
      openQuote: vi.fn(),
      closeQuote,
      setTone: vi.fn(),
    })
  );

  mockedUseUIStore.mockImplementation((selector) =>
    selector({
      activeSection: 0,
      grainIntensity: 0.028,
      setSection: vi.fn(),
      setGrainIntensity,
    })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('QuoteReveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when character prop is null and activeQuote is null', () => {
    mockStores({ activeQuote: null });

    const { container } = render(<QuoteReveal character={null} />);

    expect(container.querySelector('[data-testid="quote-reveal-overlay"]')).toBeNull();
  });

  it('renders overlay when activeQuote is set', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-overlay')).toBeInTheDocument();
  });

  it('renders opening quote mark with character color when character is non-null', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    const mark = screen.getByTestId('quote-reveal-mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveStyle('color: #4FC3F7');
  });

  it('renders opening quote mark with --color-crystal fallback when character is null', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={null} />);

    const mark = screen.getByTestId('quote-reveal-mark');
    expect(mark).toHaveStyle('color: var(--color-crystal)');
  });

  it('renders full untruncated quote text', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-text')).toHaveTextContent(
      'I am not in danger, Skyler. I am the danger.'
    );
  });

  it('renders GlitchText with always={true} for speaker name', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    const glitch = screen.getByTestId('glitch-text');
    expect(glitch).toBeInTheDocument();
    expect(glitch).toHaveAttribute('data-always', 'true');
    expect(glitch).toHaveTextContent('Walter White');
  });

  it('renders tone in uppercase monospace metadata', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-tone')).toHaveTextContent('MENACING');
  });

  it('renders season code directly from quote.episode string', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-episode')).toHaveTextContent('S04E06');
  });

  it('renders close hint text at bottom', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-hint')).toHaveTextContent('click anywhere to close');
  });

  it('calls closeQuote when backdrop is clicked', () => {
    const closeQuote = vi.fn();
    mockStores({ activeQuote: quoteFixture, closeQuote });

    render(<QuoteReveal character={characterFixture} />);

    const overlay = screen.getByTestId('quote-reveal-overlay');
    fireEvent.click(overlay);

    expect(closeQuote).toHaveBeenCalledTimes(1);
  });

  it('calls closeQuote when Escape key is pressed', () => {
    const closeQuote = vi.fn();
    mockStores({ activeQuote: quoteFixture, closeQuote });

    render(<QuoteReveal character={characterFixture} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(closeQuote).toHaveBeenCalledTimes(1);
  });

  it('does not close when click target is inner content box', () => {
    const closeQuote = vi.fn();
    mockStores({ activeQuote: quoteFixture, closeQuote });

    render(<QuoteReveal character={characterFixture} />);

    const content = screen.getByTestId('quote-reveal-content');
    fireEvent.click(content);

    expect(closeQuote).not.toHaveBeenCalled();
  });

  it('calls setGrainIntensity(0.07) on mount', () => {
    const setGrainIntensity = vi.fn();
    mockStores({ activeQuote: quoteFixture, setGrainIntensity });

    render(<QuoteReveal character={characterFixture} />);

    expect(setGrainIntensity).toHaveBeenCalledWith(0.07);
  });

  it('calls setGrainIntensity(0.028) on unmount', () => {
    const setGrainIntensity = vi.fn();
    mockStores({ activeQuote: quoteFixture, setGrainIntensity });

    const { unmount } = render(<QuoteReveal character={characterFixture} />);
    setGrainIntensity.mockClear();
    unmount();

    expect(setGrainIntensity).toHaveBeenCalledWith(0.028);
  });

  it('uses Framer Motion layoutId quote-{activeQuote.id} on inner content div', () => {
    mockStores({ activeQuote: quoteFixture });

    render(<QuoteReveal character={characterFixture} />);

    expect(screen.getByTestId('quote-reveal-content')).toHaveAttribute(
      'data-layout-id',
      'quote-q-001'
    );
  });
});

describe('App QuoteReveal wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockAppStores({
    activeQuote = null,
  }: { activeQuote?: Quote | null } = {}) {
    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar: null,
        activeQuote,
        toneFilter: 'all',
        selectChar: vi.fn(),
        clearChar: vi.fn(),
        openQuote: vi.fn(),
        closeQuote: vi.fn(),
        setTone: vi.fn(),
      })
    );

    mockedUseUIStore.mockImplementation((selector) =>
      selector({
        activeSection: 0,
        grainIntensity: 0.028,
        setSection: vi.fn(),
        setGrainIntensity: vi.fn(),
      })
    );
  }

  it('mounts QuoteReveal outside the scroll container', () => {
    mockAppStores({ activeQuote: quoteFixture });

    render(<App />);

    const scrollContainer = document.querySelector('.scroll-container');
    const overlay = screen.getByTestId('quote-reveal-overlay');

    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer).not.toContainElement(overlay);
  });

  it('renders QuoteReveal when activeQuote is set in store', () => {
    mockAppStores({ activeQuote: quoteFixture });

    render(<App />);

    expect(screen.getByTestId('quote-reveal-overlay')).toBeInTheDocument();
  });

  it('does not render QuoteReveal content when activeQuote is null', () => {
    mockAppStores({ activeQuote: null });

    render(<App />);

    expect(screen.queryByTestId('quote-reveal-overlay')).not.toBeInTheDocument();
  });
});
