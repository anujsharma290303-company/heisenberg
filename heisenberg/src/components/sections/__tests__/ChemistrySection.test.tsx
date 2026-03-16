import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../../App';
import { useTypedData } from '../../../hooks/useTypedData';
import { useChemStore } from '../../../stores/useChemStore';
import type { Molecule } from '../../../types/chemistry';
import { ChemistrySection } from '../ChemistrySection.tsx';

vi.mock('../../../stores/useChemStore', () => ({
  useChemStore: vi.fn(),
}));

vi.mock('../../canvas/MoleculeCanvas', () => ({
  MoleculeCanvas: ({ molecule }: { molecule: Molecule }) => (
    <div data-testid="molecule-canvas" data-molecule-name={molecule.name} />
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

vi.mock('../QuotesSection', () => ({
  QuotesSection: () => <section id="section-03" data-testid="quotes-section" />,
}));

vi.mock('../../overlays/QuoteReveal', () => ({
  QuoteReveal: () => null,
}));

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(),
}));

const mockedUseChemStore = vi.mocked(useChemStore);
const mockedUseTypedData = vi.mocked(useTypedData);

const moleculesFixture: Molecule[] = [
  {
    name: 'Methamphetamine',
    formula: 'C10H15N',
    atoms: [],
    bonds: [],
  },
  {
    name: 'Phosphine',
    formula: 'PH3',
    atoms: [],
    bonds: [],
  },
];

describe('ChemistrySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTypedData.mockReturnValue({
      status: 'success',
      data: moleculesFixture,
      loadedAt: new Date(),
    });

    class IntersectionObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders section with id section-04 and section class', () => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement: null,
        activeMolecule: null,
        selectElement: vi.fn(),
        clearElement: vi.fn(),
      })
    );

    const { container } = render(<ChemistrySection />);
    const section = container.querySelector('#section-04');

    expect(section).not.toBeNull();
    expect(section).toHaveClass('section');
  });

  it('renders MoleculeCanvas with activeMolecule when store has one', () => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement: 'P',
        activeMolecule: {
          name: 'Phosphine',
          formula: 'PH3',
          atoms: [],
          bonds: [],
        },
        selectElement: vi.fn(),
        clearElement: vi.fn(),
      })
    );

    render(<ChemistrySection />);

    expect(screen.getByTestId('molecule-canvas')).toHaveAttribute('data-molecule-name', 'Phosphine');
  });

  it('renders MoleculeCanvas with Methamphetamine when activeMolecule is null', () => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement: null,
        activeMolecule: null,
        selectElement: vi.fn(),
        clearElement: vi.fn(),
      })
    );

    render(<ChemistrySection />);

    expect(screen.getByTestId('molecule-canvas')).toHaveAttribute('data-molecule-name', 'Methamphetamine');
  });

  it('loads molecules data through useTypedData and resolves fallback molecule', () => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement: null,
        activeMolecule: null,
        selectElement: vi.fn(),
        clearElement: vi.fn(),
      })
    );

    render(<ChemistrySection />);

    expect(mockedUseTypedData).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('molecule-canvas')).toHaveAttribute('data-molecule-name', 'Methamphetamine');
  });

  it('mounts as fourth section in App after QuotesSection', () => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement: null,
        activeMolecule: null,
        selectElement: vi.fn(),
        clearElement: vi.fn(),
      })
    );

    render(<App />);

    const scrollContainer = document.querySelector('.scroll-container');
    expect(scrollContainer).not.toBeNull();
    if (!scrollContainer) {
      return;
    }

    const fourthSection = scrollContainer.children[3];
    expect(fourthSection).toHaveAttribute('id', 'section-04');
  });
});
