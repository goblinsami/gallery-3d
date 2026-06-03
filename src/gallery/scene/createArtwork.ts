import { DirectionalLight, Group, Object3D, PointLight, RectAreaLight, SpotLight } from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import type { PositionedArtwork } from "../types/galleryRuntime";
import { loadTextureWithFallback } from "../utils/textureLoader";
import { createArtworkFrame } from "./createArtworkFrame";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { createArtworkSideText } from "./createArtworkSideText";
import type { ArchitecturalMaterialSet } from "./createArchitecturalMaterials";
import { createArtworkNiche } from "./createArchitecturalNiche";

export interface CreatedArtwork {
  meshGroup: Group;
  spotlight: SpotLight;
  spotlightTarget: Object3D;
  baseSpotlightIntensity: number;
}

export const createArtwork = async (
  config: ArtGallerySceneConfig,
  artwork: PositionedArtwork,
  architecturalMaterials: ArchitecturalMaterialSet,
): Promise<CreatedArtwork> => {
  const { texture } = await loadTextureWithFallback({
    url: artwork.imageUrl,
    fallbackUrl: artwork.fallbackImageUrl,
  });

  const frame = createArtworkFrame(artwork, texture);
  const sideText = createArtworkSideText(artwork);
  const artworkWidth = artwork.width ?? GALLERY_DEFAULTS.artwork.width;
  const artworkHeight = artwork.height ?? GALLERY_DEFAULTS.artwork.height;
  const nicheSurfaceZ =
    -GALLERY_DEFAULTS.architecture.nicheDepth +
    GALLERY_DEFAULTS.architecture.nicheSurfaceClearance;
  frame.root.position.z = nicheSurfaceZ;

  const meshGroup = new Group();
  meshGroup.position.set(artwork.position[0], artwork.position[1], artwork.position[2]);
  meshGroup.rotation.set(artwork.rotation[0], artwork.rotation[1], artwork.rotation[2]);
  meshGroup.add(createArtworkNiche(artworkWidth, artworkHeight, architecturalMaterials), frame.root);
  if (sideText) {
    sideText.position.z = nicheSurfaceZ * 0.48;
    meshGroup.add(sideText);
  }

  const baseIntensity = artwork.spotlightIntensity ?? GALLERY_DEFAULTS.artwork.spotlightIntensity;
  const isContrastMode = config.lightingMode === "contrast";
  const isNightReadibilityEnhanced = isContrastMode && config.enhanceNightReadibility;
  const spotlightNightBoost = isNightReadibilityEnhanced ? 1.16 : 1;
  const softBacklightNightBoost = isNightReadibilityEnhanced ? 1.35 : 1;
  const spotlight = new SpotLight(
    GALLERY_TOKENS.artwork.spotlight,
    (isContrastMode ? baseIntensity * 1.18 : baseIntensity) * spotlightNightBoost,
    isContrastMode ? 28 : 22,
    Math.PI / 6,
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
  spotlightTarget.position.set(
    artwork.focusTarget[0],
    artwork.focusTarget[1],
    artwork.focusTarget[2],
  );
  spotlight.target = spotlightTarget;

  if (config.artworkBacklightEnabled && config.artworkBacklightIntensity > 0) {
    const rectBackLight = new RectAreaLight(
      GALLERY_TOKENS.lighting.gold,
      config.artworkBacklightIntensity * (isContrastMode ? 4.4 : 1.8),
      artworkWidth * 0.88,
      artworkHeight * 0.68,
    );
    rectBackLight.position.set(0, 0.02, nicheSurfaceZ - 0.09);
    rectBackLight.lookAt(0, 0.02, nicheSurfaceZ - 1.2);

    const backTarget = new Object3D();
    backTarget.position.set(0, 0.02, nicheSurfaceZ - 0.52);

    const backEdgeSpot = new SpotLight(
      GALLERY_TOKENS.lighting.gold,
      config.artworkBacklightIntensity * (isContrastMode ? 1.55 : 1),
      0,
      Math.PI / 5.6,
      0.3,
      1,
    );
    backEdgeSpot.position.set(0, 0.02, nicheSurfaceZ - 0.1);
    backEdgeSpot.target = backTarget;
    backEdgeSpot.castShadow = false;

    const backFill = new PointLight(
      GALLERY_TOKENS.lighting.gold,
      config.artworkBacklightIntensity * (isContrastMode ? 0.72 : 0.3) * softBacklightNightBoost,
      config.corridor.width * 0.62,
      1,
    );
    backFill.position.set(0, 0.02, nicheSurfaceZ - 0.22);

    meshGroup.add(backTarget, rectBackLight, backEdgeSpot, backFill);
  }

  if (config.artworkDirectionalKeyLightEnabled && config.artworkDirectionalKeyLightIntensity > 0) {
    const directionalTarget = new Object3D();
    directionalTarget.position.set(0, 0, 0);
    const directionalLight = new DirectionalLight(
      GALLERY_TOKENS.lighting.gold,
      config.artworkDirectionalKeyLightIntensity * (isContrastMode ? 1.1 : 0.92),
    );
    directionalLight.position.set(0, 0.2, 1.65);
    directionalLight.target = directionalTarget;
    directionalLight.castShadow = false;
    meshGroup.add(directionalTarget, directionalLight);
  }

  return {
    meshGroup,
    spotlight,
    spotlightTarget,
    baseSpotlightIntensity: baseIntensity,
  };
};

