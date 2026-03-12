import { create } from 'zustand';
import type { Character } from '../types/character';
import type { Quote, QuoteTone } from '../types/quote';

export type ExplorerToneFilter = 'all' | QuoteTone;

interface ExplorerStore {
  selectedChar: Character | null;
  activeQuote: Quote | null;
  toneFilter: ExplorerToneFilter;
  selectChar: (char: Character) => void;
  clearChar: () => void;
  openQuote: (quote: Quote) => void;
  closeQuote: () => void;
  setTone: (tone: ExplorerToneFilter) => void;
}

export const useExplorerStore = create<ExplorerStore>((set) => ({
  selectedChar: null,
  activeQuote: null,
  toneFilter: 'all',
  selectChar: (char) => {
    set({ selectedChar: char });
  },
  clearChar: () => {
    set({ selectedChar: null });
  },
  openQuote: (quote) => {
    set({ activeQuote: quote });
  },
  closeQuote: () => {
    set({ activeQuote: null });
  },
  setTone: (tone) => {
    set({ toneFilter: tone });
  },
}));
