import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { getGalleryItemCount } from "../utils/galleryItems";

export interface CeilingSpotAnchor {
  x: number;
  z: number;
}

export const getCeilingSpotLayout = (config: ArtGallerySceneConfig): CeilingSpotAnchor[] => {
  const artworkDepth = getGalleryItemCount(config) * config.corridor.artworkSpacing;
  const totalDepth = artworkDepth + config.corridor.segmentLength * 2;
  const extendedDepth = config.infiniteCorridor
    ? totalDepth + config.corridor.segmentLength * 6
    : totalDepth;
  const spotSpacing = Math.max(2.8, config.corridor.segmentLength * 0.55);
  const spotCount = Math.max(8, Math.ceil(extendedDepth / spotSpacing));

  return Array.from({ length: spotCount }, (_, index) => {
    const z = -2 - index * spotSpacing;
    const x = index % 2 === 0 ? -config.corridor.width * 0.08 : config.corridor.width * 0.08;
    return { x, z };
  });
};
