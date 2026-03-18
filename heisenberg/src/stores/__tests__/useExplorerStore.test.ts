import { beforeEach, describe, expect, it } from 'vitest';
import { useExplorerStore } from '../useExplorerStore.ts';
import type { Character } from '../../types/character';
import type { Quote } from '../../types/quote';

const characterFixture: Character = {
  id: 'walt',
  name: 'Walter White',
  alias: 'Heisenberg',
  bestQuote: 'I am the one who knocks.',
  desc: 'Chemistry teacher turned kingpin.',
  color: '#4FC3F7',
  seasons: [1, 2, 3, 4, 5],
  role: 'protagonist',
};

const quoteFixture: Quote = {
  id: 'q-001',
  text: 'I am the danger.',
  speaker: 'Walter White',
  characterId: 'walt',
  season: 4,
  episode: 'S04E06',
  tone: 'menacing',
  contextNote: 'Walt asserts his threat.',
};

describe('useExplorerStore', () => {
  beforeEach(() => {
    useExplorerStore.setState({
      selectedChar: null,
      activeQuote: null,
      toneFilter: 'all',
    });
  });

  it('selectChar sets selectedChar', () => {
    useExplorerStore.getState().selectChar(characterFixture);

    expect(useExplorerStore.getState().selectedChar).toEqual(characterFixture);
  });

  it('clearChar sets null', () => {
    useExplorerStore.getState().selectChar(characterFixture);
    useExplorerStore.getState().clearChar();

    expect(useExplorerStore.getState().selectedChar).toBeNull();
  });

  it("toneFilter defaults to 'all'", () => {
    expect(useExplorerStore.getState().toneFilter).toBe('all');
  });

  it('openQuote sets activeQuote', () => {
    useExplorerStore.getState().openQuote(quoteFixture);

    expect(useExplorerStore.getState().activeQuote).toEqual(quoteFixture);
  });

  it('closeQuote sets null', () => {
    useExplorerStore.getState().openQuote(quoteFixture);
    useExplorerStore.getState().closeQuote();

    expect(useExplorerStore.getState().activeQuote).toBeNull();
  });
});
