import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { getGalleryItemCount } from "../utils/galleryItems";

export interface CeilingSpotAnchor {
  x: number;
  z: number;
}

export interface CeilingGridLayout {
  anchors: CeilingSpotAnchor[];
  crossRailZPositions: number[];
  frontZ: number;
  backZ: number;
  fadeStartZ: number;
  depthCenter: number;
  depthLength: number;
  longitudinalRailXPositions: number[];
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const smoothstep = (value: number): number => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export const getCeilingGridLayout = (config: ArtGallerySceneConfig): CeilingGridLayout => {
  const artworkDepth = getGalleryItemCount(config) * config.corridor.artworkSpacing;
  const totalDepth = artworkDepth + config.corridor.segmentLength * 2;
  const extendedDepth = config.infiniteCorridor
    ? totalDepth + config.corridor.segmentLength * 6
    : totalDepth;
  const frontZ = 4;
  const backZ = -extendedDepth;
  const depthLength = frontZ - backZ;
  const fadeDepth = config.corridor.segmentLength * GALLERY_DEFAULTS.architecture.ceilingGridFadeSegmentCount;
  const fadeStartZ = backZ + fadeDepth;
  const depthSpacing = GALLERY_DEFAULTS.architecture.ceilingGridDepthSpacing;
  const crossRailCount = Math.max(8, Math.ceil(depthLength / depthSpacing));
  const crossRailZPositions = Array.from(
    { length: crossRailCount + 1 },
    (_, index) => frontZ - index * (depthLength / crossRailCount),
  );
  const halfWidth = clamp(
    config.lightGridWidth / 2,
    GALLERY_DEFAULTS.architecture.lightGridMinWidth / 2,
    config.corridor.width / 2 - GALLERY_DEFAULTS.architecture.ceilingGridInset / 2,
  );
  const longitudinalRailXPositions = [-halfWidth, 0, halfWidth];
  const anchors = crossRailZPositions.flatMap((z) =>
    longitudinalRailXPositions.map((x) => ({ x, z })),
  );

  return {
    anchors,
    crossRailZPositions,
    frontZ,
    backZ,
    fadeStartZ,
    depthCenter: (frontZ + backZ) / 2,
    depthLength,
    longitudinalRailXPositions,
  };
};

export const getCeilingSpotLayout = (config: ArtGallerySceneConfig): CeilingSpotAnchor[] =>
  getCeilingGridLayout(config).anchors;

export const getCeilingGridFadeOpacity = (layout: CeilingGridLayout, z: number): number => {
  if (z >= layout.fadeStartZ) {
    return 1;
  }

  const fadeWindow = Math.max(0.001, layout.fadeStartZ - layout.backZ);
  return smoothstep((z - layout.backZ) / fadeWindow);
};
