import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeSection: 0,
      grainIntensity: 0.028,
    });
  });

  it('activeSection defaults to 0', () => {
    expect(useUIStore.getState().activeSection).toBe(0);
  });

  it('setSection updates activeSection', () => {
    useUIStore.getState().setSection(3);

    expect(useUIStore.getState().activeSection).toBe(3);
  });

  it('grainIntensity defaults to 0.028', () => {
    expect(useUIStore.getState().grainIntensity).toBe(0.028);
  });

  it('setGrainIntensity updates value', () => {
    useUIStore.getState().setGrainIntensity(0.07);

    expect(useUIStore.getState().grainIntensity).toBe(0.07);
  });
});
