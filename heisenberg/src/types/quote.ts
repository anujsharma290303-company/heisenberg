export type QuoteSeason = 1 | 2 | 3 | 4 | 5;

export type QuoteTone = 'menacing' | 'humorous' | 'reflective' | 'vulnerable';

export interface Quote {
  id: string;
  text: string;
  speaker: string;
  characterId: string;
  season: QuoteSeason;
  episode: string;
  tone: QuoteTone;
  contextNote: string;
}
