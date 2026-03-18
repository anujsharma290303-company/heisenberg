import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../../App';
import { useTypedData } from '../../../hooks/useTypedData';
import { useExplorerStore } from '../../../stores/useExplorerStore';
import { useUIStore } from '../../../stores/useUIStore';
import type { Character } from '../../../types/character';
import { TimelineSection } from '../TimelineSection';

let selectedCharState: Character | null = null;
let clearCharSpy = vi.fn<() => void>();
let setSectionSpy = vi.fn<(index: number) => void>();

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(),
}));

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn((selector) =>
    selector({
      activeSection: 0,
      grainIntensity: 0.028,
      setSection: setSectionSpy,
      setGrainIntensity: vi.fn(),
    })
  ),
}));

vi.mock('../../../stores/useExplorerStore', () => ({
  useExplorerStore: vi.fn((selector) =>
    selector({
      selectedChar: selectedCharState,
      activeQuote: null,
      toneFilter: 'all',
      selectChar: vi.fn(),
      clearChar: clearCharSpy,
      openQuote: vi.fn(),
      closeQuote: vi.fn(),
      setTone: vi.fn(),
    })
  ),
}));

vi.mock('../../cards/CharCard', () => ({
  CharCard: ({ character, index }: { character: Character; index: number }) => (
    <article
      data-testid={`char-card-${character.id}`}
      data-index={String(index)}
      data-character-id={character.id}
    >
      {character.name}
    </article>
  ),
}));

vi.mock('../../ui/GlitchText', () => ({
  GlitchText: ({
    children,
    always,
    className,
    style,
  }: {
    children: string;
    always?: boolean;
    className?: string;
    style?: Record<string, string | number>;
  }) => (
    <span data-testid="selected-char-name" data-always={always ? 'true' : 'false'} className={className} style={style}>
      {children}
    </span>
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

vi.mock('../QuotesSection', () => ({
  QuotesSection: () => <section id="section-03" data-testid="quotes-section" />,
}));

vi.mock('../ChemistrySection', () => ({
  ChemistrySection: () => <section id="section-04" data-testid="chemistry-section" />,
}));

vi.mock('../../overlays/QuoteReveal', () => ({
  QuoteReveal: () => null,
}));

const mockedUseTypedData = vi.mocked(useTypedData);
const mockedUseUIStore = vi.mocked(useUIStore);
const mockedUseExplorerStore = vi.mocked(useExplorerStore);

const charactersFixture: Character[] = [
  {
    id: 'walt',
    name: 'Walter White',
    alias: 'Heisenberg',
    bestQuote: 'I am the one who knocks.',
    desc: 'A chemistry teacher turned meth kingpin, driven by pride and survival.',
    color: '#4FC3F7',
    seasons: [1, 2, 3, 4, 5],
    role: 'protagonist',
  },
  {
    id: 'jesse',
    name: 'Jesse Pinkman',
    alias: "Cap'n Cook",
    bestQuote: 'Yeah, science!',
    desc: "Walt's former student and partner, torn between loyalty and conscience.",
    color: '#F5A623',
    seasons: [1, 2, 3, 4, 5],
    role: 'partner',
  },
  {
    id: 'gus',
    name: 'Gustavo Fring',
    alias: 'The Chicken Man',
    bestQuote: 'I hide in plain sight, same as you.',
    desc: 'A meticulous drug distributor with a calm exterior and ruthless strategy.',
    color: '#C0392B',
    seasons: [2, 3, 4],
    role: 'antagonist',
  },
  {
    id: 'hank',
    name: 'Hank Schrader',
    alias: 'ASAC Schrader',
    bestQuote: 'You know what, I think this is going to be a great trip.',
    desc: 'A DEA agent pursuing Heisenberg while blind to the truth at home.',
    color: '#27AE60',
    seasons: [1, 2, 3, 4, 5],
    role: 'law',
  },
  {
    id: 'mike',
    name: 'Mike Ehrmantraut',
    alias: 'The Cleaner',
    bestQuote: 'Shut the hell up and let me die.',
    desc: 'A disciplined fixer who values precision, caution, and pragmatism.',
    color: '#8E44AD',
    seasons: [2, 3, 4, 5],
    role: 'fixer',
  },
];

describe('TimelineSection', () => {
  let ioCallback: ((entries: IntersectionObserverEntry[]) => void) | null;
  let ioOptions: IntersectionObserverInit | undefined;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    selectedCharState = null;
    clearCharSpy = vi.fn<() => void>();
    setSectionSpy = vi.fn<(index: number) => void>();
    ioCallback = null;
    ioOptions = undefined;
    disconnectSpy = vi.fn();

    mockedUseUIStore.mockImplementation((selector) =>
      selector({
        activeSection: 0,
        grainIntensity: 0.028,
        setSection: setSectionSpy,
        setGrainIntensity: vi.fn(),
      })
    );

    mockedUseExplorerStore.mockImplementation((selector) =>
      selector({
        selectedChar: selectedCharState,
        activeQuote: null,
        toneFilter: 'all',
        selectChar: vi.fn(),
        clearChar: clearCharSpy,
        openQuote: vi.fn(),
        closeQuote: vi.fn(),
        setTone: vi.fn(),
      })
    );

    class IntersectionObserverMock {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void, options?: IntersectionObserverInit) {
        ioCallback = callback;
        ioOptions = options;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnectSpy;
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders id section-02 and includes section class', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    const { container } = render(<TimelineSection />);
    const section = container.querySelector('#section-02');

    expect(section).not.toBeNull();
    expect(section).toHaveClass('section');
  });

  it('renders section label text "02 / CHARACTER TIMELINE"', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    expect(screen.getByText('02 / CHARACTER TIMELINE')).toBeInTheDocument();
  });

  it('creates IntersectionObserver with threshold 0.45', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    expect(ioOptions).toEqual({ threshold: 0.45 });
  });

  it('adds revealed class when section becomes visible and calls setSection(1)', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    const { container } = render(<TimelineSection />);
    const section = container.querySelector('#section-02');

    if (!section || !ioCallback) {
      throw new Error('IntersectionObserver callback not captured');
    }

    act(() => {
      ioCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(section.className).toContain('revealed');
    expect(setSectionSpy).toHaveBeenCalledWith(1);
  });

  it('loads characters through useTypedData and renders 5 CharCards on success', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(mockedUseTypedData).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId(/char-card-/)).toHaveLength(5);
  });

  it('renders 5 shimmer placeholders in loading state', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    expect(screen.getAllByTestId('timeline-shimmer')).toHaveLength(5);
  });

  it('renders error and retry controls and calls retry when clicked', () => {
    const retrySpy = vi.fn();
    mockedUseTypedData.mockReturnValue({
      status: 'error',
      error: new Error('failed to load'),
      retry: retrySpy,
    });

    render(<TimelineSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('renders empty-state text when success has no characters', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: [],
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByText('No characters found.')).toBeInTheDocument();
  });

  it('renders exactly 5 season markers at 10%,30%,50%,70%,90% with labels S01-S05', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    const markers = screen.getAllByTestId('season-marker');
    expect(markers).toHaveLength(5);
    expect(markers.map((item) => item.getAttribute('data-position'))).toEqual(['10', '30', '50', '70', '90']);
    expect(screen.getByText('S01')).toBeInTheDocument();
    expect(screen.getByText('S02')).toBeInTheDocument();
    expect(screen.getByText('S03')).toBeInTheDocument();
    expect(screen.getByText('S04')).toBeInTheDocument();
    expect(screen.getByText('S05')).toBeInTheDocument();
  });

  it('renders progress fill configured for expandBar and scroll timeline', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    const fill = screen.getByTestId('timeline-fill');
    expect(fill).toHaveAttribute('data-animation', 'expandBar');
    expect(fill).toHaveAttribute('data-timeline', 'scroll');
  });

  it('does not attach JavaScript scroll listeners for timeline progress', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('renders CharCards in a horizontal scroll row when success has data', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByTestId('timeline-cards-row')).toBeInTheDocument();
    expect(screen.getAllByTestId(/char-card-/)).toHaveLength(5);
  });

  it('shows selection panel with GlitchText always=true when selectedChar exists', () => {
    selectedCharState = charactersFixture[0];
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByTestId('selected-char-name')).toHaveAttribute('data-always', 'true');
  });

  it('renders selected character name in character color and clears selection on CLEAR click', () => {
    selectedCharState = charactersFixture[0];
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByTestId('selected-char-name')).toHaveTextContent('Walter White');
    expect(screen.getByTestId('selected-char-name')).toHaveStyle({ color: '#4FC3F7' });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Selection' }));
    expect(clearCharSpy).toHaveBeenCalledTimes(1);
  });

  it('shows dim instructional text when selectedChar is null', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByText('Select a character card to focus the quote wall.')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-char-name')).toBeNull();
  });

  it('mounts TimelineSection after HeroSection in App scroll container order', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<App />);

    const scrollContainer = document.querySelector('.scroll-container');
    expect(scrollContainer).not.toBeNull();
    if (!scrollContainer) {
      return;
    }

    const firstSection = scrollContainer.children[0];
    const secondSection = scrollContainer.children[1];

    expect(firstSection).toHaveAttribute('id', 'section-01');
    expect(secondSection).toHaveAttribute('id', 'section-02');
  });
});