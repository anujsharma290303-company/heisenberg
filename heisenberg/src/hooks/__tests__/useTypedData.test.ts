import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTypedData } from '../useTypedData.ts';

describe('useTypedData', () => {
  it('starts in loading state', () => {
    const loader = vi.fn(() => new Promise<string[]>(() => undefined));
    const { result } = renderHook(() => useTypedData(loader));

    expect(result.current.status).toBe('loading');
  });

  it('transitions to success with data', async () => {
    const loader = vi.fn(async () => ['alpha', 'beta']);
    const { result } = renderHook(() => useTypedData(loader));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    if (result.current.status === 'success') {
      expect(result.current.data).toEqual(['alpha', 'beta']);
    }
  });

  it('transitions to error on rejection', async () => {
    const loader = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useTypedData(loader));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('retry re-runs loader and recovers', async () => {
    let calls = 0;
    const loader = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error('fail once');
      }
      return ['ok'];
    });
    const { result } = renderHook(() => useTypedData(loader));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    act(() => {
      if (result.current.status === 'error') {
        result.current.retry();
      }
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('stores loadedAt timestamp on success', async () => {
    const loader = vi.fn(async () => ['ready']);
    const { result } = renderHook(() => useTypedData(loader));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    if (result.current.status === 'success') {
      expect(result.current.loadedAt).toBeInstanceOf(Date);
    }
  });
});
