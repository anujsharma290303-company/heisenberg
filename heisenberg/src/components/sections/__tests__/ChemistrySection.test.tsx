import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTypedData } from '../../../hooks/useTypedData';
import { useChemStore } from '../../../stores/useChemStore';
import { useUIStore } from '../../../stores/useUIStore';
import type { Element, Molecule } from '../../../types/chemistry';
import { ChemistrySection } from '../ChemistrySection.tsx';

vi.mock('../../../hooks/useTypedData', () => ({
  useTypedData: vi.fn(),
}));

vi.mock('../../../stores/useChemStore', () => ({
  useChemStore: vi.fn(),
}));

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../canvas/MoleculeCanvas', () => ({
  MoleculeCanvas: ({ molecule }: { molecule: Molecule }) => (
    <div
      data-testid="molecule-canvas"
      data-molecule-name={molecule.name}
      data-molecule-formula={molecule.formula}
    />
  ),
}));

const mockedUseTypedData = vi.mocked(useTypedData);
const mockedUseChemStore = vi.mocked(useChemStore);
const mockedUseUIStore = vi.mocked(useUIStore);

const elementsFixture: Element[] = [
  { symbol: 'C', name: 'Carbon', num: 6, color: '#4FC3F7', note: 'Carbon note' },
  { symbol: 'H', name: 'Hydrogen', num: 1, color: '#E8E2D5', note: 'Hydrogen note' },
  { symbol: 'N', name: 'Nitrogen', num: 7, color: '#27AE60', note: 'Nitrogen note' },
  { symbol: 'P', name: 'Phosphorus', num: 15, color: '#D4A017', note: 'Phosphorus note' },
  { symbol: 'Ba', name: 'Barium', num: 56, color: '#C0392B', note: 'Barium note' },
  { symbol: 'Cl', name: 'Chlorine', num: 17, color: '#777777', note: 'Chlorine note' },
  { symbol: 'Br', name: 'Bromine', num: 35, color: '#444444', note: 'Bromine note' },
  { symbol: 'Hg', name: 'Mercury', num: 80, color: '#9B59B6', note: 'Mercury note' },
];

const moleculesFixture: Molecule[] = [
  { name: 'Methamphetamine', formula: 'C10H15N', atoms: [], bonds: [] },
  { name: 'Phosphine', formula: 'PH3', atoms: [], bonds: [] },
  { name: 'Barium Chloride', formula: 'BaCl2', atoms: [], bonds: [] },
];

describe('ChemistrySection', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observerOptions: IntersectionObserverInit | undefined;
  let observedElement: Element | null = null;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let selectElementSpy: (symbol: string, molecules: Molecule[]) => void;
  let clearElementSpy: () => void;
  let setSectionSpy: (index: number) => void;

  const configureSuccessLoaders = () => {
    let callIndex = 0;
    mockedUseTypedData.mockImplementation(() => {
      const current = callIndex;
      callIndex += 1;

      if (current % 2 === 0) {
        return {
          status: 'success',
          data: elementsFixture,
          loadedAt: new Date(),
        };
      }

      return {
        status: 'success',
        data: moleculesFixture,
        loadedAt: new Date(),
      };
    });
  };

  const setChemState = (activeElement: string | null, activeMolecule: Molecule | null) => {
    mockedUseChemStore.mockImplementation((selector) =>
      selector({
        activeElement,
        activeMolecule,
        selectElement: selectElementSpy,
        clearElement: clearElementSpy,
      })
    );
  };

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
          } as unknown as IntersectionObserverEntry,
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
    selectElementSpy = vi.fn<(symbol: string, molecules: Molecule[]) => void>();
    clearElementSpy = vi.fn<() => void>();
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

    configureSuccessLoaders();
    setChemState(null, moleculesFixture[0]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders section root with id section-04 and class section', () => {
    const { container } = render(<ChemistrySection />);
    const section = container.querySelector('#section-04');

    expect(section).not.toBeNull();
    expect(section).toHaveClass('section');
  });

  it('uses section background color contract for chemistry section', () => {
    const { container } = render(<ChemistrySection />);
    const section = container.querySelector('#section-04');

    expect(section?.className).toContain('sectionRoot');
  });

  it('creates IntersectionObserver with threshold 0.45', () => {
    render(<ChemistrySection />);

    expect(observerOptions).toEqual({ threshold: 0.45 });
  });

  it('adds revealed class when section enters view', () => {
    const { container } = render(<ChemistrySection />);
    const section = container.querySelector('#section-04');

    expect(section).not.toHaveClass('revealed');
    triggerVisibility(true);
    expect(section).toHaveClass('revealed');
  });

  it('calls useUIStore.setSection with 3 when section enters view', () => {
    render(<ChemistrySection />);

    triggerVisibility(true);

    expect(setSectionSpy).toHaveBeenCalledWith(3);
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = render(<ChemistrySection />);

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('loads elements and molecules via useTypedData', () => {
    render(<ChemistrySection />);

    expect(mockedUseTypedData).toHaveBeenCalledTimes(2);
  });

  it('renders section label 04 / THE SCIENCE', () => {
    render(<ChemistrySection />);

    expect(screen.getByText('04 / THE SCIENCE')).toBeInTheDocument();
  });

  it('renders 8 element tiles with atomic number, symbol, and name', () => {
    render(<ChemistrySection />);

    expect(screen.getAllByRole('button', { name: /select element/i })).toHaveLength(8);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Carbon')).toBeInTheDocument();
  });

  it('applies active tile class when tile symbol equals activeElement', () => {
    configureSuccessLoaders();
    setChemState('P', moleculesFixture[1]);

    render(<ChemistrySection />);

    expect(screen.getByTestId('element-tile-P')).toHaveClass('active-tile');
  });

  it('dims non-active tiles when an activeElement exists', () => {
    configureSuccessLoaders();
    setChemState('P', moleculesFixture[1]);

    render(<ChemistrySection />);

    expect(screen.getByTestId('element-tile-C')).toHaveClass('dimmed-tile');
  });

  it('keeps all tiles undimmed when activeElement is null', () => {
    render(<ChemistrySection />);

    const tiles = screen.getAllByRole('button', { name: /select element/i });
    for (const tile of tiles) {
      expect(tile).not.toHaveClass('dimmed-tile');
    }
  });

  it('applies staggered animation delay index * 0.05s to tiles', () => {
    render(<ChemistrySection />);

    expect(screen.getByTestId('element-tile-C')).toHaveStyle({ animationDelay: '0s' });
    expect(screen.getByTestId('element-tile-H')).toHaveStyle({ animationDelay: '0.05s' });
    expect(screen.getByTestId('element-tile-Hg').getAttribute('style')).toContain('animation-delay: 0.35');
  });

  it('calls selectElement with symbol and molecules when clicking a different tile', () => {
    render(<ChemistrySection />);

    fireEvent.click(screen.getByRole('button', { name: /select element p/i }));

    expect(selectElementSpy).toHaveBeenCalledWith('P', moleculesFixture);
    expect(clearElementSpy).not.toHaveBeenCalled();
  });

  it('calls clearElement when clicking the currently active tile', () => {
    configureSuccessLoaders();
    setChemState('P', moleculesFixture[1]);

    render(<ChemistrySection />);

    fireEvent.click(screen.getByRole('button', { name: /select element p/i }));

    expect(clearElementSpy).toHaveBeenCalledTimes(1);
  });

  it('shows connection panel only when activeElement is not null', () => {
    render(<ChemistrySection />);
    expect(screen.queryByTestId('connection-panel')).not.toBeInTheDocument();

    configureSuccessLoaders();
    setChemState('P', moleculesFixture[1]);
    render(<ChemistrySection />);
    expect(screen.getByTestId('connection-panel')).toBeInTheDocument();
  });

  it('renders active element note in connection panel', () => {
    configureSuccessLoaders();
    setChemState('P', moleculesFixture[1]);

    render(<ChemistrySection />);

    expect(screen.getByText('Phosphorus note')).toBeInTheDocument();
  });

  it('renders MoleculeCanvas and molecule metadata', () => {
    setChemState('P', moleculesFixture[1]);
    configureSuccessLoaders();

    render(<ChemistrySection />);

    expect(screen.getByTestId('molecule-canvas')).toHaveAttribute('data-molecule-name', 'Phosphine');
    expect(screen.getByText('DRAG TO ROTATE')).toBeInTheDocument();
    expect(screen.getByText('PH3')).toBeInTheDocument();
    expect(screen.getByText('Phosphine')).toBeInTheDocument();
  });

  it('shows loading placeholder while typed data is loading', () => {
    mockedUseTypedData.mockImplementation(() => ({ status: 'loading' }));

    render(<ChemistrySection />);

    expect(screen.getByTestId('chemistry-loading')).toBeInTheDocument();
  });

  it('shows error state when elements or molecules loading fails', () => {
    let callIndex = 0;
    mockedUseTypedData.mockImplementation(() => {
      const current = callIndex;
      callIndex += 1;

      if (current % 2 === 0) {
        return {
          status: 'error',
          error: new Error('Elements failed'),
          retry: vi.fn(),
        };
      }

      return {
        status: 'success',
        data: moleculesFixture,
        loadedAt: new Date(),
      };
    });

    render(<ChemistrySection />);

    expect(screen.getByText('Elements failed')).toBeInTheDocument();
  });
});
