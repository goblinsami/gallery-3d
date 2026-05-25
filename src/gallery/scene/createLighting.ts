import { AmbientLight, DirectionalLight, Group, HemisphereLight } from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";

export const createLighting = (config: ArtGallerySceneConfig): Group => {
  const root = new Group();
  root.name = "lighting-root";

  const preset = LIGHTING_PRESETS[config.lightingMode];

  const ambientLight = new AmbientLight(0xffffff, preset.ambientIntensity);
  root.add(ambientLight);

  const hemisphere = new HemisphereLight(
    config.lightingMode === "contrast" ? 0x31405f : 0xffffff,
    config.lightingMode === "contrast" ? 0x111216 : 0x8893a8,
    config.lightingMode === "contrast" ? 0.22 : 0.45,
  );
  root.add(hemisphere);

  const directionalLight = new DirectionalLight(0xffffff, preset.directionalIntensity);
  directionalLight.position.set(
    preset.directionalPosition[0],
    preset.directionalPosition[1],
    preset.directionalPosition[2],
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = preset.shadowMapSize;
  directionalLight.shadow.mapSize.height = preset.shadowMapSize;
  directionalLight.shadow.radius = preset.shadowSoftness;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 120;
  root.add(directionalLight);

  return root;
};

