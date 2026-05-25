import { Color, FogExp2, Scene } from "three";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export const createScene = (config: ArtGallerySceneConfig): Scene => {
  const scene = new Scene();
  const backgroundColor = config.sceneBackgroundColor;
  const fogColor = config.sceneFogColor;
  scene.background = new Color(backgroundColor);
  scene.fog = new FogExp2(fogColor, LIGHTING_PRESETS[config.lightingMode].fogDensity);
  return scene;
};

