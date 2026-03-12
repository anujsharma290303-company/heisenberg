import { create } from 'zustand';

interface UIStore {
  activeSection: number;
  grainIntensity: number;
  setSection: (index: number) => void;
  setGrainIntensity: (value: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeSection: 0,
  grainIntensity: 0.028,
  setSection: (index) => {
    set({ activeSection: index });
  },
  setGrainIntensity: (value) => {
    set({ grainIntensity: value });
  },
}));
