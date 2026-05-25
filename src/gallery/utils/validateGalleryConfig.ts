import { CAMERA_DEFAULTS } from "../constants/cameraDefaults";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import type {
  ArtGallerySceneConfig,
  ArtworkConfig,
  ArtworkSideTextConfig,
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

const resolveNumericWithLegacy = (
  source: Record<string, unknown>,
  key: string,
  legacyKey: string | null,
  fallback: number,
  warnings: string[],
): number => {
  const value = source[key];
  if (typeof value === "number") {
    return value;
  }

  if (legacyKey) {
    const legacyValue = source[legacyKey];
    if (typeof legacyValue === "number") {
      warnings.push(`Using legacy key \`${legacyKey}\`; please migrate to \`${key}\`.`);
      return legacyValue;
    }
  }

  return fallback;
};

const sanitizeArtwork = (artwork: DeepPartial<ArtworkConfig>): ArtworkConfig | null => {
  if (!isNonEmptyString(artwork.id) || !isNonEmptyString(artwork.imageUrl) || !isNonEmptyString(artwork.title)) {
    return null;
  }

  const sanitizeSideText = (
    source: DeepPartial<ArtworkSideTextConfig> | undefined,
  ): ArtworkSideTextConfig | undefined => {
    if (!source || typeof source !== "object") {
      return undefined;
    }

    const eyebrow = isNonEmptyString(source.eyebrow) ? source.eyebrow.trim() : undefined;
    const title = isNonEmptyString(source.title) ? source.title.trim() : undefined;
    const description = isNonEmptyString(source.description) ? source.description.trim() : undefined;

    if (!eyebrow && !title && !description) {
      return undefined;
    }

    return {
      eyebrow,
      title,
      description,
      width: clamp(source.width ?? GALLERY_DEFAULTS.artwork.sideTextWidth, 0.8, 3.6),
      height: clamp(source.height ?? GALLERY_DEFAULTS.artwork.sideTextHeight, 0.6, 2.6),
      gap: clamp(source.gap ?? GALLERY_DEFAULTS.artwork.sideTextGap, 0.08, 2.2),
      offsetY: clamp(source.offsetY ?? GALLERY_DEFAULTS.artwork.sideTextOffsetY, -2, 2),
      offsetZ: clamp(source.offsetZ ?? GALLERY_DEFAULTS.artwork.sideTextOffsetZ, -3, 3),
      align: source.align === "before" || source.align === "after" ? source.align : "after",
      backgroundColor: source.backgroundColor ?? "#0e1422",
      textColor: source.textColor ?? "#f3f6fb",
    };
  };

  return {
    id: artwork.id,
    title: artwork.title,
    description: artwork.description,
    imageUrl: artwork.imageUrl,
    fallbackImageUrl: artwork.fallbackImageUrl,
    side: artwork.side === "left" || artwork.side === "right" ? artwork.side : undefined,
    width: clamp(artwork.width ?? GALLERY_DEFAULTS.artwork.width, 0.8, 4.2),
    height: clamp(artwork.height ?? GALLERY_DEFAULTS.artwork.height, 0.8, 3.2),
    frameEnabled: artwork.frameEnabled ?? GALLERY_DEFAULTS.artwork.frameEnabled,
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
    sideText: sanitizeSideText(artwork.sideText),
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

  const loopWhiteAfterEndWindowRaw = resolveNumericWithLegacy(
    legacySource,
    "loopWhiteAfterEndWindow",
    "loopWhiteTransitionWindow",
    defaultConfig.loopWhiteAfterEndWindow,
    warnings,
  );
  const loopWhiteStartsBeforeEndWindowRaw = resolveNumericWithLegacy(
    legacySource,
    "loopWhiteStartsBeforeEndWindow",
    "loopWhiteLeadWindow",
    defaultConfig.loopWhiteStartsBeforeEndWindow,
    warnings,
  );
  const loopWhiteFadeOutRevealWindowRaw = resolveNumericWithLegacy(
    legacySource,
    "loopWhiteFadeOutRevealWindow",
    "loopTitleRevealWindow",
    defaultConfig.loopWhiteFadeOutRevealWindow,
    warnings,
  );
  const loopWhiteFadeOutWindowRaw = resolveNumericWithLegacy(
    legacySource,
    "loopWhiteFadeOutWindow",
    "loopTitleReadableWindow",
    defaultConfig.loopWhiteFadeOutWindow,
    warnings,
  );
  const loopProgressAdvanceDuringWhiteFadeOutRaw = resolveNumericWithLegacy(
    legacySource,
    "loopProgressAdvanceDuringWhiteFadeOut",
    "loopRestartProgressWindow",
    defaultConfig.loopProgressAdvanceDuringWhiteFadeOut,
    warnings,
  );
  const corridorWidth = clamp(source.corridor?.width ?? defaultConfig.corridor.width, 4, 20);
  const corridorHeight = clamp(source.corridor?.height ?? defaultConfig.corridor.height, 2.8, 12);
  const corridorSegmentLength = clamp(
    source.corridor?.segmentLength ?? defaultConfig.corridor.segmentLength,
    4,
    30,
  );
  const corridorCarpetWidth = clamp(
    source.corridor?.carpetWidth ?? defaultConfig.corridor.carpetWidth,
    0.12,
    Math.max(0.12, corridorWidth - 0.35),
  );

  const config: ArtGallerySceneConfig = {
    id: source.id ?? defaultConfig.id,
    sceneTitle: source.sceneTitle ?? defaultConfig.sceneTitle,
    lightingMode: VALID_LIGHTING_MODES.includes(source.lightingMode as LightingMode)
      ? (source.lightingMode as LightingMode)
      : defaultConfig.lightingMode,
    infiniteCorridor: resolvedInfiniteCorridor,
    sceneBackgroundColor: source.sceneBackgroundColor ?? defaultConfig.sceneBackgroundColor,
    sceneFogColor: source.sceneFogColor ?? defaultConfig.sceneFogColor,
    ceilingSpotsEnabled: source.ceilingSpotsEnabled ?? defaultConfig.ceilingSpotsEnabled,
    ceilingSpotsColor: source.ceilingSpotsColor ?? defaultConfig.ceilingSpotsColor,
    ceilingSpotsIntensity: clamp(source.ceilingSpotsIntensity ?? defaultConfig.ceilingSpotsIntensity, 0, 4),
    artworkBacklightEnabled: source.artworkBacklightEnabled ?? defaultConfig.artworkBacklightEnabled,
    artworkBacklightColor: source.artworkBacklightColor ?? defaultConfig.artworkBacklightColor,
    artworkBacklightIntensity: clamp(
      source.artworkBacklightIntensity ?? defaultConfig.artworkBacklightIntensity,
      0,
      4,
    ),
    scrollStrength: normalizeScrollStrength(source.scrollStrength ?? defaultConfig.scrollStrength),
    loopWhiteAfterEndWindow: clamp(
      loopWhiteAfterEndWindowRaw,
      0.02,
      0.45,
    ),
    loopWhiteStartsBeforeEndWindow: clamp(
      loopWhiteStartsBeforeEndWindowRaw,
      0,
      0.45,
    ),
    loopWhiteFadeOutRevealWindow: clamp(
      loopWhiteFadeOutRevealWindowRaw,
      0.03,
      0.45,
    ),
    loopWhiteFadeOutWindow: clamp(
      loopWhiteFadeOutWindowRaw,
      0.05,
      0.6,
    ),
    loopProgressAdvanceDuringWhiteFadeOut: clamp(
      loopProgressAdvanceDuringWhiteFadeOutRaw,
      0,
      0.45,
    ),
    artworkFocusFill: clamp(source.artworkFocusFill ?? defaultConfig.artworkFocusFill, 0.35, 0.95),
    artworkTurnSmoothness: clamp(
      source.artworkTurnSmoothness ?? defaultConfig.artworkTurnSmoothness,
      0,
      1,
    ),
    artworkTurnKeyframes: Math.round(
      clamp(source.artworkTurnKeyframes ?? defaultConfig.artworkTurnKeyframes, 1, 12),
    ),
    artworkTurnLeadIn: clamp(
      source.artworkTurnLeadIn ?? defaultConfig.artworkTurnLeadIn,
      0,
      0.85,
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
      width: corridorWidth,
      height: corridorHeight,
      segmentLength: corridorSegmentLength,
      wallColor: source.corridor?.wallColor ?? defaultConfig.corridor.wallColor,
      floorColor: source.corridor?.floorColor ?? defaultConfig.corridor.floorColor,
      ceilingColor: source.corridor?.ceilingColor ?? defaultConfig.corridor.ceilingColor,
      carpetEnabled: source.corridor?.carpetEnabled ?? defaultConfig.corridor.carpetEnabled,
      carpetWidth: corridorCarpetWidth,
      carpetColor: source.corridor?.carpetColor ?? defaultConfig.corridor.carpetColor,
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

  if (config.loopWhiteFadeOutRevealWindow > config.loopWhiteFadeOutWindow) {
    warnings.push(
      "loopWhiteFadeOutRevealWindow is greater than loopWhiteFadeOutWindow. Values were aligned.",
    );
    config.loopWhiteFadeOutWindow = config.loopWhiteFadeOutRevealWindow;
  }

  return {
    config,
    errors,
    warnings,
  };
};

