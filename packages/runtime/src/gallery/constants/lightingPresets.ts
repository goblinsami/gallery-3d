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
    ambientIntensity: 0.14,
    directionalIntensity: 0.3,
    directionalPosition: [3, 7, 5],
    shadowMapSize: 2048,
    shadowSoftness: 0.35,
    fogDensity: 0.06,
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

