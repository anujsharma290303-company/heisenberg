import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToneFilterBar } from '../ToneFilterBar.tsx';
import type { ExplorerToneFilter } from '../../../stores/useExplorerStore';

describe('ToneFilterBar', () => {
  let onSelect: (tone: ExplorerToneFilter) => void;

  beforeEach(() => {
    onSelect = vi.fn<(tone: ExplorerToneFilter) => void>();
  });

  it('renders 5 pill buttons: ALL, MENACING, HUMOROUS, REFLECTIVE, VULNERABLE', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menacing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /humorous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reflective/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /vulnerable/i })).toBeInTheDocument();
  });

  it('marks the button matching the active prop with aria-pressed="true"', () => {
    render(<ToneFilterBar active="menacing" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /menacing/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('all other buttons have aria-pressed="false"', () => {
    render(<ToneFilterBar active="menacing" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /humorous/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /reflective/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /vulnerable/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with "all" when ALL button is clicked', () => {
    render(<ToneFilterBar active="menacing" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('calls onSelect with "menacing" when MENACING button is clicked', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /menacing/i }));
    expect(onSelect).toHaveBeenCalledWith('menacing');
  });

  it('calls onSelect with "humorous" when HUMOROUS button is clicked', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /humorous/i }));
    expect(onSelect).toHaveBeenCalledWith('humorous');
  });

  it('calls onSelect with "reflective" when REFLECTIVE button is clicked', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /reflective/i }));
    expect(onSelect).toHaveBeenCalledWith('reflective');
  });

  it('calls onSelect with "vulnerable" when VULNERABLE button is clicked', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /vulnerable/i }));
    expect(onSelect).toHaveBeenCalledWith('vulnerable');
  });

  it('does not call onSelect when clicking already-active button', () => {
    render(<ToneFilterBar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('active pill has data-active attribute set to "true"', () => {
    render(<ToneFilterBar active="humorous" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /humorous/i })).toHaveAttribute('data-active', 'true');
  });

  it('inactive pills have data-active attribute set to "false"', () => {
    render(<ToneFilterBar active="humorous" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('button', { name: /menacing/i })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('button', { name: /reflective/i })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('button', { name: /vulnerable/i })).toHaveAttribute('data-active', 'false');
  });
});
