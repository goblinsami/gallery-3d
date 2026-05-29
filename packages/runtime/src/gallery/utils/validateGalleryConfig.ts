import { CAMERA_DEFAULTS } from "../constants/cameraDefaults";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import type {
  ArtGallerySceneConfig,
  GalleryItem,
  ArtworkConfig,
  ArtworkSideTextConfig,
  StationalCardConfig,
  StationalCardLayout,
  StationalCardVariant,
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
const VALID_STATIONAL_VARIANTS: StationalCardVariant[] = [
  "about",
  "contact",
  "manifesto",
  "services",
  "awards",
  "testimonial",
  "cta",
  "custom",
];
const VALID_STATIONAL_LAYOUTS: StationalCardLayout[] = ["text", "image-left", "image-right"];

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
      backgroundColor: source.backgroundColor ?? GALLERY_TOKENS.artwork.sideTextBackground,
      textColor: source.textColor ?? GALLERY_TOKENS.artwork.sideTextText,
      borderEnabled: source.borderEnabled ?? GALLERY_DEFAULTS.artwork.sideTextBorderEnabled,
      borderColor: source.borderColor ?? GALLERY_DEFAULTS.artwork.sideTextBorderColor,
      borderIntensity: clamp(
        source.borderIntensity ?? GALLERY_DEFAULTS.artwork.sideTextBorderIntensity,
        0,
        4,
      ),
      borderWidth: clamp(source.borderWidth ?? GALLERY_DEFAULTS.artwork.sideTextBorderWidth, 0.01, 0.16),
    };
  };

  return {
    type: "artwork",
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

const sanitizeStationalCard = (
  station: DeepPartial<StationalCardConfig>,
): StationalCardConfig | null => {
  if (!isNonEmptyString(station.id) || !isNonEmptyString(station.title)) {
    return null;
  }

  const socialLinks = Array.isArray(station.socialLinks)
    ? station.socialLinks
        .map((link) => {
          const label = isNonEmptyString(link?.label) ? link.label.trim() : "";
          const url = isNonEmptyString(link?.url) ? link.url.trim() : "";
          if (!label || !url) {
            return null;
          }
          const icon = isNonEmptyString(link?.icon) ? link.icon.trim() : undefined;
          return icon ? { label, url, icon } : { label, url };
        })
        .filter(
          (
            entry,
          ): entry is NonNullable<StationalCardConfig["socialLinks"]>[number] => entry !== null,
        )
    : undefined;

  const ctaLabel = isNonEmptyString(station.cta?.label) ? station.cta.label.trim() : undefined;
  const ctaUrl = isNonEmptyString(station.cta?.url) ? station.cta.url.trim() : undefined;
  const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : undefined;

  return {
    id: station.id.trim(),
    type: "stational-card",
    variant: VALID_STATIONAL_VARIANTS.includes(station.variant as StationalCardVariant)
      ? (station.variant as StationalCardVariant)
      : undefined,
    title: station.title.trim(),
    subtitle: isNonEmptyString(station.subtitle) ? station.subtitle.trim() : undefined,
    description: isNonEmptyString(station.description) ? station.description.trim() : undefined,
    image: isNonEmptyString(station.image) ? station.image.trim() : undefined,
    layout: VALID_STATIONAL_LAYOUTS.includes(station.layout as StationalCardLayout)
      ? (station.layout as StationalCardLayout)
      : "text",
    socialLinks: socialLinks && socialLinks.length > 0 ? socialLinks : undefined,
    contact: {
      email: isNonEmptyString(station.contact?.email) ? station.contact.email.trim() : undefined,
      phone: isNonEmptyString(station.contact?.phone) ? station.contact.phone.trim() : undefined,
      location: isNonEmptyString(station.contact?.location) ? station.contact.location.trim() : undefined,
    },
    cta,
    width: clamp(station.width ?? GALLERY_DEFAULTS.stationalCard.width, 1.6, 8),
    height: clamp(station.height ?? GALLERY_DEFAULTS.stationalCard.height, 1.2, 5),
    depth: clamp(station.depth ?? GALLERY_DEFAULTS.stationalCard.depth, 0.02, 0.4),
    backgroundColor: station.backgroundColor ?? GALLERY_DEFAULTS.stationalCard.backgroundColor,
    borderColor: station.borderColor ?? GALLERY_DEFAULTS.stationalCard.borderColor,
    glowColor: station.glowColor ?? GALLERY_DEFAULTS.stationalCard.glowColor,
    spotlightIntensity: clamp(
      station.spotlightIntensity ?? GALLERY_DEFAULTS.stationalCard.spotlightIntensity,
      0,
      4,
    ),
    mobileColumnLayout:
      typeof station.mobileColumnLayout === "boolean"
        ? station.mobileColumnLayout
        : undefined,
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
  const defaultItems: GalleryItem[] = Array.isArray(defaultConfig.items) && defaultConfig.items.length > 0
    ? defaultConfig.items
    : defaultConfig.artworks.map((artwork) => ({
        ...artwork,
        type: "artwork" as const,
      }));
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

  const hasStationalItems =
    Array.isArray(source.items) &&
    source.items.some((entry) => entry?.type === "stational-card");
  const rawItems = hasStationalItems
    ? source.items
    : Array.isArray(source.artworks)
      ? source.artworks
      : Array.isArray(source.items)
        ? source.items
        : null;

  const items = rawItems
    ? rawItems
        .map((entry, index) => {
          if (entry?.type === "stational-card") {
            const sanitizedStation = sanitizeStationalCard(entry as DeepPartial<StationalCardConfig>);
            if (!sanitizedStation) {
              errors.push(`Invalid stational card at index ${index}`);
            }
            return sanitizedStation;
          }

          const sanitizedArtwork = sanitizeArtwork(entry as DeepPartial<ArtworkConfig>);
          if (!sanitizedArtwork) {
            errors.push(`Invalid artwork at index ${index}`);
          }
          return sanitizedArtwork;
        })
        .filter((entry): entry is GalleryItem => Boolean(entry))
    : defaultItems;

  if (items.length === 0) {
    warnings.push("No valid gallery items found. Falling back to default item set.");
  }

  const artworkItems = items
    .filter((entry): entry is ArtworkConfig => entry.type !== "stational-card")
    .map((artwork) => ({
      ...artwork,
      type: "artwork" as const,
    }));

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
    enhanceNightReadibility:
      typeof source.enhanceNightReadibility === "boolean"
        ? source.enhanceNightReadibility
        : defaultConfig.enhanceNightReadibility,
    scrollStrength: normalizeScrollStrength(source.scrollStrength ?? defaultConfig.scrollStrength),
    mobileDetailsOverlayEnabled:
      typeof source.mobileDetailsOverlayEnabled === "boolean"
        ? source.mobileDetailsOverlayEnabled
        : defaultConfig.mobileDetailsOverlayEnabled,
    mobileDetailsBackdropEnabled:
      typeof source.mobileDetailsBackdropEnabled === "boolean"
        ? source.mobileDetailsBackdropEnabled
        : defaultConfig.mobileDetailsBackdropEnabled,
    mobileDetailsBackdropIntensity: clamp(
      source.mobileDetailsBackdropIntensity ?? defaultConfig.mobileDetailsBackdropIntensity,
      0,
      1,
    ),
    mobileDetailsBackdropHeight: clamp(
      source.mobileDetailsBackdropHeight ?? defaultConfig.mobileDetailsBackdropHeight,
      0,
      1,
    ),
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
      targetAspectRatio:
        typeof source.camera?.targetAspectRatio === "number"
          ? clamp(source.camera.targetAspectRatio, 0.7, 2.6)
          : undefined,
      mobileTargetAspectRatio:
        typeof source.camera?.mobileTargetAspectRatio === "number"
          ? clamp(source.camera.mobileTargetAspectRatio, 0.7, 2.6)
          : undefined,
      mobileBreakpointWidth:
        typeof source.camera?.mobileBreakpointWidth === "number"
          ? clamp(source.camera.mobileBreakpointWidth, 320, 1600)
          : 820,
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
      maxWidth: clamp(source.sceneTitleConfig?.maxWidth ?? defaultConfig.sceneTitleConfig.maxWidth, 0.8, 40),
      lineHeight: clamp(
        source.sceneTitleConfig?.lineHeight ?? defaultConfig.sceneTitleConfig.lineHeight,
        0.8,
        2.4,
      ),
      color: source.sceneTitleConfig?.color ?? defaultConfig.sceneTitleConfig.color,
      daylightContrastEnabled:
        source.sceneTitleConfig?.daylightContrastEnabled ?? defaultConfig.sceneTitleConfig.daylightContrastEnabled,
      daylightContrastColor:
        source.sceneTitleConfig?.daylightContrastColor ?? defaultConfig.sceneTitleConfig.daylightContrastColor,
      daylightContrastStrength: clamp(
        source.sceneTitleConfig?.daylightContrastStrength ?? defaultConfig.sceneTitleConfig.daylightContrastStrength,
        0,
        1,
      ),
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
    items: items.length > 0 ? items : defaultItems,
    artworks: artworkItems,
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

