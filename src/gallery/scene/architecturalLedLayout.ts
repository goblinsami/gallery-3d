import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { getCeilingGridLayout } from "./ceilingSpotLayout";

export interface ArchitecturalLedLayout {
  depthCenter: number;
  depthLength: number;
  longitudinalAnchors: Array<{ x: number; y: number }>;
  verticalAnchors: Array<{ x: number; z: number }>;
}

export interface ArchitecturalLedRakeLightAnchor {
  x: number;
  y: number;
  z: number;
  intensityScale: number;
}

const sampleEvenly = <T>(items: T[], maxCount: number): T[] => {
  if (items.length <= maxCount) {
    return items;
  }

  const step = items.length / maxCount;
  return Array.from({ length: maxCount }, (_, index) => items[Math.floor(index * step)]);
};

export const getArchitecturalLedLayout = (
  config: ArtGallerySceneConfig,
): ArchitecturalLedLayout => {
  const grid = getCeilingGridLayout(config);
  const wallX = config.corridor.width / 2 - GALLERY_DEFAULTS.architecture.ledStripWallInset;
  const floorY = GALLERY_DEFAULTS.architecture.ledStripEdgeInset;
  const ceilingY = config.corridor.height - GALLERY_DEFAULTS.architecture.ledStripEdgeInset;
  const longitudinalAnchors = [
    { x: -wallX, y: floorY },
    { x: wallX, y: floorY },
    { x: -wallX, y: ceilingY },
    { x: wallX, y: ceilingY },
  ];
  const verticalAnchors = grid.crossRailZPositions.flatMap((z) => [
    { x: -wallX, z },
    { x: wallX, z },
  ]);

  return {
    depthCenter: grid.depthCenter,
    depthLength: grid.depthLength,
    longitudinalAnchors,
    verticalAnchors,
  };
};

export const getArchitecturalLedRakeLightLayout = (
  config: ArtGallerySceneConfig,
): ArchitecturalLedRakeLightAnchor[] => {
  const grid = getCeilingGridLayout(config);
  const maxLights = GALLERY_DEFAULTS.architecture.maxLedRakeLights;
  const verticalPairCount = Math.max(
    1,
    Math.floor(maxLights * 0.5 / 2),
  );
  const floorPairCount = Math.max(1, Math.floor((maxLights - verticalPairCount * 2) / 2));
  const verticalZPositions = sampleEvenly(grid.crossRailZPositions, verticalPairCount);
  const floorZPositions = sampleEvenly(grid.crossRailZPositions, floorPairCount);
  const lightX = config.corridor.width / 2 - GALLERY_DEFAULTS.architecture.ledRakeLightWallInset;
  const floorY =
    GALLERY_DEFAULTS.architecture.ledStripEdgeInset +
    GALLERY_DEFAULTS.architecture.ledFloorLightYOffset;
  const verticalY =
    config.corridor.height *
    GALLERY_DEFAULTS.architecture.ledVerticalLightHeightScale;

  const floorLights = floorZPositions.flatMap((z) => [
    {
      x: -lightX,
      y: floorY,
      z,
      intensityScale: GALLERY_DEFAULTS.architecture.ledFloorLightIntensityScale,
    },
    {
      x: lightX,
      y: floorY,
      z,
      intensityScale: GALLERY_DEFAULTS.architecture.ledFloorLightIntensityScale,
    },
  ]);
  const verticalLights = verticalZPositions.flatMap((z) => [
    {
      x: -lightX,
      y: verticalY,
      z,
      intensityScale: GALLERY_DEFAULTS.architecture.ledVerticalLightIntensityScale,
    },
    {
      x: lightX,
      y: verticalY,
      z,
      intensityScale: GALLERY_DEFAULTS.architecture.ledVerticalLightIntensityScale,
    },
  ]);

  return [...floorLights, ...verticalLights].slice(0, maxLights);
};
