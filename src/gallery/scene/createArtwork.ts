import { Group, Object3D, SpotLight } from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import type { PositionedArtwork } from "../types/galleryRuntime";
import { loadTextureWithFallback } from "../utils/textureLoader";
import { createArtworkFrame } from "./createArtworkFrame";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";

export interface CreatedArtwork {
  meshGroup: Group;
  spotlight: SpotLight;
  spotlightTarget: Object3D;
  baseSpotlightIntensity: number;
}

export const createArtwork = async (
  config: ArtGallerySceneConfig,
  artwork: PositionedArtwork,
): Promise<CreatedArtwork> => {
  const { texture } = await loadTextureWithFallback({
    url: artwork.imageUrl,
    fallbackUrl: artwork.fallbackImageUrl,
  });

  const frame = createArtworkFrame(artwork, texture);

  const meshGroup = new Group();
  meshGroup.position.set(artwork.position[0], artwork.position[1], artwork.position[2]);
  meshGroup.rotation.set(artwork.rotation[0], artwork.rotation[1], artwork.rotation[2]);
  meshGroup.add(frame.root);

  const baseIntensity = artwork.spotlightIntensity ?? GALLERY_DEFAULTS.artwork.spotlightIntensity;
  const spotlight = new SpotLight(0xffffff, baseIntensity, 22, Math.PI / 5.5, 0.45, 1.25);
  spotlight.position.set(
    artwork.side === "left" ? -config.corridor.width * 0.24 : config.corridor.width * 0.24,
    config.corridor.height - 0.3,
    artwork.position[2] + 1.5,
  );
  spotlight.castShadow = config.lightingMode === "contrast";
  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;

  const spotlightTarget = new Object3D();
  spotlightTarget.position.set(artwork.position[0], artwork.position[1], artwork.position[2]);
  spotlight.target = spotlightTarget;

  return {
    meshGroup,
    spotlight,
    spotlightTarget,
    baseSpotlightIntensity: baseIntensity,
  };
};

