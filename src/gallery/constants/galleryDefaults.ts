export const GALLERY_DEFAULTS = {
  scroll: {
    defaultStrength: 1,
    minStrength: 0.25,
    maxStrength: 8,
    baseSensitivity: 0.0007,
    legacyBaseSensitivity: 0.00024,
    legacySensitivityThreshold: 0.05,
  },
  corridor: {
    width: 8,
    height: 4.2,
    segmentLength: 12,
    artworkSpacing: 14,
    wallThickness: 0.24,
    artworkInset: 0.02,
  },
  artwork: {
    width: 2.4,
    height: 1.6,
    frameColor: "#151515",
    frameThickness: 0.14,
    frameDepth: 0.06,
    spotlightIntensity: 1.15,
  },
  timings: {
    introDuration: 1.1,
    travelDuration: 1,
    focusDuration: 0.9,
    returnDuration: 0.75,
  },
} as const;

