import type { LightingMode } from "../types/galleryConfig";

export interface LightingPreset {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  shadowMapSize: number;
  shadowSoftness: number;
  fogDensity: number;
}

export const LIGHTING_PRESETS: Record<LightingMode, LightingPreset> = {
  contrast: {
    ambientIntensity: 0.2,
    directionalIntensity: 0.36,
    directionalPosition: [4, 8, 6],
    shadowMapSize: 2048,
    shadowSoftness: 0.45,
    fogDensity: 0.055,
  },
  day: {
    ambientIntensity: 0.65,
    directionalIntensity: 0.72,
    directionalPosition: [6, 10, 3],
    shadowMapSize: 1024,
    shadowSoftness: 0.85,
    fogDensity: 0.028,
  },
};

