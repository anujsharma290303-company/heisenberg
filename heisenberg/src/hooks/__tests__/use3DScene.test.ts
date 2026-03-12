import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { use3DScene } from '../use3DScene.ts';

describe('use3DScene', () => {
  it('returns onMouseDown handler', () => {
    const { result } = renderHook(() => use3DScene({ scene: 'desert' }));

    expect(result.current.onMouseDown).toBeTypeOf('function');
  });

  it('returns onMouseMove handler', () => {
    const { result } = renderHook(() => use3DScene({ scene: 'desert' }));

    expect(result.current.onMouseMove).toBeTypeOf('function');
  });

  it('returns onMouseUp handler', () => {
    const { result } = renderHook(() => use3DScene({ scene: 'desert' }));

    expect(result.current.onMouseUp).toBeTypeOf('function');
  });

  it('works for desert scene', () => {
    const { result } = renderHook(() => use3DScene({ scene: 'desert' }));

    expect(result.current.scene).toBe('desert');
  });

  it('works for molecule scene', () => {
    const { result } = renderHook(() => use3DScene({ scene: 'molecule' }));

    expect(result.current.scene).toBe('molecule');
  });
});


