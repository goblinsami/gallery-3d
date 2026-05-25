import type { Vec3 } from "../types/galleryConfig";

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const inverseLerp = (a: number, b: number, value: number): number => {
  if (a === b) {
    return 0;
  }

  return (value - a) / (b - a);
};

export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

export const lerpVec3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export const addVec3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

