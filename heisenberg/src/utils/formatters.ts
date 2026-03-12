export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const formatSeason = (season: number, episode: number): string => {
  const s = String(season).padStart(2, '0');
  const e = String(episode).padStart(2, '0');
  return `S${s}E${e}`;
};

export const truncate = (text: string, max: number): string => {
  if (text.length <= max) {
    return text;
  }

  const cutoff = Math.max(0, max - 3);
  const slice = text.slice(0, cutoff);

  let safe: string;
  if (/\s$/.test(slice)) {
    safe = slice.trimEnd();
  } else {
    const lastSpace = slice.lastIndexOf(' ');
    safe = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  }

  return `${safe}...`;
};

export const groupBy = <T>(
  arr: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {};

  for (const item of arr) {
    const groupKey =
      typeof key === 'function' ? key(item) : String(item[key] ?? 'undefined');

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }

    grouped[groupKey].push(item);
  }

  return grouped;
};
