import {
  AmbientLight,
  DirectionalLight,
  Group,
  HemisphereLight,
  Object3D,
  SpotLight,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import { getCeilingSpotLayout } from "./ceilingSpotLayout";

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

  if (config.lightingMode === "contrast") {
    const rimDirectional = new DirectionalLight(0x7d9fff, 0.16);
    rimDirectional.position.set(-4, 3.2, -8);
    root.add(rimDirectional);

    const ceilingBounce = new DirectionalLight(0xa8c0ff, 0.11);
    ceilingBounce.position.set(0, 8, -12);
    root.add(ceilingBounce);
  }

  if (config.ceilingSpotsEnabled && config.ceilingSpotsIntensity > 0) {
    const anchors = getCeilingSpotLayout(config);
    const sampledAnchors =
      config.lightingMode === "contrast" ? anchors.filter((_, index) => index % 2 === 0) : anchors;
    for (const anchor of sampledAnchors) {
      const floorTarget = new Object3D();
      floorTarget.position.set(anchor.x, -0.02, anchor.z);

      const spot = new SpotLight(
        config.ceilingSpotsColor,
        config.ceilingSpotsIntensity * (config.lightingMode === "contrast" ? 8.5 : 4.5),
        0,
        Math.PI / 4.2,
        0.35,
        1,
      );
      spot.position.set(anchor.x, config.corridor.height - 0.03, anchor.z);
      spot.target = floorTarget;
      spot.castShadow = false;
      root.add(floorTarget, spot);
    }
  }

  return root;
};

