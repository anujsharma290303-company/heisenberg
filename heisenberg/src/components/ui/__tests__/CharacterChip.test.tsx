import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CharacterChip } from '../CharacterChip.tsx';
import type { Character } from '../../../types/character';

const mockCharacter: Character = {
  id: 'walt',
  name: 'Walter White',
  alias: 'Heisenberg',
  bestQuote: 'I am the one who knocks.',
  desc: 'A chemistry teacher turned meth kingpin.',
  color: '#4FC3F7',
  seasons: [1, 2, 3, 4, 5],
  role: 'protagonist',
};

describe('CharacterChip', () => {
  let onClear: () => void;

  beforeEach(() => {
    onClear = vi.fn<() => void>();
  });

  it('renders the character name', () => {
    render(<CharacterChip character={mockCharacter} onClear={onClear} />);
    expect(screen.getByText('Walter White')).toBeInTheDocument();
  });

  it('renders a clear button with aria-label containing the character name', () => {
    render(<CharacterChip character={mockCharacter} onClear={onClear} />);
    expect(screen.getByRole('button', { name: /Walter White/i })).toBeInTheDocument();
  });

  it('calls onClear when the clear button is clicked', () => {
    render(<CharacterChip character={mockCharacter} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /Walter White/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('applies inline color style matching character.color to the name', () => {
    render(<CharacterChip character={mockCharacter} onClear={onClear} />);
    expect(screen.getByText('Walter White')).toHaveStyle({ color: '#4FC3F7' });
  });

  it('applies inline background-color at 18% opacity derived from character.color', () => {
    render(<CharacterChip character={mockCharacter} onClear={onClear} />);
    // #4FC3F7 → rgba(79, 195, 247, 0.18)
    expect(screen.getByTestId('character-chip')).toHaveStyle({
      backgroundColor: 'rgba(79, 195, 247, 0.18)',
    });
  });
});
