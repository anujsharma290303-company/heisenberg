export interface FormulaToken {
  symbol: string;
  count: number;
}

export const parseChemFormula = (formula: string): FormulaToken[] => {
  const tokens: FormulaToken[] = [];
  const regex = /([A-Z][a-z]?)(\d*)/g;

  for (const match of formula.matchAll(regex)) {
    const symbol = match[1];
    const rawCount = match[2];

    if (!symbol) {
      continue;
    }

    tokens.push({
      symbol,
      count: rawCount ? Number(rawCount) : 1,
    });
  }

  return tokens;
};

const CPK_COLORS: Record<string, string> = {
  H: '#FFFFFF',
  C: '#404040',
  N: '#3050F8',
  O: '#FF0D0D',
  P: '#FF8000',
  S: '#FFFF30',
  Cl: '#1FF01F',
  Br: '#A62929',
  Hg: '#B8B8D0',
  Ba: '#00C900',
};

export const cpkColor = (symbol: string): string => {
  return CPK_COLORS[symbol] ?? '#AAAAAA';
};
