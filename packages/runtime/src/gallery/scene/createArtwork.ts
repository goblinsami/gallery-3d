import { Group, Object3D, PointLight, RectAreaLight, SpotLight } from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import type { PositionedArtwork } from "../types/galleryRuntime";
import { loadTextureWithFallback } from "../utils/textureLoader";
import { createArtworkFrame } from "./createArtworkFrame";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { createArtworkSideText } from "./createArtworkSideText";

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
  const sideText = createArtworkSideText(artwork);

  const meshGroup = new Group();
  meshGroup.position.set(artwork.position[0], artwork.position[1], artwork.position[2]);
  meshGroup.rotation.set(artwork.rotation[0], artwork.rotation[1], artwork.rotation[2]);
  meshGroup.add(frame.root);
  if (sideText) {
    meshGroup.add(sideText);
  }

  const baseIntensity = artwork.spotlightIntensity ?? GALLERY_DEFAULTS.artwork.spotlightIntensity;
  const isContrastMode = config.lightingMode === "contrast";
  const spotlight = new SpotLight(
    GALLERY_TOKENS.artwork.spotlight,
    isContrastMode ? baseIntensity * 1.18 : baseIntensity,
    isContrastMode ? 28 : 22,
    isContrastMode ? Math.PI / 7 : Math.PI / 5.5,
    isContrastMode ? 0.34 : 0.45,
    isContrastMode ? 1.45 : 1.25,
  );
  spotlight.position.set(
    artwork.side === "left" ? -config.corridor.width * 0.24 : config.corridor.width * 0.24,
    config.corridor.height - 0.3,
    artwork.position[2] + (isContrastMode ? 1.15 : 1.5),
  );
  spotlight.castShadow = false;
  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;

  const spotlightTarget = new Object3D();
  spotlightTarget.position.set(artwork.position[0], artwork.position[1], artwork.position[2]);
  spotlight.target = spotlightTarget;

  if (config.artworkBacklightEnabled && config.artworkBacklightIntensity > 0) {
    const artworkWidth = artwork.width ?? GALLERY_DEFAULTS.artwork.width;
    const artworkHeight = artwork.height ?? GALLERY_DEFAULTS.artwork.height;
    const rectBackLight = new RectAreaLight(
      config.artworkBacklightColor,
      config.artworkBacklightIntensity * (isContrastMode ? 6.8 : 3.2),
      artworkWidth * 0.88,
      artworkHeight * 0.68,
    );
    rectBackLight.position.set(0, 0.02, -0.09);
    rectBackLight.lookAt(0, 0.02, -1.2);

    const backTarget = new Object3D();
    backTarget.position.set(0, 0.02, -0.52);

    const backEdgeSpot = new SpotLight(
      config.artworkBacklightColor,
      config.artworkBacklightIntensity * (isContrastMode ? 1.55 : 1),
      0,
      Math.PI / 5.6,
      0.3,
      1,
    );
    backEdgeSpot.position.set(0, 0.02, -0.1);
    backEdgeSpot.target = backTarget;
    backEdgeSpot.castShadow = false;

    const backFill = new PointLight(
      config.artworkBacklightColor,
      config.artworkBacklightIntensity * (isContrastMode ? 0.95 : 0.45),
      config.corridor.width * 0.62,
      1,
    );
    backFill.position.set(0, 0.02, -0.22);

    meshGroup.add(backTarget, rectBackLight, backEdgeSpot, backFill);
  }

  return {
    meshGroup,
    spotlight,
    spotlightTarget,
    baseSpotlightIntensity: baseIntensity,
  };
};

