import { PerspectiveCamera } from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export const createCamera = (config: ArtGallerySceneConfig): PerspectiveCamera => {
  const camera = new PerspectiveCamera(config.camera.fov, 1, config.camera.near, config.camera.far);
  camera.position.set(
    config.camera.startPosition[0],
    config.camera.startPosition[1],
    config.camera.startPosition[2],
  );
  camera.lookAt(0, config.camera.height, 0);
  return camera;
};

