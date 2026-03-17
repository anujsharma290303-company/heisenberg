import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockHandles = {
  rendererSetSize: ReturnType<typeof vi.fn>;
  rendererSetPixelRatio: ReturnType<typeof vi.fn>;
  rendererRender: ReturnType<typeof vi.fn>;
  rendererDispose: ReturnType<typeof vi.fn>;
  textureDispose: ReturnType<typeof vi.fn>;
  geometryDispose: ReturnType<typeof vi.fn>;
  materialDispose: ReturnType<typeof vi.fn>;
  meshPositionSet: ReturnType<typeof vi.fn>;
};

let handles: MockHandles;
let HeroPortraitScene: typeof import('../HeroPortraitScene').HeroPortraitScene;

const buildThreeMock = () => {
  const rendererSetSize = vi.fn();
  const rendererSetPixelRatio = vi.fn();
  const rendererRender = vi.fn();
  const rendererDispose = vi.fn();
  const textureDispose = vi.fn();
  const geometryDispose = vi.fn();
  const materialDispose = vi.fn();
  const meshPositionSet = vi.fn();

  class Scene {
    add = vi.fn();
  }

  class PerspectiveCamera {
    aspect = 1;
    position = {
      z: 0,
      set: vi.fn(),
    };
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();
  }

  class WebGLRenderer {
    domElement = document.createElement('canvas');
    setSize = rendererSetSize;
    setPixelRatio = rendererSetPixelRatio;
    render = rendererRender;
    dispose = rendererDispose;
    outputColorSpace = '';
  }

  class TextureLoader {
    load = vi.fn((url: string, onLoad?: (texture: unknown) => void) => {
      const texture = {
        image: { width: 1200, height: 800 },
        colorSpace: '',
        dispose: textureDispose,
      };
      void url;
      if (onLoad) {
        onLoad(texture);
      }
      return texture;
    });
  }

  class PlaneGeometry {
    dispose = geometryDispose;

    constructor(width: number, height: number, segX?: number, segY?: number) {
      void width;
      void height;
      void segX;
      void segY;
    }
  }

  class MeshBasicMaterial {
    dispose = materialDispose;

    constructor(params?: unknown) {
      void params;
    }
  }

  class Mesh {
    position = {
      set: meshPositionSet,
    };
    rotation = {
      x: 0,
      y: 0,
      z: 0,
    };
    scale = {
      setScalar: vi.fn(),
    };

    constructor(geometry: unknown, material: unknown) {
      void geometry;
      void material;
    }
  }

  return {
    module: {
      Scene,
      PerspectiveCamera,
      WebGLRenderer,
      TextureLoader,
      PlaneGeometry,
      MeshBasicMaterial,
      Mesh,
      SRGBColorSpace: 'srgb',
    },
    handles: {
      rendererSetSize,
      rendererSetPixelRatio,
      rendererRender,
      rendererDispose,
      textureDispose,
      geometryDispose,
      materialDispose,
      meshPositionSet,
    },
  };
};

describe('HeroPortraitScene', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 11);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined);

    const threeMock = buildThreeMock();
    handles = threeMock.handles;
    vi.doMock('three', () => threeMock.module);

    const module = await import('../HeroPortraitScene');
    HeroPortraitScene = module.HeroPortraitScene;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.doUnmock('three');
    handles.rendererSetSize.mockReset();
    handles.rendererSetPixelRatio.mockReset();
    handles.rendererRender.mockReset();
    handles.rendererDispose.mockReset();
    handles.textureDispose.mockReset();
    handles.geometryDispose.mockReset();
    handles.materialDispose.mockReset();
    handles.meshPositionSet.mockReset();
  });

  it('renders a scene host element', () => {
    const { container } = render(<HeroPortraitScene />);

    expect(container.firstChild).not.toBeNull();
  });

  it('creates a WebGL renderer and sizes it to the host bounds', () => {
    const { container } = render(<HeroPortraitScene />);
    const root = container.firstElementChild as HTMLDivElement;
    const host = root.firstElementChild as HTMLDivElement;

    Object.defineProperty(host, 'clientWidth', { configurable: true, value: 720 });
    Object.defineProperty(host, 'clientHeight', { configurable: true, value: 540 });

    window.dispatchEvent(new Event('resize'));

    expect(handles.rendererSetSize).toHaveBeenCalledWith(720, 540);
    expect(handles.rendererSetPixelRatio).toHaveBeenCalled();
  });

  it('starts an animation frame loop and cancels it on unmount', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { unmount } = render(<HeroPortraitScene />);
    unmount();

    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalledWith(11);
  });

  it('disposes renderer resources on unmount', () => {
    const { unmount } = render(<HeroPortraitScene />);
    unmount();

    expect(handles.rendererDispose).toHaveBeenCalled();
    expect(handles.textureDispose).toHaveBeenCalled();
    expect(handles.geometryDispose).toHaveBeenCalled();
    expect(handles.materialDispose).toHaveBeenCalled();
  });

  it('loads the portrait and positions the plane in front of camera', () => {
    render(<HeroPortraitScene />);

    expect(handles.meshPositionSet).toHaveBeenCalledWith(0, 0.1, 0);
  });
});
