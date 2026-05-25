import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { clamp } from "./clamp";

const {
  defaultStrength,
  minStrength,
  maxStrength,
  baseSensitivity,
  legacyBaseSensitivity,
  legacySensitivityThreshold,
} = GALLERY_DEFAULTS.scroll;

export const normalizeScrollStrength = (value: unknown): number => {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return defaultStrength;
  }

  // Backward compatibility: old configs used raw wheel sensitivity (e.g. 0.00024).
  if (value > 0 && value <= legacySensitivityThreshold) {
    const converted = value / legacyBaseSensitivity;
    return clamp(converted, minStrength, maxStrength);
  }

  return clamp(value, minStrength, maxStrength);
};

export const toWheelSensitivity = (strength: number): number => {
  const normalized = normalizeScrollStrength(strength);
  return normalized * baseSensitivity;
};
