import { CAMERA_DEFAULTS } from "../constants/cameraDefaults";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import type {
  ArtGallerySceneConfig,
  ArtworkConfig,
  DeepPartial,
  LightingMode,
  Vec3,
} from "../types/galleryConfig";
import { clamp } from "./clamp";
import { normalizeScrollStrength } from "./scrollStrength";

export interface GalleryConfigValidationResult {
  config: ArtGallerySceneConfig;
  errors: string[];
  warnings: string[];
}

const VALID_LIGHTING_MODES: LightingMode[] = ["contrast", "day"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toVec3 = (value: unknown, fallback: Vec3): Vec3 => {
  if (
    Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    typeof value[2] === "number"
  ) {
    return [value[0], value[1], value[2]];
  }

  return fallback;
};

const sanitizeArtwork = (artwork: DeepPartial<ArtworkConfig>): ArtworkConfig | null => {
  if (!isNonEmptyString(artwork.id) || !isNonEmptyString(artwork.imageUrl) || !isNonEmptyString(artwork.title)) {
    return null;
  }

  return {
    id: artwork.id,
    title: artwork.title,
    description: artwork.description,
    imageUrl: artwork.imageUrl,
    fallbackImageUrl: artwork.fallbackImageUrl,
    side: artwork.side === "left" || artwork.side === "right" ? artwork.side : undefined,
    width: clamp(artwork.width ?? GALLERY_DEFAULTS.artwork.width, 0.8, 4.2),
    height: clamp(artwork.height ?? GALLERY_DEFAULTS.artwork.height, 0.8, 3.2),
    frameColor: artwork.frameColor ?? GALLERY_DEFAULTS.artwork.frameColor,
    frameThickness: clamp(
      artwork.frameThickness ?? GALLERY_DEFAULTS.artwork.frameThickness,
      0.02,
      0.32,
    ),
    frameDepth: clamp(artwork.frameDepth ?? GALLERY_DEFAULTS.artwork.frameDepth, 0.01, 0.2),
    spotlightIntensity: clamp(
      artwork.spotlightIntensity ?? GALLERY_DEFAULTS.artwork.spotlightIntensity,
      0,
      3,
    ),
    metadata: artwork.metadata,
  };
};

export const validateGalleryConfig = (
  partialConfig?: DeepPartial<ArtGallerySceneConfig>,
): GalleryConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const source = partialConfig ?? {};
  const legacySource = source as Record<string, unknown>;
  const defaultConfig = DEFAULT_GALLERY_CONFIG;
  const legacyInfiniteGallery = legacySource.infiniteGallery;
  const resolvedInfiniteCorridor =
    typeof source.infiniteCorridor === "boolean"
      ? source.infiniteCorridor
      : typeof legacyInfiniteGallery === "boolean"
        ? legacyInfiniteGallery
        : defaultConfig.infiniteCorridor;

  if (typeof legacyInfiniteGallery === "boolean" && source.infiniteCorridor === undefined) {
    warnings.push("Using legacy key `infiniteGallery`; please migrate to `infiniteCorridor`.");
  }

  const artworks = Array.isArray(source.artworks)
    ? source.artworks
        .map((artwork, index) => {
          const sanitized = sanitizeArtwork(artwork);
          if (!sanitized) {
            errors.push(`Invalid artwork at index ${index}`);
          }
          return sanitized;
        })
        .filter((entry): entry is ArtworkConfig => Boolean(entry))
    : defaultConfig.artworks;

  if (artworks.length === 0) {
    warnings.push("No valid artworks found. Falling back to default artwork set.");
  }

  const mode = source.lightingMode;
  if (mode && !VALID_LIGHTING_MODES.includes(mode)) {
    errors.push(`Invalid lighting mode: ${String(mode)}`);
  }

  const config: ArtGallerySceneConfig = {
    id: source.id ?? defaultConfig.id,
    sceneTitle: source.sceneTitle ?? defaultConfig.sceneTitle,
    lightingMode: VALID_LIGHTING_MODES.includes(source.lightingMode as LightingMode)
      ? (source.lightingMode as LightingMode)
      : defaultConfig.lightingMode,
    infiniteCorridor: resolvedInfiniteCorridor,
    scrollStrength: normalizeScrollStrength(source.scrollStrength ?? defaultConfig.scrollStrength),
    artworkFocusFill: clamp(source.artworkFocusFill ?? defaultConfig.artworkFocusFill, 0.35, 0.95),
    artworkTurnSmoothness: clamp(
      source.artworkTurnSmoothness ?? defaultConfig.artworkTurnSmoothness,
      0,
      1,
    ),
    artworkTurnKeyframes: Math.round(
      clamp(source.artworkTurnKeyframes ?? defaultConfig.artworkTurnKeyframes, 1, 12),
    ),
    camera: {
      fov: clamp(source.camera?.fov ?? defaultConfig.camera.fov, 35, 90),
      startPosition: toVec3(source.camera?.startPosition, defaultConfig.camera.startPosition),
      height: source.camera?.height ?? defaultConfig.camera.height,
      movementSmoothing: clamp(
        source.camera?.movementSmoothing ?? defaultConfig.camera.movementSmoothing,
        0.01,
        1,
      ),
      near: clamp(source.camera?.near ?? CAMERA_DEFAULTS.near, 0.01, 2),
      far: clamp(source.camera?.far ?? CAMERA_DEFAULTS.far, 50, 1000),
    },
    corridor: {
      width: clamp(source.corridor?.width ?? defaultConfig.corridor.width, 4, 20),
      height: clamp(source.corridor?.height ?? defaultConfig.corridor.height, 2.8, 12),
      segmentLength: clamp(
        source.corridor?.segmentLength ?? defaultConfig.corridor.segmentLength,
        4,
        30,
      ),
      wallColor: source.corridor?.wallColor ?? defaultConfig.corridor.wallColor,
      floorColor: source.corridor?.floorColor ?? defaultConfig.corridor.floorColor,
      ceilingColor: source.corridor?.ceilingColor ?? defaultConfig.corridor.ceilingColor,
      artworkSpacing: clamp(
        source.corridor?.artworkSpacing ?? defaultConfig.corridor.artworkSpacing,
        4,
        30,
      ),
      wallThickness: clamp(
        source.corridor?.wallThickness ?? defaultConfig.corridor.wallThickness,
        0.05,
        1,
      ),
      artworkInset: clamp(source.corridor?.artworkInset ?? defaultConfig.corridor.artworkInset, 0, 0.5),
    },
    sceneTitleConfig: {
      fontUrl: source.sceneTitleConfig?.fontUrl ?? defaultConfig.sceneTitleConfig.fontUrl,
      size: clamp(source.sceneTitleConfig?.size ?? defaultConfig.sceneTitleConfig.size, 0.3, 5),
      depth: clamp(source.sceneTitleConfig?.depth ?? defaultConfig.sceneTitleConfig.depth, 0.02, 1),
      color: source.sceneTitleConfig?.color ?? defaultConfig.sceneTitleConfig.color,
      position: toVec3(source.sceneTitleConfig?.position, defaultConfig.sceneTitleConfig.position),
      maxOpacity: clamp(source.sceneTitleConfig?.maxOpacity ?? defaultConfig.sceneTitleConfig.maxOpacity, 0, 1),
      fadeStartProgress: clamp(
        source.sceneTitleConfig?.fadeStartProgress ?? defaultConfig.sceneTitleConfig.fadeStartProgress,
        0,
        1,
      ),
      fadeEndProgress: clamp(
        source.sceneTitleConfig?.fadeEndProgress ?? defaultConfig.sceneTitleConfig.fadeEndProgress,
        0,
        1,
      ),
    },
    timings: {
      introDuration: Math.max(0.001, source.timings?.introDuration ?? defaultConfig.timings.introDuration),
      travelDuration: Math.max(0.001, source.timings?.travelDuration ?? defaultConfig.timings.travelDuration),
      focusDuration: Math.max(0.001, source.timings?.focusDuration ?? defaultConfig.timings.focusDuration),
      returnDuration: Math.max(0.001, source.timings?.returnDuration ?? defaultConfig.timings.returnDuration),
    },
    artworks: artworks.length > 0 ? artworks : defaultConfig.artworks,
  };

  if (config.sceneTitleConfig.fadeStartProgress > config.sceneTitleConfig.fadeEndProgress) {
    warnings.push("sceneTitleConfig.fadeStartProgress is greater than fadeEndProgress. Values were swapped.");
    const start = config.sceneTitleConfig.fadeEndProgress;
    config.sceneTitleConfig.fadeEndProgress = config.sceneTitleConfig.fadeStartProgress;
    config.sceneTitleConfig.fadeStartProgress = start;
  }

  return {
    config,
    errors,
    warnings,
  };
};

