import { create } from 'zustand';
import type { Molecule } from '../types/chemistry';

interface ChemStore {
  activeElement: string | null;
  activeMolecule: Molecule | null;
  selectElement: (symbol: string, molecules: Molecule[]) => void;
  clearElement: () => void;
}

const resolveMoleculeBySymbol = (
  symbol: string,
  molecules: Molecule[]
): Molecule | null => {
  const phosphine = molecules.find((molecule) => molecule.name === 'Phosphine') ?? null;
  const bariumChloride =
    molecules.find((molecule) => molecule.name === 'Barium Chloride') ?? null;
  const methamphetamine =
    molecules.find((molecule) => molecule.name === 'Methamphetamine') ?? null;

  if (symbol === 'P') {
    return phosphine;
  }

  if (symbol === 'Ba') {
    return bariumChloride;
  }

  return methamphetamine;
};

export const useChemStore = create<ChemStore>((set) => ({
  activeElement: null,
  activeMolecule: null,
  selectElement: (symbol, molecules) => {
    set({
      activeElement: symbol,
      activeMolecule: resolveMoleculeBySymbol(symbol, molecules),
    });
  },
  clearElement: () => {
    set({
      activeElement: null,
      activeMolecule: null,
    });
  },
}));
