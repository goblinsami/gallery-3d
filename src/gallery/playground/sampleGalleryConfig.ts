import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";

export const sampleGalleryConfigs: ArtGallerySceneConfig[] = [
  DEFAULT_GALLERY_CONFIG,
  {
    ...DEFAULT_GALLERY_CONFIG,
    id: "mistery-museum",
    sceneTitle: "Mistery Museum",
    lightingMode: "contrast",
    infiniteCorridor: true,
    sceneBackgroundColor: GALLERY_TOKENS.samples.misteryMuseum.background,
    sceneFogColor: GALLERY_TOKENS.samples.misteryMuseum.fog,
    ceilingSpotsEnabled: true,
    ceilingSpotsColor: GALLERY_TOKENS.samples.misteryMuseum.ceilingSpots,
    ceilingSpotsIntensity: 4,
    artworkBacklightEnabled: true,
    artworkBacklightColor: GALLERY_TOKENS.samples.misteryMuseum.artworkBacklight,
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
      wallColor: GALLERY_TOKENS.samples.misteryMuseum.wall,
      floorColor: GALLERY_TOKENS.samples.misteryMuseum.floor,
      ceilingColor: GALLERY_TOKENS.samples.misteryMuseum.ceiling,
      carpetColor: GALLERY_TOKENS.samples.misteryMuseum.carpet,
      carpetWidth: 0.68,
      artworkSpacing: 12,
    },
    sceneTitleConfig: {
      ...DEFAULT_GALLERY_CONFIG.sceneTitleConfig,
      color: GALLERY_TOKENS.samples.misteryMuseum.title,
    },
    artworks: DEFAULT_GALLERY_CONFIG.artworks.map((artwork, index) => ({
      ...artwork,
      id: `m-${index + 1}`,
      side: index % 2 === 0 ? "right" : "left",
      frameColor: GALLERY_TOKENS.samples.misteryMuseum.frame,
      spotlightIntensity: 1.35,
      sideText: artwork.sideText
        ? {
            ...artwork.sideText,
            borderEnabled: true,
            borderColor: GALLERY_TOKENS.samples.misteryMuseum.sideTextBorder,
            borderIntensity: 2.2,
            borderWidth: 0.04,
          }
        : artwork.sideText,
    })),
  },
];
