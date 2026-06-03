import {
  Color,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  Vector2,
} from "three";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { loadTextureWithFallback } from "../utils/textureLoader";

export interface ArchitecturalMaterialSet {
  wall: MeshStandardMaterial;
  floor: MeshStandardMaterial;
  ceiling: MeshStandardMaterial;
  nicheRecess: MeshStandardMaterial;
  ceilingGrid: MeshStandardMaterial;
  ceilingFixtureTrim: MeshStandardMaterial;
  ceilingFixtureCore: MeshStandardMaterial;
  ledStrip: MeshStandardMaterial;
}

const createRepeatedTexture = (
  source: Texture,
  repeat: readonly [number, number],
  colorSpace: typeof SRGBColorSpace | typeof NoColorSpace,
): Texture => {
  const texture = source.clone();
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  return texture;
};

const createStoneMaterial = (
  color: string,
  roughness: number,
  repeat: readonly [number, number],
  colorTexture: Texture,
  normalTexture: Texture,
  normalScale: number = GALLERY_DEFAULTS.architecture.stoneNormalScale,
): MeshStandardMaterial => {
  const stoneTint = new Color(color).lerp(
    new Color("#ffffff"),
    GALLERY_DEFAULTS.architecture.stoneTintMix,
  );

  return new MeshStandardMaterial({
    color: stoneTint,
    map: createRepeatedTexture(colorTexture, repeat, SRGBColorSpace),
    normalMap: createRepeatedTexture(normalTexture, repeat, NoColorSpace),
    normalScale: new Vector2(normalScale, normalScale),
    roughness,
    metalness: 0,
  });
};

const resolveDepthRepeatScale = (config: ArtGallerySceneConfig): number => {
  const itemDepth = (config.items?.length ?? config.artworks.length) * config.corridor.artworkSpacing;
  const corridorDepth = itemDepth + config.corridor.segmentLength * 4;
  return Math.max(1, corridorDepth / config.corridor.segmentLength);
};

export const createArchitecturalMaterials = async (
  config: ArtGallerySceneConfig,
): Promise<ArchitecturalMaterialSet> => {
  const [colorTextureResult, normalTextureResult] = await Promise.all([
    loadTextureWithFallback({ url: GALLERY_TOKENS.architecture.stoneColorTextureUrl }),
    loadTextureWithFallback({ url: GALLERY_TOKENS.architecture.stoneNormalTextureUrl }),
  ]);
  const ceilingFixtureIntensity =
    config.ceilingSpotsEnabled && config.ceilingSpotsIntensity > 0
      ? 0.72 + Math.min(config.ceilingSpotsIntensity, 4) * 0.4
      : 0.05;
  const depthRepeatScale = resolveDepthRepeatScale(config);

  return {
    wall: createStoneMaterial(
      config.corridor.wallColor,
      GALLERY_DEFAULTS.architecture.wallRoughness,
      [
        GALLERY_DEFAULTS.architecture.wallTextureRepeatPerSegment[0] * depthRepeatScale,
        GALLERY_DEFAULTS.architecture.wallTextureRepeatPerSegment[1],
      ],
      colorTextureResult.texture,
      normalTextureResult.texture,
    ),
    floor: createStoneMaterial(
      config.corridor.wallColor,
      GALLERY_DEFAULTS.architecture.floorRoughness,
      [
        GALLERY_DEFAULTS.architecture.floorTextureRepeatPerSegment[0],
        GALLERY_DEFAULTS.architecture.floorTextureRepeatPerSegment[1] * depthRepeatScale,
      ],
      colorTextureResult.texture,
      normalTextureResult.texture,
    ),
    ceiling: createStoneMaterial(
      config.corridor.wallColor,
      GALLERY_DEFAULTS.architecture.wallRoughness,
      [
        GALLERY_DEFAULTS.architecture.ceilingTextureRepeatPerSegment[0],
        GALLERY_DEFAULTS.architecture.ceilingTextureRepeatPerSegment[1] * depthRepeatScale,
      ],
      colorTextureResult.texture,
      normalTextureResult.texture,
      GALLERY_DEFAULTS.architecture.ceilingNormalScale,
    ),
    nicheRecess: new MeshStandardMaterial({
      color: GALLERY_TOKENS.architecture.nicheRecess,
      roughness: 0.94,
      metalness: 0,
    }),
    ceilingGrid: new MeshStandardMaterial({
      color: GALLERY_TOKENS.architecture.ceilingGrid,
      roughness: 0.9,
      metalness: 0,
    }),
    ceilingFixtureTrim: new MeshStandardMaterial({
      color: GALLERY_TOKENS.architecture.ceilingFixtureTrim,
      roughness: 0.72,
      metalness: 0.04,
    }),
    ceilingFixtureCore: new MeshStandardMaterial({
      color: GALLERY_TOKENS.architecture.ceilingFixtureCore,
      emissive: GALLERY_TOKENS.architecture.ceilingFixtureCore,
      emissiveIntensity: ceilingFixtureIntensity,
      roughness: 0.34,
      metalness: 0,
    }),
    ledStrip: new MeshStandardMaterial({
      color: GALLERY_TOKENS.architecture.ledStrip,
      emissive: GALLERY_TOKENS.architecture.ledStrip,
      emissiveIntensity: 1.35,
      roughness: 0.3,
      metalness: 0,
    }),
  };
};
