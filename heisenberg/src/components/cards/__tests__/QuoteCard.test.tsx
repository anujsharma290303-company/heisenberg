import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useExplorerStore } from '../../../stores/useExplorerStore';
import type { Character } from '../../../types/character';
import type { Quote, QuoteTone } from '../../../types/quote';
import { QuoteCard } from '../QuoteCard.tsx';

vi.mock('framer-motion', () => ({
  motion: {
    article: ({ children, layoutId, ...props }: ComponentProps<'article'> & { layoutId?: string }) => (
      <article data-layout-id={layoutId} {...props}>
        {children}
      </article>
    ),
  },
}));

vi.mock('../../../stores/useExplorerStore', () => ({
  useExplorerStore: vi.fn(),
}));

const mockedUseExplorerStore = vi.mocked(useExplorerStore);

const characterFixture: Character = {
  id: 'walt',
  name: 'Walter White',
  alias: 'Heisenberg',
  bestQuote: 'I am the one who knocks.',
  desc: 'A chemistry teacher turned meth kingpin, driven by pride and survival.',
  color: '#4FC3F7',
  seasons: [1, 2, 3, 4, 5],
  role: 'protagonist',
};

const quoteFixture: Quote = {
  id: 'q-100',
  text: 'I am not in danger, Skyler. I am the danger.',
  speaker: 'Walter White',
  characterId: 'walt',
  season: 4,
  episode: 'S04E07',
  tone: 'menacing',
  contextNote: 'Walt asserts dominance.',
};

describe('QuoteCard', () => {
  let selectCharSpy: ReturnType<typeof vi.fn<(char: Character) => void>>;
  let clearCharSpy: ReturnType<typeof vi.fn<() => void>>;
  let openQuoteSpy: ReturnType<typeof vi.fn<(quote: Quote) => void>>;
  let closeQuoteSpy: ReturnType<typeof vi.fn<() => void>>;
  let setToneSpy: ReturnType<typeof vi.fn<(tone: 'all' | QuoteTone) => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    selectCharSpy = vi.fn<(char: Character) => void>();
    clearCharSpy = vi.fn<() => void>();
    openQuoteSpy = vi.fn<(quote: Quote) => void>();
    closeQuoteSpy = vi.fn<() => void>();
    setToneSpy = vi.fn<(tone: 'all' | QuoteTone) => void>();

    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar: null,
        activeQuote: null,
        toneFilter: 'all',
        selectChar: selectCharSpy,
        clearChar: clearCharSpy,
        openQuote: openQuoteSpy,
        closeQuote: closeQuoteSpy,
        setTone: setToneSpy,
      })
    );
  });

  it('renders opening quote mark with character color at 35 percent opacity', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    const mark = screen.getByTestId('quote-open-mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveStyle('color: rgb(79, 195, 247)');
    expect(mark).toHaveStyle('opacity: 0.35');
  });

  it('renders quote text with 4-line clamp class hook', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    const text = screen.getByTestId('quote-text');
    expect(text).toHaveTextContent('I am not in danger, Skyler. I am the danger.');
    expect(text).toHaveClass('clamp4');
  });

  it('renders speaker name using display typography class', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    const speaker = screen.getByTestId('quote-speaker');
    expect(speaker).toHaveTextContent('Walter White');
    expect(speaker).toHaveClass('speaker');
  });

  it('renders season code using formatSeason as S04E07 style output', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    expect(screen.getByTestId('quote-season')).toHaveTextContent('S04E07');
  });

  it('sets stagger custom property and animation delay formula based on index', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={3} />);

    const card = screen.getByTestId('quote-card-q-100');
    expect(card).toHaveStyle('--stagger-i: 3');
    expect(card).toHaveStyle('animation-delay: calc(var(--stagger-i) * 60ms)');
  });

  it('uses fadeUp animation hook class', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    expect(screen.getByTestId('quote-card-q-100')).toHaveClass('fadeUp');
  });

  it('applies hover interaction hooks for transform, border, background, and box-shadow', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    const card = screen.getByTestId('quote-card-q-100');

    fireEvent.mouseEnter(card);

    expect(card).toHaveClass('hoverable');
    expect(card).toHaveAttribute('data-hover-transform', 'translateY(-6px) scale(1.01)');
    expect(card).toHaveAttribute('data-hover-border-color', '#4FC3F7');
    expect(card).toHaveAttribute('data-hover-bg-from', '#0F0F0F');
    expect(card).toHaveAttribute('data-hover-bg-to', '#161616');
    expect(card).toHaveAttribute('data-hover-shadow-alpha', '0.22');
  });

  it('calls openQuote with quote payload on click', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    fireEvent.click(screen.getByTestId('quote-card-q-100'));

    expect(openQuoteSpy).toHaveBeenCalledWith(quoteFixture);
  });

  it('uses Framer Motion layoutId quote-{quote.id}', () => {
    render(<QuoteCard quote={quoteFixture} character={characterFixture} index={0} />);

    expect(screen.getByTestId('quote-card-q-100')).toHaveAttribute('data-layout-id', 'quote-q-100');
  });
});
