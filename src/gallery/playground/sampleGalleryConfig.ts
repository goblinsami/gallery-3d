import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";

export const sampleGalleryConfigs: ArtGallerySceneConfig[] = [
  DEFAULT_GALLERY_CONFIG,
  {
    ...DEFAULT_GALLERY_CONFIG,
    id: "daylight-gallery",
    sceneTitle: "Daylight Gallery",
    lightingMode: "day",
    infiniteCorridor: true,
    scrollStrength: 1.35,
    artworkFocusFill: 0.72,
    artworkTurnSmoothness: 0.72,
    artworkTurnKeyframes: 6,
    corridor: {
      ...DEFAULT_GALLERY_CONFIG.corridor,
      wallColor: "#f3f3f0",
      floorColor: "#8a8e96",
      ceilingColor: "#fcfcfb",
      artworkSpacing: 12,
    },
    sceneTitleConfig: {
      ...DEFAULT_GALLERY_CONFIG.sceneTitleConfig,
      color: "#2d3748",
    },
    artworks: DEFAULT_GALLERY_CONFIG.artworks.map((artwork, index) => ({
      ...artwork,
      id: `d-${index + 1}`,
      side: index % 2 === 0 ? "right" : "left",
      frameColor: "#2b3444",
      spotlightIntensity: 0.85,
    })),
  },
];

