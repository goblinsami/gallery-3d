import { Color, FogExp2, Scene } from "three";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export const createScene = (config: ArtGallerySceneConfig): Scene => {
  const scene = new Scene();
  const backgroundColor = config.lightingMode === "contrast" ? "#070b12" : "#e6ebf3";
  scene.background = new Color(backgroundColor);
  scene.fog = new FogExp2(backgroundColor, LIGHTING_PRESETS[config.lightingMode].fogDensity);
  return scene;
};

