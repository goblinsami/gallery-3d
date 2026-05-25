import { CAMERA_DEFAULTS } from "../constants/cameraDefaults";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export const DEFAULT_GALLERY_CONFIG: ArtGallerySceneConfig = {
  id: "default-liminal-gallery",
  sceneTitle: "3D Art Gallery",
  lightingMode: "day",
  infiniteCorridor: true,
  scrollStrength: 1,
  loopWhiteAfterEndWindow: 0.05,
  loopWhiteStartsBeforeEndWindow: 0.08,
  loopWhiteFadeOutRevealWindow: 0.001,
  loopWhiteFadeOutWindow: 0.22,
  loopProgressAdvanceDuringWhiteFadeOut: 1,
  artworkFocusFill: 0.78,
  artworkTurnSmoothness: 0.65,
  artworkTurnKeyframes: 4,
  camera: {
    fov: CAMERA_DEFAULTS.fov,
    startPosition: [0, CAMERA_DEFAULTS.height, 10],
    height: CAMERA_DEFAULTS.height,
    movementSmoothing: CAMERA_DEFAULTS.movementSmoothing,
    near: CAMERA_DEFAULTS.near,
    far: CAMERA_DEFAULTS.far,
  },
  corridor: {
    width: GALLERY_DEFAULTS.corridor.width,
    height: GALLERY_DEFAULTS.corridor.height,
    segmentLength: GALLERY_DEFAULTS.corridor.segmentLength,
    wallColor: "#d8d9dd",
    floorColor: "#656b74",
    ceilingColor: "#eceff4",
    artworkSpacing: GALLERY_DEFAULTS.corridor.artworkSpacing,
    wallThickness: GALLERY_DEFAULTS.corridor.wallThickness,
    artworkInset: GALLERY_DEFAULTS.corridor.artworkInset,
  },
  sceneTitleConfig: {
    fontUrl: "/fonts/helvetiker_regular.typeface.json",
    size: 1.2,
    depth: 0.3,
    color: "#f2f4f7",
    position: [0, 1.75, 3.25],
    maxOpacity: 1,
    fadeStartProgress: 0.1,
    fadeEndProgress: 0.22,
  },
  timings: {
    introDuration: GALLERY_DEFAULTS.timings.introDuration,
    travelDuration: GALLERY_DEFAULTS.timings.travelDuration,
    focusDuration: GALLERY_DEFAULTS.timings.focusDuration,
    returnDuration: GALLERY_DEFAULTS.timings.returnDuration,
  },
  artworks: [
    {
      id: "w-01",
      title: "Echoes of Atrium",
      description: "A suspended fragment of stillness.",
      imageUrl: "https://picsum.photos/id/1035/1600/1100",
      fallbackImageUrl: "https://picsum.photos/seed/gallery-fallback-1/1600/1100",
      metadata: { artist: "A. Mercer", year: "2026", medium: "Archival Pigment" },
    }/* ,
    {
      id: "w-02",
      title: "Soft Geometry",
      description: "Planes, silence, and reflected light.",
      imageUrl: "https://picsum.photos/id/1027/1600/1100",
      fallbackImageUrl: "https://picsum.photos/seed/gallery-fallback-2/1600/1100",
      metadata: { artist: "I. Rowan", year: "2025", medium: "Digital C-Print" },
    }, */
/*     {
      id: "w-03",
      title: "Threshold #4",
      description: "A corridor inside another corridor.",
      imageUrl: "https://picsum.photos/id/1043/1600/1100",
      fallbackImageUrl: "https://picsum.photos/seed/gallery-fallback-3/1600/1100",
      metadata: { artist: "Noa Lane", year: "2026", medium: "Mixed Media" },
    },
    {
      id: "w-04",
      title: "Monochrome Drift",
      description: "A cloud-like structure in muted tones.",
      imageUrl: "https://picsum.photos/id/1033/1600/1100",
      fallbackImageUrl: "https://picsum.photos/seed/gallery-fallback-4/1600/1100",
      metadata: { artist: "R. Chen", year: "2024", medium: "Photography" },
    }, */
  ],
};
