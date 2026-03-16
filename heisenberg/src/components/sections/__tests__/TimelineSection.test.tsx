import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../../App';
import { useTypedData } from '../../../hooks/useTypedData';
import type { Character } from '../../../types/character';
import { TimelineSection } from '../TimelineSection';

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(),
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

const charactersFixture: Character[] = [
  {
    id: 'walt',
    name: 'Walter White',
    alias: 'Heisenberg',
    desc: 'A chemistry teacher turned meth kingpin, driven by pride and survival.',
    color: '#4FC3F7',
    seasons: [1, 2, 3, 4, 5],
    role: 'protagonist',
  },
  {
    id: 'jesse',
    name: 'Jesse Pinkman',
    alias: "Cap'n Cook",
    desc: "Walt's former student and partner, torn between loyalty and conscience.",
    color: '#F5A623',
    seasons: [1, 2, 3, 4, 5],
    role: 'partner',
  },
  {
    id: 'gus',
    name: 'Gustavo Fring',
    alias: 'The Chicken Man',
    desc: 'A meticulous drug distributor with a calm exterior and ruthless strategy.',
    color: '#C0392B',
    seasons: [2, 3, 4],
    role: 'antagonist',
  },
  {
    id: 'hank',
    name: 'Hank Schrader',
    alias: 'ASAC Schrader',
    desc: 'A DEA agent pursuing Heisenberg while blind to the truth at home.',
    color: '#27AE60',
    seasons: [1, 2, 3, 4, 5],
    role: 'law',
  },
  {
    id: 'mike',
    name: 'Mike Ehrmantraut',
    alias: 'The Cleaner',
    desc: 'A disciplined fixer who values precision, caution, and pragmatism.',
    color: '#8E44AD',
    seasons: [2, 3, 4, 5],
    role: 'fixer',
  },
];

describe('TimelineSection', () => {
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    disconnectSpy = vi.fn();

    class IntersectionObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnectSpy;
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders section id section-02 with section class', () => {
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

  it('passes index prop to each CharCard for stagger sequence', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    const cards = screen.getAllByTestId(/char-card-/);
    cards.forEach((card, index) => {
      expect(card).toHaveAttribute('data-index', String(index));
    });
  });

  it('shows shimmer placeholders during loading state', () => {
    mockedUseTypedData.mockReturnValue({ status: 'loading' });

    render(<TimelineSection />);

    expect(screen.getAllByTestId('timeline-shimmer')).toHaveLength(5);
  });

  it('shows error state with retry button and retries loader on click', () => {
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

  it('shows fallback message for empty success results', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: [],
      loadedAt: new Date(),
    });

    render(<TimelineSection />);

    expect(screen.getByText('No characters found.')).toBeInTheDocument();
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

  it('replaces any existing section-02 placeholder output with real TimelineSection content', () => {
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: charactersFixture,
      loadedAt: new Date(),
    });

    const { container } = render(<TimelineSection />);

    expect(container.querySelector('[data-testid="section-02-placeholder"]')).toBeNull();
    expect(container.querySelector('#section-02')).not.toBeNull();
  });
});
