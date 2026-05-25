import type { ArtGallerySceneConfig, ArtworkSide, Vec3 } from "../types/galleryConfig";
import type { CameraKeyframe, JourneySegment, PositionedArtwork } from "../types/galleryRuntime";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { buildJourneyTimeline } from "./buildJourneyTimeline";
import { lerp, lerpVec3 } from "../utils/math";

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const ASSUMED_VIEWPORT_ASPECT = 16 / 9;
const IMAGE_SURFACE_OFFSET = 0.02;
const smootherstep = (t: number): number => {
  const clamped = clamp01(t);
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
};
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

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
  artwork: { width?: number; height?: number },
): number => {
  const artworkWidth = artwork.width ?? GALLERY_DEFAULTS.artwork.width;
  const artworkHeight = artwork.height ?? GALLERY_DEFAULTS.artwork.height;
  const focusFill = Math.min(0.98, Math.max(0.3, config.artworkFocusFill));

  const halfVerticalFov = (config.camera.fov * Math.PI) / 360;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * ASSUMED_VIEWPORT_ASPECT);

  const distanceByHeight =
    (artworkHeight * 0.5) / Math.max(0.0001, Math.tan(halfVerticalFov) * focusFill);
  const distanceByWidth =
    (artworkWidth * 0.5) / Math.max(0.0001, Math.tan(halfHorizontalFov) * focusFill);

  return Math.max(0.9, Math.max(distanceByHeight, distanceByWidth));
};

export const calculateArtworkLayout = (config: ArtGallerySceneConfig): PositionedArtwork[] => {
  const sideStart: ArtworkSide = config.artworks[0]?.side === "right" ? "right" : "left";
  const wallHalfWidth = config.corridor.width / 2;
  const baseZ = -config.corridor.segmentLength;
  const cameraHeight = config.camera.height;

  return config.artworks.map((artwork, index) => {
    const side = getArtworkSide(index, artwork.side, sideStart);
    const normalX = side === "left" ? 1 : -1;
    const z = baseZ - index * config.corridor.artworkSpacing;
    const x =
      side === "left"
        ? -wallHalfWidth + config.corridor.wallThickness + config.corridor.artworkInset
        : wallHalfWidth - config.corridor.wallThickness - config.corridor.artworkInset;
    const frameDepth = artwork.frameDepth ?? GALLERY_DEFAULTS.artwork.frameDepth;
    const focusDistance = getFocusDistance(config, artwork);

    const position: Vec3 = [x, cameraHeight, z];
    const lookAt: Vec3 = [0, cameraHeight, z];
    const focusTarget: Vec3 = [x + normalX * (frameDepth / 2 + IMAGE_SURFACE_OFFSET), cameraHeight, z];
    const focusPosition: Vec3 = [
      focusTarget[0] + normalX * focusDistance,
      cameraHeight,
      z,
    ];
    const centerPosition: Vec3 = [0, cameraHeight, z + 1.8];

    return {
      ...artwork,
      index,
      side,
      position,
      rotation: [0, side === "left" ? Math.PI / 2 : -Math.PI / 2, 0],
      lookAt,
      focusTarget,
      focusPosition,
      centerPosition,
    };
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
  layout: PositionedArtwork[],
): CameraKeyframe[] => {
  const timeline = buildJourneyTimeline(config.timings, layout.length);
  const keyframes: CameraKeyframe[] = [];

  const push = (
    progress: number,
    position: Vec3,
    lookAt: Vec3,
    label: string,
    activeArtworkIndex: number | null,
  ): void => {
    const clampedProgress = clamp01(progress);
    keyframes.push({
      progress: clampedProgress,
      position,
      lookAt,
      titleOpacity: titleOpacityAt(config, clampedProgress),
      label,
      activeArtworkIndex,
    });
  };

  const startLookAt: Vec3 = [
    config.sceneTitleConfig.position[0],
    config.sceneTitleConfig.position[1],
    config.sceneTitleConfig.position[2],
  ];

  push(0, config.camera.startPosition, startLookAt, "start", null);

  const intro = findSegment(timeline.segments, "intro");
  const introEndPosition: Vec3 = [0, config.camera.height, 0.5];
  push(intro.end, introEndPosition, [0, config.camera.height, -10], "intro-end", null);

  layout.forEach((artwork) => {
    const travel = findSegment(timeline.segments, `artwork-${artwork.index}-travel`);
    const focusIn = findSegment(timeline.segments, `artwork-${artwork.index}-focus-in`);
    const focusHold = findSegment(timeline.segments, `artwork-${artwork.index}-focus-hold`);
    const returnSegment = findSegment(timeline.segments, `artwork-${artwork.index}-return`);
    const turnKeyframes = Math.max(1, Math.round(config.artworkTurnKeyframes));
    const turnLeadIn = clamp(config.artworkTurnLeadIn, 0, 0.85);
    const previousKeyframe = keyframes[keyframes.length - 1];
    const travelStartPosition = previousKeyframe?.position ?? artwork.centerPosition;
    const travelStartLookAt = previousKeyframe?.lookAt ?? artwork.lookAt;
    const leadInStartT = clamp01(1 - turnLeadIn);
    const leadInStart = lerp(travel.start, travel.end, leadInStartT);
    const leadInStartPosition = lerpVec3(
      travelStartPosition,
      artwork.centerPosition,
      smootherstep(leadInStartT),
    );
    const leadInStartLookAt = lerpVec3(
      travelStartLookAt,
      artwork.lookAt,
      smootherstep(leadInStartT),
    );
    const turnStartProgress = turnLeadIn > 0 ? leadInStart : focusIn.start;
    const turnStartLookAt = turnLeadIn > 0 ? leadInStartLookAt : artwork.lookAt;
    const resolveTurnLookAt = (progress: number): Vec3 => {
      const duration = Math.max(0.0001, focusIn.end - turnStartProgress);
      const t = clamp01((progress - turnStartProgress) / duration);
      return lerpVec3(turnStartLookAt, artwork.focusTarget, smootherstep(t));
    };

    if (turnLeadIn > 0) {
      push(
        leadInStart,
        leadInStartPosition,
        turnStartLookAt,
        `artwork-${artwork.index}-turn-lead-start`,
        null,
      );
    }

    push(
      travel.end,
      artwork.centerPosition,
      resolveTurnLookAt(travel.end),
      `artwork-${artwork.index}-travel-end`,
      null,
    );

    for (let step = 1; step <= turnKeyframes; step += 1) {
      const t = step / turnKeyframes;
      const positionT = smootherstep(t);
      const progress = lerp(focusIn.start, focusIn.end, t);
      const position = lerpVec3(artwork.centerPosition, artwork.focusPosition, positionT);
      const lookAt = resolveTurnLookAt(progress);
      const label =
        step === turnKeyframes
          ? `artwork-${artwork.index}-focus-in-end`
          : `artwork-${artwork.index}-focus-turn-${step}`;

      push(progress, position, lookAt, label, artwork.index);
    }

    push(
      focusHold.end,
      artwork.focusPosition,
      artwork.focusTarget,
      `artwork-${artwork.index}-focus-hold-end`,
      artwork.index,
    );
    push(
      returnSegment.end,
      artwork.centerPosition,
      [0, config.camera.height, artwork.position[2] - 2.2],
      `artwork-${artwork.index}-return-end`,
      null,
    );
  });

  const outro = findSegment(timeline.segments, "outro");
  const lastArtwork = layout[layout.length - 1];
  const finalPosition: Vec3 = lastArtwork
    ? [0, config.camera.height, lastArtwork.position[2] - config.corridor.artworkSpacing]
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
    });
  }

  return keyframes;
};

