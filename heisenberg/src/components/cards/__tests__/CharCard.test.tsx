import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useExplorerStore } from '../../../stores/useExplorerStore';
import type { Character } from '../../../types/character';
import type { Quote, QuoteTone } from '../../../types/quote';
import { CharCard } from '../CharCard.tsx';

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

describe('CharCard', () => {
  let selectCharSpy: ReturnType<typeof vi.fn<(char: Character) => void>>;
  let clearCharSpy: ReturnType<typeof vi.fn<() => void>>;
  let openQuoteSpy: ReturnType<typeof vi.fn<(quote: Quote) => void>>;
  let closeQuoteSpy: ReturnType<typeof vi.fn<() => void>>;
  let setToneSpy: ReturnType<typeof vi.fn<(tone: 'all' | QuoteTone) => void>>;
  let selectedChar: Character | null;

  beforeEach(() => {
    vi.clearAllMocks();
    selectCharSpy = vi.fn<(char: Character) => void>();
    clearCharSpy = vi.fn<() => void>();
    openQuoteSpy = vi.fn<(quote: Quote) => void>();
    closeQuoteSpy = vi.fn<() => void>();
    setToneSpy = vi.fn<(tone: 'all' | QuoteTone) => void>();
    selectedChar = null;

    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar,
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

  it('renders name in display slot, alias in mono slot, description in serif slot', () => {
    render(<CharCard character={characterFixture} index={0} />);

    expect(screen.getByRole('heading', { name: 'Walter White' })).toBeInTheDocument();
    expect(screen.getByText('Heisenberg')).toBeInTheDocument();
    expect(
      screen.getByText('A chemistry teacher turned meth kingpin, driven by pride and survival.')
    ).toBeInTheDocument();
  });

  it('renders seasons badge and role badge from Character data', () => {
    render(<CharCard character={characterFixture} index={0} />);

    expect(screen.getByText('S1, S2, S3, S4, S5')).toBeInTheDocument();
    expect(screen.getByText('protagonist')).toBeInTheDocument();
  });

  it('applies top accent gradient using character color and 3px accent height', () => {
    render(<CharCard character={characterFixture} index={0} />);

    const card = screen.getByTestId('char-card-walt');

    expect(card).toHaveStyle('--char-accent: #4FC3F7');
    expect(card).toHaveAttribute('data-accent-height', '3px');
  });

  it('sets deal delay inline as index*0.15s and uses charIn animation class', () => {
    render(<CharCard character={characterFixture} index={3} />);

    const card = screen.getByTestId('char-card-walt');
    expect(card).toHaveStyle('--deal-delay: 0.45s');
    expect(card).toHaveClass('charIn');
  });

  it('marks card selected when selectedChar id matches character id', () => {
    selectedChar = characterFixture;
    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar,
        activeQuote: null,
        toneFilter: 'all',
        selectChar: selectCharSpy,
        clearChar: clearCharSpy,
        openQuote: openQuoteSpy,
        closeQuote: closeQuoteSpy,
        setTone: setToneSpy,
      })
    );

    render(<CharCard character={characterFixture} index={0} />);

    expect(screen.getByTestId('char-card-walt')).toHaveAttribute('data-selected', 'true');
  });

  it('calls selectChar(character) when unselected card is clicked', () => {
    render(<CharCard character={characterFixture} index={0} />);

    fireEvent.click(screen.getByTestId('char-card-walt'));

    expect(selectCharSpy).toHaveBeenCalledWith(characterFixture);
    expect(clearCharSpy).not.toHaveBeenCalled();
  });

  it('calls clearChar() when selected card is clicked', () => {
    selectedChar = characterFixture;
    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar,
        activeQuote: null,
        toneFilter: 'all',
        selectChar: selectCharSpy,
        clearChar: clearCharSpy,
        openQuote: openQuoteSpy,
        closeQuote: closeQuoteSpy,
        setTone: setToneSpy,
      })
    );

    render(<CharCard character={characterFixture} index={0} />);

    fireEvent.click(screen.getByTestId('char-card-walt'));

    expect(clearCharSpy).toHaveBeenCalledTimes(1);
    expect(selectCharSpy).not.toHaveBeenCalled();
  });

  it('computes hover tilt transform from pointer position and element bounds formula', () => {
    render(<CharCard character={characterFixture} index={0} />);

    const card = screen.getByTestId('char-card-walt');
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 200,
      width: 300,
      height: 200,
      top: 200,
      left: 100,
      right: 400,
      bottom: 400,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.mouseMove(card, { clientX: 250, clientY: 250 });

    expect(card.style.transform).toBe(
      'perspective(600px) rotateY(0deg) rotateX(-4deg) scale(1.04) translateY(-6px)'
    );
  });

  it('resets inline transform on mouse leave so base selected/default transform is restored', () => {
    render(<CharCard character={characterFixture} index={0} />);

    const card = screen.getByTestId('char-card-walt');
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 200,
      width: 300,
      height: 200,
      top: 200,
      left: 100,
      right: 400,
      bottom: 400,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.mouseMove(card, { clientX: 250, clientY: 250 });
    expect(card.style.transform).not.toBe('');

    fireEvent.mouseLeave(card);

    expect(card.style.transform).toBe('');
  });

  it('applies selected visual style contract (shadow, border color, selected transform)', () => {
    selectedChar = characterFixture;
    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar,
        activeQuote: null,
        toneFilter: 'all',
        selectChar: selectCharSpy,
        clearChar: clearCharSpy,
        openQuote: openQuoteSpy,
        closeQuote: closeQuoteSpy,
        setTone: setToneSpy,
      })
    );

    render(<CharCard character={characterFixture} index={0} />);

    const card = screen.getByTestId('char-card-walt');
    expect(card).toHaveClass('selected');
    expect(card).toHaveAttribute('data-selected-shadow', '0 0 20px');
  });
});
