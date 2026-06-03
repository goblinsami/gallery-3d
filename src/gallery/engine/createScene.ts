import { Color, Fog, Scene } from "three";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export const createScene = (config: ArtGallerySceneConfig): Scene => {
  const scene = new Scene();
  const backgroundColor = config.sceneBackgroundColor;
  const fogColor = config.sceneFogColor;
  scene.background = new Color(backgroundColor);
  const preset = LIGHTING_PRESETS[config.lightingMode];
  scene.fog = new Fog(fogColor, preset.fogNear, preset.fogFar);
  return scene;
};

