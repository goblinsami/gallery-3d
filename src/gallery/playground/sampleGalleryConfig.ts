import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";

export const sampleGalleryConfigs: ArtGallerySceneConfig[] = [
  DEFAULT_GALLERY_CONFIG,
  {
    ...DEFAULT_GALLERY_CONFIG,
    id: "mistery-museum",
    sceneTitle: "Mistery Museum",
    lightingMode: "contrast",
    infiniteCorridor: true,
    sceneBackgroundColor: "#000000",
    sceneFogColor: "#050505",
    ceilingSpotsEnabled: true,
    ceilingSpotsColor: "#ff9a3d",
    ceilingSpotsIntensity: 4,
    artworkBacklightEnabled: true,
    artworkBacklightColor: "#ff7a1f",
    artworkBacklightIntensity: 4,
    scrollStrength: DEFAULT_GALLERY_CONFIG.scrollStrength,
    loopWhiteAfterEndWindow: 0.08,
    loopWhiteStartsBeforeEndWindow: 0.07,
    loopWhiteFadeOutRevealWindow: 0.12,
    loopWhiteFadeOutWindow: 0.24,
    loopProgressAdvanceDuringWhiteFadeOut: 0.22,
    artworkFocusFill: DEFAULT_GALLERY_CONFIG.artworkFocusFill,
    artworkTurnSmoothness: DEFAULT_GALLERY_CONFIG.artworkTurnSmoothness,
    artworkTurnKeyframes: DEFAULT_GALLERY_CONFIG.artworkTurnKeyframes,
    artworkTurnLeadIn: DEFAULT_GALLERY_CONFIG.artworkTurnLeadIn,
    corridor: {
      ...DEFAULT_GALLERY_CONFIG.corridor,
      wallColor: "#2b2723",
      floorColor: "#1f1a16",
      ceilingColor: "#211d1a",
      artworkSpacing: 12,
    },
    sceneTitleConfig: {
      ...DEFAULT_GALLERY_CONFIG.sceneTitleConfig,
      color: "#d8e3f8",
    },
    artworks: DEFAULT_GALLERY_CONFIG.artworks.map((artwork, index) => ({
      ...artwork,
      id: `m-${index + 1}`,
      side: index % 2 === 0 ? "right" : "left",
      frameColor: "#242b37",
      spotlightIntensity: 1.35,
    })),
  },
];

