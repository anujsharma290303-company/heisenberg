import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DotNav } from '../DotNav.tsx';
import { useUIStore } from '../../../stores/useUIStore';

vi.mock('../../../stores/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

const mockedUseUIStore = vi.mocked(useUIStore);

const setActiveSection = (activeSection: number) => {
  mockedUseUIStore.mockImplementation((selector) =>
    selector({
      activeSection,
      grainIntensity: 0.028,
      setSection: vi.fn(),
      setGrainIntensity: vi.fn(),
    })
  );
};

describe('DotNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActiveSection(0);
  });

  it('renders exactly 4 dots', () => {
    render(<DotNav />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('reads activeSection from useUIStore and marks that dot as active', () => {
    setActiveSection(2);
    render(<DotNav />);

    const activeDot = screen.getByRole('button', { name: 'Go to section 3' });
    expect(activeDot).toHaveClass('active');
  });

  it('renders inactive dots for all non-active indices', () => {
    setActiveSection(1);
    render(<DotNav />);

    expect(screen.getByRole('button', { name: 'Go to section 1' })).toHaveClass('inactive');
    expect(screen.getByRole('button', { name: 'Go to section 3' })).toHaveClass('inactive');
    expect(screen.getByRole('button', { name: 'Go to section 4' })).toHaveClass('inactive');
  });

  it('applies active class styling hook for size and glow', () => {
    setActiveSection(0);
    render(<DotNav />);

    expect(screen.getByRole('button', { name: 'Go to section 1' })).toHaveClass('active');
  });

  it('applies inactive class styling hook for smaller dot size', () => {
    setActiveSection(3);
    render(<DotNav />);

    expect(screen.getByRole('button', { name: 'Go to section 1' })).toHaveClass('inactive');
  });

  it('calls document.getElementById with section-01 when first dot is clicked', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    const getElementByIdSpy = vi
      .spyOn(document, 'getElementById')
      .mockReturnValue({ scrollIntoView } as unknown as HTMLElement);

    render(<DotNav />);
    await user.click(screen.getByRole('button', { name: 'Go to section 1' }));

    expect(getElementByIdSpy).toHaveBeenCalledWith('section-01');
  });

  it('calls document.getElementById with section-04 when fourth dot is clicked', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    const getElementByIdSpy = vi
      .spyOn(document, 'getElementById')
      .mockReturnValue({ scrollIntoView } as unknown as HTMLElement);

    render(<DotNav />);
    await user.click(screen.getByRole('button', { name: 'Go to section 4' }));

    expect(getElementByIdSpy).toHaveBeenCalledWith('section-04');
  });

  it('calls scrollIntoView with behavior smooth when target section exists', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    render(<DotNav />);
    await user.click(screen.getByRole('button', { name: 'Go to section 2' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not throw when clicked section id is missing in DOM', async () => {
    const user = userEvent.setup();
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);

    render(<DotNav />);

    await expect(
      user.click(screen.getByRole('button', { name: 'Go to section 3' }))
    ).resolves.toBeUndefined();
    expect(getElementByIdSpy).toHaveBeenCalledWith('section-03');
  });

  it('renders with fixed overlay root class for persistent placement', () => {
    const { container } = render(<DotNav />);

    const navRoot = container.firstElementChild;
    expect(navRoot).toHaveClass('root');
  });
});