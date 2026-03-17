import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useChemStore } from '../../stores/useChemStore';
import { useExplorerStore } from '../../stores/useExplorerStore';
import type { Quote } from '../../types/quote';
import { useURLSync } from '../useURLSync.ts';

type ChemMockState = {
  activeElement: string | null;
};

type ExplorerMockState = {
  activeQuote: Quote | null;
};

const selectElementSpy = vi.fn<(symbol: string, molecules: unknown[]) => void>();
const clearElementSpy = vi.fn();
const openQuoteSpy = vi.fn<(quote: Quote) => void>();
const closeQuoteSpy = vi.fn();

const chemState: ChemMockState = {
  activeElement: null,
};

const explorerState: ExplorerMockState = {
  activeQuote: null,
};

vi.mock('../../stores/useChemStore', () => {
  const useChemStoreMock = vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      activeElement: chemState.activeElement,
      activeMolecule: null,
      selectElement: selectElementSpy,
      clearElement: clearElementSpy,
    })
  );

  (useChemStoreMock as unknown as { getState: () => unknown }).getState = () => ({
    activeElement: chemState.activeElement,
    activeMolecule: null,
    selectElement: selectElementSpy,
    clearElement: clearElementSpy,
  });

  return { useChemStore: useChemStoreMock };
});

vi.mock('../../stores/useExplorerStore', () => {
  const useExplorerStoreMock = vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      selectedChar: null,
      activeQuote: explorerState.activeQuote,
      toneFilter: 'all',
      selectChar: vi.fn(),
      clearChar: vi.fn(),
      openQuote: openQuoteSpy,
      closeQuote: closeQuoteSpy,
      setTone: vi.fn(),
    })
  );

  (useExplorerStoreMock as unknown as { getState: () => unknown }).getState = () => ({
    selectedChar: null,
    activeQuote: explorerState.activeQuote,
    toneFilter: 'all',
    selectChar: vi.fn(),
    clearChar: vi.fn(),
    openQuote: openQuoteSpy,
    closeQuote: closeQuoteSpy,
    setTone: vi.fn(),
  });

  return { useExplorerStore: useExplorerStoreMock };
});

describe('useURLSync', () => {
  const pathname = '/';

  const setSearch = (search: string) => {
    window.history.replaceState(null, '', `${pathname}${search}`);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    chemState.activeElement = null;
    explorerState.activeQuote = null;
    setSearch('');
  });

  it('hydrates element from ?element=P on initial load and calls selectElement with molecules', async () => {
    setSearch('?element=P');

    renderHook(() => useURLSync());

    await waitFor(() => {
      expect(selectElementSpy).toHaveBeenCalledTimes(1);
    });
    expect(selectElementSpy).toHaveBeenCalledWith('P', expect.any(Array));
  });

  it('hydrates quote from ?quote=q-001 on initial load and calls openQuote with matching quote object', async () => {
    setSearch('?quote=q-001');

    renderHook(() => useURLSync());

    await waitFor(() => {
      expect(openQuoteSpy).toHaveBeenCalledTimes(1);
    });
    expect(openQuoteSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'q-001' }));
  });

  it('hydrates both params together when both are present', async () => {
    setSearch('?element=P&quote=q-001');

    renderHook(() => useURLSync());

    await waitFor(() => {
      expect(selectElementSpy).toHaveBeenCalledWith('P', expect.any(Array));
    });
    expect(selectElementSpy).toHaveBeenCalledWith('P', expect.any(Array));
    expect(openQuoteSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'q-001' }));
  });

  it('ignores unknown quote id during hydration without calling openQuote', async () => {
    setSearch('?quote=q-999');

    renderHook(() => useURLSync());

    await waitFor(() => {
      expect(selectElementSpy).toHaveBeenCalledTimes(0);
    });
    expect(openQuoteSpy).not.toHaveBeenCalled();
  });

  it('ignores invalid element during hydration without calling selectElement', async () => {
    setSearch('?element=XX');

    renderHook(() => useURLSync());

    await waitFor(() => {
      expect(openQuoteSpy).toHaveBeenCalledTimes(0);
    });
    expect(selectElementSpy).not.toHaveBeenCalled();
  });

  it('writes element param when activeElement becomes non-null', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const { rerender } = renderHook(() => useURLSync());
    chemState.activeElement = 'P';
    rerender();

    const lastCall = replaceSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toContain('?element=P');
  });

  it('removes element param when activeElement becomes null', () => {
    setSearch('?element=P&foo=1');
    chemState.activeElement = 'P';

    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const { rerender } = renderHook(() => useURLSync());
    chemState.activeElement = null;
    rerender();

    const lastCall = replaceSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toContain('?foo=1');
    expect(String(lastCall?.[2])).not.toContain('element=');
  });

  it('writes quote param when activeQuote becomes non-null', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const { rerender } = renderHook(() => useURLSync());
    explorerState.activeQuote = {
      id: 'q-001',
      text: 'quote',
      speaker: 'Walter White',
      characterId: 'walt',
      season: 1,
      episode: 'S01E01',
      tone: 'menacing',
      contextNote: 'note',
    };
    rerender();

    const lastCall = replaceSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toContain('?quote=q-001');
  });

  it('removes quote param when activeQuote becomes null', () => {
    setSearch('?quote=q-001&foo=1');
    explorerState.activeQuote = {
      id: 'q-001',
      text: 'quote',
      speaker: 'Walter White',
      characterId: 'walt',
      season: 1,
      episode: 'S01E01',
      tone: 'menacing',
      contextNote: 'note',
    };

    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const { rerender } = renderHook(() => useURLSync());
    explorerState.activeQuote = null;
    rerender();

    const lastCall = replaceSpy.mock.calls.at(-1);
    expect(lastCall?.[2]).toContain('?foo=1');
    expect(String(lastCall?.[2])).not.toContain('quote=');
  });

  it('preserves unrelated params while syncing quote and element', () => {
    setSearch('?foo=1');
    chemState.activeElement = 'P';
    explorerState.activeQuote = {
      id: 'q-001',
      text: 'quote',
      speaker: 'Walter White',
      characterId: 'walt',
      season: 1,
      episode: 'S01E01',
      tone: 'menacing',
      contextNote: 'note',
    };

    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    renderHook(() => useURLSync());

    const lastCall = String(replaceSpy.mock.calls.at(-1)?.[2]);
    expect(lastCall).toContain('foo=1');
    expect(lastCall).toContain('element=P');
    expect(lastCall).toContain('quote=q-001');
  });

  it('uses history.replaceState and never uses pushState', () => {
    chemState.activeElement = 'P';
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const pushSpy = vi.spyOn(window.history, 'pushState');

    renderHook(() => useURLSync());

    expect(replaceSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('does not call replaceState when computed search string is unchanged', () => {
    setSearch('?element=P');
    chemState.activeElement = 'P';
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    renderHook(() => useURLSync());

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('never changes pathname while syncing params', () => {
    setSearch('');
    chemState.activeElement = 'P';
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    renderHook(() => useURLSync());

    const lastCall = String(replaceSpy.mock.calls.at(-1)?.[2]);
    expect(lastCall.startsWith(pathname)).toBe(true);
  });

  it('reads stores through hook selectors', () => {
    renderHook(() => useURLSync());

    expect(vi.mocked(useChemStore)).toHaveBeenCalled();
    expect(vi.mocked(useExplorerStore)).toHaveBeenCalled();
  });
});
