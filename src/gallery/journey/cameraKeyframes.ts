import type { ArtGallerySceneConfig, ArtworkSide, Vec3 } from "../types/galleryConfig";
import type {
  CameraKeyframe,
  JourneySegment,
  PositionedArtwork,
  PositionedGalleryItem,
} from "../types/galleryRuntime";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { buildJourneyTimeline } from "./buildJourneyTimeline";
import { lerp, lerpVec3 } from "../utils/math";
import { getGalleryItems, isArtworkItem, isStationalCard } from "../utils/galleryItems";

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const ASSUMED_VIEWPORT_ASPECT = 16 / 9;
const MIN_VIEWPORT_ASPECT = 0.45;
const MAX_VIEWPORT_ASPECT = 3.2;
const IMAGE_SURFACE_OFFSET = 0.02;
const STATIONAL_PASS_THROUGH_MIN = 0.18;
const STATIONAL_LOOK_AHEAD_MIN = 0.28;
const STATIONAL_RETURN_FORWARD_MIN = 1.4;
const STATIONAL_RETURN_FORWARD_SPACING_SHARE = 0.16;
const START_TITLE_FRAME_MARGIN = 1.12;
const START_TITLE_VERTICAL_PAD = 1.9;
const START_TITLE_HORIZONTAL_PAD = 1.08;
const smootherstep = (t: number): number => {
  const clamped = clamp01(t);
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
};
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export interface ArtworkLayoutOptions {
  viewportAspect?: number;
}

const resolveViewportAspect = (options?: ArtworkLayoutOptions): number => {
  const rawAspect = options?.viewportAspect;
  if (typeof rawAspect !== "number" || !Number.isFinite(rawAspect)) {
    return ASSUMED_VIEWPORT_ASPECT;
  }

  return clamp(rawAspect, MIN_VIEWPORT_ASPECT, MAX_VIEWPORT_ASPECT);
};

const titleOpacityAt = (config: ArtGallerySceneConfig, progress: number): number => {
  const { fadeStartProgress, fadeEndProgress, maxOpacity } = config.sceneTitleConfig;

  if (progress <= fadeStartProgress) {
    return maxOpacity;
  }

  if (progress >= fadeEndProgress) {
    return 0;
  }

  const ratio = (progress - fadeStartProgress) / Math.max(0.0001, fadeEndProgress - fadeStartProgress);
  return maxOpacity * (1 - ratio);
};

const getArtworkSide = (
  index: number,
  sideOverride: ArtworkSide | undefined,
  startSide: ArtworkSide,
): ArtworkSide => {
  if (sideOverride === "left" || sideOverride === "right") {
    return sideOverride;
  }

  if (startSide === "left") {
    return index % 2 === 0 ? "left" : "right";
  }

  return index % 2 === 0 ? "right" : "left";
};

const getFocusDistance = (
  config: ArtGallerySceneConfig,
  item: { width?: number; height?: number },
  options?: ArtworkLayoutOptions,
): number => {
  const itemWidth = item.width ?? GALLERY_DEFAULTS.artwork.width;
  const itemHeight = item.height ?? GALLERY_DEFAULTS.artwork.height;
  const focusFill = Math.min(0.98, Math.max(0.3, config.artworkFocusFill));
  const viewportAspect = resolveViewportAspect(options);

  const halfVerticalFov = (config.camera.fov * Math.PI) / 360;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * viewportAspect);

  const distanceByHeight =
    (itemHeight * 0.5) / Math.max(0.0001, Math.tan(halfVerticalFov) * focusFill);
  const distanceByWidth =
    (itemWidth * 0.5) / Math.max(0.0001, Math.tan(halfHorizontalFov) * focusFill);

  return Math.max(0.9, Math.max(distanceByHeight, distanceByWidth));
};

const resolveForwardStartCameraPosition = (config: ArtGallerySceneConfig, titlePosition: Vec3): Vec3 => {
  const viewportAspect = ASSUMED_VIEWPORT_ASPECT;
  const halfVerticalFov = (config.camera.fov * Math.PI) / 360;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * viewportAspect);
  const titleHeight = Math.max(0.22, config.sceneTitleConfig.size * config.sceneTitleConfig.lineHeight * START_TITLE_VERTICAL_PAD);
  const titleWidth = Math.max(0.9, config.sceneTitleConfig.maxWidth * START_TITLE_HORIZONTAL_PAD);
  const distanceByHeight = (titleHeight * 0.5) / Math.max(0.0001, Math.tan(halfVerticalFov));
  const distanceByWidth = (titleWidth * 0.5) / Math.max(0.0001, Math.tan(halfHorizontalFov));
  const titleDistance = Math.max(distanceByHeight, distanceByWidth) * START_TITLE_FRAME_MARGIN;

  return [0, config.camera.height, titlePosition[2] + Math.max(1.4, titleDistance)];
};

export const calculateArtworkLayout = (
  config: ArtGallerySceneConfig,
  options?: ArtworkLayoutOptions,
): PositionedGalleryItem[] => {
  const items = getGalleryItems(config);
  const firstArtwork = items.find(isArtworkItem);
  const sideStart: ArtworkSide = firstArtwork?.side === "right" ? "right" : "left";
  const wallHalfWidth = config.corridor.width / 2;
  const baseZ = -config.corridor.segmentLength;
  const cameraHeight = config.camera.height;

  return items.map((item, index) => {
    const z = baseZ - index * config.corridor.artworkSpacing;

    if (isStationalCard(item)) {
      const width = clamp(item.width ?? GALLERY_DEFAULTS.stationalCard.width, 1.6, 8);
      const height = clamp(item.height ?? GALLERY_DEFAULTS.stationalCard.height, 1.2, 5);
      const depth = clamp(item.depth ?? GALLERY_DEFAULTS.stationalCard.depth, 0.02, 0.4);
      const focusDistance = getFocusDistance(config, { width, height }, options);
      const focusTarget: Vec3 = [0, cameraHeight, z + depth * 0.5];
      const focusPosition: Vec3 = [0, cameraHeight, z + focusDistance];
      const centerPosition: Vec3 = [0, cameraHeight, z + Math.max(2.1, width * 0.45)];

      return {
        ...item,
        width,
        height,
        depth,
        index,
        position: [0, cameraHeight, z],
        rotation: [0, 0, 0],
        lookAt: [0, cameraHeight, z],
        focusTarget,
        focusPosition,
        centerPosition,
      };
    }

    const artwork = item;
    const side = getArtworkSide(index, artwork.side, sideStart);
    const normalX = side === "left" ? 1 : -1;
    const x =
      side === "left"
        ? -wallHalfWidth + config.corridor.wallThickness + config.corridor.artworkInset
        : wallHalfWidth - config.corridor.wallThickness - config.corridor.artworkInset;
    const artworkWidth = artwork.width ?? GALLERY_DEFAULTS.artwork.width;
    const artworkHeight = artwork.height ?? GALLERY_DEFAULTS.artwork.height;
    const frameDepth = artwork.frameDepth ?? GALLERY_DEFAULTS.artwork.frameDepth;
    const sideText = artwork.sideText;
    const hasSideText = Boolean(sideText?.title || sideText?.eyebrow || sideText?.description);
    const sideTextWidth = clamp(sideText?.width ?? GALLERY_DEFAULTS.artwork.sideTextWidth, 0.8, 3.6);
    const sideTextHeight = clamp(sideText?.height ?? GALLERY_DEFAULTS.artwork.sideTextHeight, 0.6, 2.6);
    const sideTextGap = clamp(sideText?.gap ?? GALLERY_DEFAULTS.artwork.sideTextGap, 0.08, 2.2);
    const sideTextAlignSign = sideText?.align === "before" ? -1 : 1;
    const sideTextLocalOffsetX = hasSideText
      ? sideTextAlignSign * (artworkWidth / 2 + sideTextGap + sideTextWidth / 2)
      : 0;
    const sideTextWorldZDirection = side === "left" ? -1 : 1;
    const sideTextWorldZ = z + sideTextWorldZDirection * sideTextLocalOffsetX;
    const focusTargetZ = hasSideText ? (z + sideTextWorldZ) / 2 : z;
    const compositionWidth = hasSideText ? artworkWidth + sideTextGap + sideTextWidth : artworkWidth;
    const compositionHeight = hasSideText ? Math.max(artworkHeight, sideTextHeight) : artworkHeight;
    const focusDistance = getFocusDistance(config, {
      width: compositionWidth,
      height: compositionHeight,
    }, options);

    const position: Vec3 = [x, cameraHeight, z];
    const lookAt: Vec3 = [0, cameraHeight, focusTargetZ];
    const focusTarget: Vec3 = [
      x + normalX * (frameDepth / 2 + IMAGE_SURFACE_OFFSET),
      cameraHeight,
      focusTargetZ,
    ];
    const focusPosition: Vec3 = [
      focusTarget[0] + normalX * focusDistance,
      cameraHeight,
      focusTargetZ,
    ];
    const centerPosition: Vec3 = [0, cameraHeight, z + 1.8];

    return {
      ...artwork,
      type: "artwork",
      index,
      side,
      position,
      rotation: [0, side === "left" ? Math.PI / 2 : -Math.PI / 2, 0],
      lookAt,
      focusTarget,
      focusPosition,
      centerPosition,
    } satisfies PositionedArtwork;
  });
};

const findSegment = (segments: JourneySegment[], label: string): JourneySegment => {
  const segment = segments.find((entry) => entry.label === label);
  if (!segment) {
    throw new Error(`Missing journey segment: ${label}`);
  }

  return segment;
};

export const buildCameraKeyframes = (
  config: ArtGallerySceneConfig,
  layout: PositionedGalleryItem[],
): CameraKeyframe[] => {
  const timeline = buildJourneyTimeline(
    config.timings,
    layout.map((item) => ({
      index: item.index,
      type: item.type === "stational-card" ? "stational-card" : "artwork",
    })),
  );
  const keyframes: CameraKeyframe[] = [];

  const push = (
    progress: number,
    position: Vec3,
    lookAt: Vec3,
    label: string,
    activeItemIndex: number | null,
  ): void => {
    const clampedProgress = clamp01(progress);
    keyframes.push({
      progress: clampedProgress,
      position,
      lookAt,
      titleOpacity: titleOpacityAt(config, clampedProgress),
      label,
      activeArtworkIndex: activeItemIndex,
      activeItemIndex,
    });
  };

  const startLookAt: Vec3 = [
    config.sceneTitleConfig.position[0],
    config.sceneTitleConfig.position[1],
    config.sceneTitleConfig.position[2],
  ];
  const startPosition =
    config.startPosition === "forward"
      ? resolveForwardStartCameraPosition(config, startLookAt)
      : config.camera.startPosition;

  push(0, startPosition, startLookAt, "start", null);

  const intro = findSegment(timeline.segments, "intro");
  const introEndPosition: Vec3 = [0, config.camera.height, 0.5];
  push(intro.end, introEndPosition, [0, config.camera.height, -10], "intro-end", null);

  layout.forEach((item) => {
    const travel = findSegment(timeline.segments, `artwork-${item.index}-travel`);
    const focusIn = findSegment(timeline.segments, `artwork-${item.index}-focus-in`);
    const focusHold = findSegment(timeline.segments, `artwork-${item.index}-focus-hold`);
    const returnSegment = findSegment(timeline.segments, `artwork-${item.index}-return`);

    if (isStationalCard(item)) {
      const stationDepth = item.depth ?? GALLERY_DEFAULTS.stationalCard.depth;
      const passThroughDepth = Math.max(stationDepth * 0.75, STATIONAL_PASS_THROUGH_MIN);
      const returnForwardDistance = Math.max(
        stationDepth * 2.8,
        STATIONAL_RETURN_FORWARD_MIN,
        config.corridor.artworkSpacing * STATIONAL_RETURN_FORWARD_SPACING_SHARE,
      );
      const focusInEndPosition: Vec3 = [
        item.position[0],
        config.camera.height,
        item.position[2] - passThroughDepth,
      ];
      const focusInEndLookAt: Vec3 = [
        item.focusTarget[0],
        item.focusTarget[1],
        focusInEndPosition[2] - Math.max(stationDepth, STATIONAL_LOOK_AHEAD_MIN),
      ];
      const returnEndPosition: Vec3 = [
        item.position[0],
        config.camera.height,
        item.position[2] - returnForwardDistance,
      ];
      const returnEndLookAt: Vec3 = [
        item.focusTarget[0],
        item.focusTarget[1],
        returnEndPosition[2] - Math.max(stationDepth, STATIONAL_LOOK_AHEAD_MIN),
      ];
      const focusHoldEndPosition = lerpVec3(
        focusInEndPosition,
        returnEndPosition,
        0.58,
      );
      const focusHoldEndLookAt: Vec3 = [
        item.focusTarget[0],
        item.focusTarget[1],
        focusHoldEndPosition[2] - Math.max(stationDepth, STATIONAL_LOOK_AHEAD_MIN),
      ];

      push(
        travel.end,
        item.centerPosition,
        item.lookAt,
        `artwork-${item.index}-travel-end`,
        item.index,
      );
      push(
        focusIn.end,
        focusInEndPosition,
        focusInEndLookAt,
        `artwork-${item.index}-focus-in-end`,
        item.index,
      );
      push(
        focusHold.end,
        focusHoldEndPosition,
        focusHoldEndLookAt,
        `artwork-${item.index}-focus-hold-end`,
        item.index,
      );
      push(
        returnSegment.end,
        returnEndPosition,
        returnEndLookAt,
        `artwork-${item.index}-return-end`,
        null,
      );
      return;
    }

    const turnKeyframes = Math.max(1, Math.round(config.artworkTurnKeyframes));
    const turnLeadIn = clamp(config.artworkTurnLeadIn, 0, 0.85);
    const previousKeyframe = keyframes[keyframes.length - 1];
    const travelStartPosition = previousKeyframe?.position ?? item.centerPosition;
    const travelStartLookAt = previousKeyframe?.lookAt ?? item.lookAt;
    const leadInStartT = clamp01(1 - turnLeadIn);
    const leadInStart = lerp(travel.start, travel.end, leadInStartT);
    const leadInStartPosition = lerpVec3(
      travelStartPosition,
      item.centerPosition,
      smootherstep(leadInStartT),
    );
    const turnStartLookAt = lerpVec3(
      travelStartLookAt,
      item.lookAt,
      smootherstep(leadInStartT),
    );
    const turnStartProgress = turnLeadIn > 0 ? leadInStart : focusIn.start;
    const resolveTurnLookAt = (progress: number): Vec3 => {
      const duration = Math.max(0.0001, focusIn.end - turnStartProgress);
      const t = clamp01((progress - turnStartProgress) / duration);
      return lerpVec3(turnStartLookAt, item.focusTarget, smootherstep(t));
    };

    if (turnLeadIn > 0) {
      push(
        leadInStart,
        leadInStartPosition,
        turnStartLookAt,
        `artwork-${item.index}-turn-lead-start`,
        null,
      );
    }

    push(
      travel.end,
      item.centerPosition,
      resolveTurnLookAt(travel.end),
      `artwork-${item.index}-travel-end`,
      null,
    );

    for (let step = 1; step <= turnKeyframes; step += 1) {
      const t = step / turnKeyframes;
      const positionT = smootherstep(t);
      const progress = lerp(focusIn.start, focusIn.end, t);
      const position = lerpVec3(item.centerPosition, item.focusPosition, positionT);
      const lookAt = resolveTurnLookAt(progress);
      const label =
        step === turnKeyframes
          ? `artwork-${item.index}-focus-in-end`
          : `artwork-${item.index}-focus-turn-${step}`;

      push(progress, position, lookAt, label, item.index);
    }

    push(
      focusHold.end,
      item.focusPosition,
      item.focusTarget,
      `artwork-${item.index}-focus-hold-end`,
      item.index,
    );
    push(
      returnSegment.end,
      item.centerPosition,
      [0, config.camera.height, item.position[2] - 2.2],
      `artwork-${item.index}-return-end`,
      null,
    );
  });

  const outro = findSegment(timeline.segments, "outro");
  const lastItem = layout[layout.length - 1];
  const finalPosition: Vec3 = lastItem
    ? [0, config.camera.height, lastItem.position[2] - config.corridor.artworkSpacing]
    : [0, config.camera.height, -8];
  const finalLookAt: Vec3 = [0, config.camera.height, finalPosition[2] - 10];
  push(outro.end, finalPosition, finalLookAt, "outro-end", null);

  keyframes.sort((a, b) => a.progress - b.progress);

  if (keyframes[keyframes.length - 1].progress < 1) {
    const last = keyframes[keyframes.length - 1];
    keyframes.push({
      ...last,
      progress: 1,
      titleOpacity: 0,
      label: "end",
      activeArtworkIndex: null,
      activeItemIndex: null,
    });
  }

  return keyframes;
};
