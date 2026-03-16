import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../../App';
import { useQuoteFilter } from '../../../hooks/useQuoteFilter';
import { useTypedData } from '../../../hooks/useTypedData';
import type { Character } from '../../../types/character';
import type { Quote } from '../../../types/quote';
import { QuotesSection } from '../QuotesSection.tsx';

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(),
}));

vi.mock('../../../hooks/useQuoteFilter', () => ({
  useQuoteFilter: vi.fn(),
}));

vi.mock('../../cards/QuoteCard', () => ({
  QuoteCard: ({ quote, character, index }: { quote: Quote; character: Character; index: number }) => (
    <article
      data-testid={`quote-card-${quote.id}`}
      data-character-id={character.id}
      data-index={String(index)}
    >
      {quote.text}
    </article>
  ),         
}));

vi.mock('../../canvas/FilmGrain', () => ({
  FilmGrain: () => <div data-testid="film-grain" />,
}));

vi.mock('../../canvas/Scanlines', () => ({
  Scanlines: () => <div data-testid="scanlines" />,
}));

vi.mock('../../ui/DotNav', () => ({
  DotNav: () => <nav data-testid="dot-nav" />,
}));

vi.mock('../HeroSection', () => ({
  HeroSection: () => <section id="section-01" data-testid="hero-section" />,
}));

vi.mock('../TimelineSection', () => ({
  TimelineSection: () => <section id="section-02" data-testid="timeline-section" />,
}));

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn((selector) =>
    selector({
      activeSection: 0,
      grainIntensity: 0.028,
      setSection: vi.fn(),
      setGrainIntensity: vi.fn(),
    })
  ),
}));

const mockedUseTypedData = vi.mocked(useTypedData);
const mockedUseQuoteFilter = vi.mocked(useQuoteFilter);

const quotesFixture: Quote[] = [
  {
    id: 'q-001',
    text: 'I am not in danger, Skyler. I am the danger.',
    speaker: 'Walter White',
    characterId: 'walt',
    season: 4,
    episode: 'S04E06',
    tone: 'menacing',
    contextNote: 'Walt asserts dominance.',
  },
  {
    id: 'q-002',
    text: 'Yeah, Mr. White! Yeah, science!',
    speaker: 'Jesse Pinkman',
    characterId: 'jesse',
    season: 1,
    episode: 'S01E07',
    tone: 'humorous',
    contextNote: 'Jesse celebrates.',
  },
];

const charactersFixture: Character[] = [
  {
    id: 'walt',
    name: 'Walter White',
    alias: 'Heisenberg',
    desc: 'A chemistry teacher turned meth kingpin.',
    color: '#4FC3F7',
    seasons: [1, 2, 3, 4, 5],
    role: 'protagonist',
  },
  {
    id: 'jesse',
    name: 'Jesse Pinkman',
    alias: "Cap'n Cook",
    desc: "Walt's former student.",
    color: '#F5A623',
    seasons: [1, 2, 3, 4, 5],
    role: 'partner',
  },
];

describe('QuotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class IntersectionObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);

    mockedUseQuoteFilter.mockReturnValue({
      filtered: quotesFixture,
      resultCount: 2,
      setFilter: vi.fn(),
      setTone: vi.fn(),
      setCharacterId: vi.fn(),
      resetFilters: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders section with id section-03 and section class', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    const { container } = render(<QuotesSection />);
    const section = container.querySelector('#section-03');

    expect(section).not.toBeNull();
    expect(section).toHaveClass('section');
  });

  it('loads quotes with useTypedData and loads characters with useTypedData', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<QuotesSection />);

    expect(mockedUseTypedData).toHaveBeenCalledTimes(2);
  });

  it('filters quotes using useQuoteFilter and renders filtered cards', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    mockedUseQuoteFilter.mockReturnValue({
      filtered: [quotesFixture[0]],
      resultCount: 1,
      setFilter: vi.fn(),
      setTone: vi.fn(),
      setCharacterId: vi.fn(),
      resetFilters: vi.fn(),
    } as never);

    render(<QuotesSection />);

    expect(screen.getAllByTestId(/quote-card-/)).toHaveLength(1);
    expect(screen.getByTestId('quote-card-q-001')).toBeInTheDocument();
  });

  it('shows result count based on filtered list', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    mockedUseQuoteFilter.mockReturnValue({
      filtered: [quotesFixture[0]],
      resultCount: 1,
      setFilter: vi.fn(),
      setTone: vi.fn(),
      setCharacterId: vi.fn(),
      resetFilters: vi.fn(),
    } as never);

    render(<QuotesSection />);

    expect(screen.getByTestId('quotes-result-count')).toHaveTextContent('1');
  });

  it('shows shimmer loading UI while data is loading', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'loading' })
      .mockReturnValueOnce({ status: 'loading' });

    render(<QuotesSection />);

    expect(screen.getAllByTestId('quotes-shimmer')).toHaveLength(6);
  });

  it('shows error panel and retry button when either loader fails', () => {
    const retryQuotes = vi.fn();
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'error', error: new Error('quotes fail'), retry: retryQuotes })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<QuotesSection />);

    expect(screen.getByText('quotes fail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Quotes' })).toBeInTheDocument();
  });

  it('retries the failing loader when retry action is clicked', () => {
    const retryQuotes = vi.fn();
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'error', error: new Error('quotes fail'), retry: retryQuotes })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<QuotesSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry Quotes' }));

    expect(retryQuotes).toHaveBeenCalledTimes(1);
  });

  it('renders zero-state text when filters return no quotes', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    mockedUseQuoteFilter.mockReturnValue({
      filtered: [],
      resultCount: 0,
      setFilter: vi.fn(),
      setTone: vi.fn(),
      setCharacterId: vi.fn(),
      resetFilters: vi.fn(),
    } as never);

    render(<QuotesSection />);

    expect(screen.getByText('No quotes found.')).toBeInTheDocument();
  });

  it('passes index to QuoteCard for stagger sequence', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<QuotesSection />);

    expect(screen.getByTestId('quote-card-q-001')).toHaveAttribute('data-index', '0');
    expect(screen.getByTestId('quote-card-q-002')).toHaveAttribute('data-index', '1');
  });

  it('maps quote characterId to Character prop correctly', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<QuotesSection />);

    expect(screen.getByTestId('quote-card-q-001')).toHaveAttribute('data-character-id', 'walt');
    expect(screen.getByTestId('quote-card-q-002')).toHaveAttribute('data-character-id', 'jesse');
  });

  it('mounts QuotesSection after TimelineSection inside scroll container', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    render(<App />);

    const scrollContainer = document.querySelector('.scroll-container');
    expect(scrollContainer).not.toBeNull();
    if (!scrollContainer) {
      return;
    }

    const thirdSection = scrollContainer.children[2];
    expect(thirdSection).toHaveAttribute('id', 'section-03');
  });

  it('ensures section-03 replaces any placeholder block if present', () => {
    mockedUseTypedData
      .mockReturnValueOnce({ status: 'success', data: quotesFixture, loadedAt: new Date() })
      .mockReturnValueOnce({ status: 'success', data: charactersFixture, loadedAt: new Date() });

    const { container } = render(<QuotesSection />);

    expect(container.querySelector('[data-testid="section-03-placeholder"]')).toBeNull();
    expect(container.querySelector('#section-03')).not.toBeNull();
  });
});
