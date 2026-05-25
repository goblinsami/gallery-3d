import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  type FogExp2,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";

export const createEnvironment = (
  config: ArtGallerySceneConfig,
  fog: FogExp2 | null,
): Group => {
  const root = new Group();
  root.name = "environment-root";

  if (fog) {
    fog.color = new Color(config.lightingMode === "contrast" ? "#0a0f18" : "#e7ecf3");
    fog.density = LIGHTING_PRESETS[config.lightingMode].fogDensity;
  }

  const lightStripMaterial = new MeshStandardMaterial({
    color: config.lightingMode === "contrast" ? "#f0f2f7" : "#d5dde8",
    emissive: config.lightingMode === "contrast" ? "#56637d" : "#94a5bd",
    emissiveIntensity: config.lightingMode === "contrast" ? 0.8 : 0.45,
    roughness: 0.25,
    metalness: 0.12,
  });

  const stripGeometry = new BoxGeometry(config.corridor.width * 0.4, 0.03, 0.7);
  const stripCount = config.infiniteCorridor ? 28 : Math.max(10, config.artworks.length * 4);

  for (let i = 0; i < stripCount; i += 1) {
    const strip = new Mesh(stripGeometry, lightStripMaterial);
    strip.position.set(0, config.corridor.height - 0.15, -2 - i * (config.corridor.segmentLength * 0.55));
    root.add(strip);
  }

  return root;
};

