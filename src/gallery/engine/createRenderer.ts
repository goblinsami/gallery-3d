import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";

export const createRenderer = (config: ArtGallerySceneConfig): WebGLRenderer => {
  RectAreaLightUniformsLib.init();
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.lightingMode === "contrast" ? 1.18 : 1;
  renderer.setClearColor(
    config.lightingMode === "contrast"
      ? GALLERY_TOKENS.scene.rendererClearContrast
      : GALLERY_TOKENS.scene.rendererClearDay,
    0,
  );
  return renderer;
};

