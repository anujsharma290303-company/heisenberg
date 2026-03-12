export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const clamp = (v: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, v));
};

export const mapRange = (
  v: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number
): number => {
  if (inA === inB) {
    return outA;
  }

  const t = (v - inA) / (inB - inA);
  return lerp(outA, outB, t);
};

export const easeInOutCubic = (t: number): number => {
  if (t < 0.5) {
    return 4 * t * t * t;
  }

  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export interface ProjectedPoint {
  sx: number;
  sy: number;
  z: number;
  scale: number;
}

export const project3D = (
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  fov?: number
): ProjectedPoint => {
  if (typeof fov === 'number') {
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);

    const xzX = x * cosY - z * sinY;
    const xzZ = x * sinY + z * cosY;

    const yzY = y * cosX - xzZ * sinX;
    const yzZ = y * sinX + xzZ * cosX;

    const denom = fov + yzZ;
    const scale = denom === 0 ? 1 : fov / denom;

    return {
      sx: xzX * scale,
      sy: yzY * scale,
      z: yzZ,
      scale,
    };
  }

  const perspective = rx;
  const depth = ry;
  const denom = perspective + z + depth;
  const scale = denom === 0 ? 1 : perspective / denom;

  return {
    sx: x * scale,
    sy: y * scale,
    z,
    scale,
  };
};
