export interface Atom {
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  label: string;
  glow: number;
}

export interface Molecule {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: [number, number][];
}

export interface Element {
  symbol: string;
  name: string;
  num: number;
  color: string;
  note: string;
}
