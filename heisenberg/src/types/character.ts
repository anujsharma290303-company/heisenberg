import type { QuoteSeason } from './quote';

export interface Character {
  id: string;
  name: string;
  alias: string;
  bestQuote: string;
  desc: string;
  color: string;
  seasons: QuoteSeason[];
  role: string;
}
