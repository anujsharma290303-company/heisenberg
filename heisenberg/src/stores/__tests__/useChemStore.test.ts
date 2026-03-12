import { beforeEach, describe, expect, it } from 'vitest';
import { useChemStore } from '../useChemStore.ts';
import type { Molecule } from '../../types/chemistry';

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
  {
    name: 'Barium Chloride',
    formula: 'BaCl2',
    atoms: [],
    bonds: [],
  },
];

describe('useChemStore', () => {
  beforeEach(() => {
    useChemStore.setState({
      activeElement: null,
      activeMolecule: null,
    });
  });

  it('selectElement sets activeElement', () => {
    useChemStore.getState().selectElement('C', moleculesFixture);

    expect(useChemStore.getState().activeElement).toBe('C');
  });

  it('selectElement P maps to Phosphine molecule', () => {
    useChemStore.getState().selectElement('P', moleculesFixture);

    expect(useChemStore.getState().activeMolecule?.name).toBe('Phosphine');
  });

  it('selectElement Ba maps to Barium Chloride', () => {
    useChemStore.getState().selectElement('Ba', moleculesFixture);

    expect(useChemStore.getState().activeMolecule?.name).toBe('Barium Chloride');
  });

  it('clearElement sets both to null', () => {
    useChemStore.getState().selectElement('P', moleculesFixture);
    useChemStore.getState().clearElement();

    expect(useChemStore.getState().activeElement).toBeNull();
    expect(useChemStore.getState().activeMolecule).toBeNull();
  });

  it('default activeElement is null', () => {
    expect(useChemStore.getState().activeElement).toBeNull();
  });
});
