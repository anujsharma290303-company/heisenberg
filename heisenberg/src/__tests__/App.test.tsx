import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from '../App';
import { useURLSync } from '../hooks/useURLSync';

vi.mock('../hooks/useURLSync', () => ({
  useURLSync: vi.fn(),
}));

vi.mock('../components/canvas/FilmGrain', () => ({
  FilmGrain: () => <div data-testid="film-grain" />,
}));

vi.mock('../components/canvas/Scanlines', () => ({
  Scanlines: () => <div data-testid="scanlines" />,
}));

vi.mock('../components/ui/DotNav', () => ({
  DotNav: () => <div data-testid="dotnav" />,
}));

vi.mock('../components/sections/HeroSection', () => ({
  HeroSection: () => <section data-testid="section-hero" />,
}));

vi.mock('../components/sections/TimelineSection', () => ({
  TimelineSection: () => <section data-testid="section-timeline" />,
}));

vi.mock('../components/sections/QuotesSection', () => ({
  QuotesSection: () => <section data-testid="section-quotes" />,
}));

vi.mock('../components/sections/ChemistrySection', () => ({
  ChemistrySection: () => <section data-testid="section-chem" />,
}));

vi.mock('../components/overlays/QuoteReveal', () => ({
  QuoteReveal: () => <div data-testid="quote-reveal" />,
}));

vi.mock('../stores/useExplorerStore', () => ({
  useExplorerStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      selectedChar: null,
      activeQuote: null,
      toneFilter: 'all',
      selectChar: vi.fn(),
      clearChar: vi.fn(),
      openQuote: vi.fn(),
      closeQuote: vi.fn(),
      setTone: vi.fn(),
    })
  ),
}));

vi.mock('../stores/useUIStore', () => ({
  useUIStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      activeSection: 0,
      grainIntensity: 0.028,
      setSection: vi.fn(),
      setGrainIntensity: vi.fn(),
    })
  ),
}));

vi.mock('../hooks/useTypedData', () => ({
  useTypedData: vi.fn(() => ({
    status: 'success',
    data: [],
    loadedAt: new Date(),
  })),
}));

describe('App URL sync integration', () => {
  it('calls useURLSync once from App root render', () => {
    render(<App />);

    expect(useURLSync).toHaveBeenCalledTimes(1);
  });
});
