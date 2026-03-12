import type { QuoteSeason } from './quote';

export interface Character {
  id: string;
  name: string;
  alias: string;
  desc: string;
  color: string;
  seasons: QuoteSeason[];
  role: string;
}
