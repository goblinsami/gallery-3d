import {
  BoxGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  type FogExp2,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { getCeilingSpotLayout } from "./ceilingSpotLayout";

export const createEnvironment = (
  config: ArtGallerySceneConfig,
  fog: FogExp2 | null,
): Group => {
  const root = new Group();
  root.name = "environment-root";

  if (fog) {
    fog.color = new Color(config.sceneFogColor);
    fog.density = LIGHTING_PRESETS[config.lightingMode].fogDensity;
  }

  const lightStripMaterial = new MeshStandardMaterial({
    color:
      config.lightingMode === "contrast"
        ? GALLERY_TOKENS.environment.stripContrastColor
        : GALLERY_TOKENS.environment.stripDayColor,
    emissive:
      config.lightingMode === "contrast"
        ? GALLERY_TOKENS.environment.stripContrastEmissive
        : GALLERY_TOKENS.environment.stripDayEmissive,
    emissiveIntensity: config.lightingMode === "contrast" ? 0.8 : 0.45,
    roughness: 0.25,
    metalness: 0.12,
  });

  const stripGeometry = new BoxGeometry(config.corridor.width * 0.4, 0.03, 0.7);
  const stripCount = config.infiniteCorridor ? 28 : Math.max(10, config.artworks.length * 4);

  if (config.ceilingSpotsEnabled && config.ceilingSpotsIntensity > 0) {
    const anchors = getCeilingSpotLayout(config);
    const outerFixtureMaterial = new MeshStandardMaterial({
      color: config.ceilingSpotsColor,
      emissive: config.ceilingSpotsColor,
      emissiveIntensity: 0.55 + config.ceilingSpotsIntensity * 0.35,
      roughness: 0.25,
      metalness: 0.12,
      side: DoubleSide,
    });
    const innerFixtureMaterial = new MeshStandardMaterial({
      color: GALLERY_TOKENS.environment.ceilingInnerFixture,
      emissive: config.ceilingSpotsColor,
      emissiveIntensity: 0.85 + config.ceilingSpotsIntensity * 0.45,
      roughness: 0.18,
      metalness: 0.1,
      side: DoubleSide,
    });
    const outerFixtureGeometry = new CircleGeometry(config.corridor.width * 0.072, 26);
    const innerFixtureGeometry = new CircleGeometry(config.corridor.width * 0.042, 20);

    for (const anchor of anchors) {
      const outerFixture = new Mesh(outerFixtureGeometry, outerFixtureMaterial);
      outerFixture.position.set(anchor.x, config.corridor.height - 0.028, anchor.z);
      outerFixture.rotation.x = Math.PI / 2;

      const innerFixture = new Mesh(innerFixtureGeometry, innerFixtureMaterial);
      innerFixture.position.set(anchor.x, config.corridor.height - 0.026, anchor.z);
      innerFixture.rotation.x = Math.PI / 2;

      root.add(outerFixture, innerFixture);
    }
  } else {
    for (let i = 0; i < stripCount; i += 1) {
      const strip = new Mesh(stripGeometry, lightStripMaterial);
      strip.position.set(0, config.corridor.height - 0.15, -2 - i * (config.corridor.segmentLength * 0.55));
      root.add(strip);
    }
  }

  return root;
};

