import {
  AmbientLight,
  DirectionalLight,
  Group,
  HemisphereLight,
  Object3D,
  PointLight,
  RectAreaLight,
  SpotLight,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { getCeilingGridFadeOpacity, getCeilingGridLayout } from "./ceilingSpotLayout";
import { getArchitecturalLedRakeLightLayout } from "./architecturalLedLayout";

const sampleAnchorsEvenly = <T>(anchors: T[], maxCount: number): T[] => {
  if (anchors.length <= maxCount) {
    return anchors;
  }

  const step = anchors.length / maxCount;
  return Array.from({ length: maxCount }, (_, index) => anchors[Math.floor(index * step)]);
};

export const createLighting = (config: ArtGallerySceneConfig): Group => {
  const root = new Group();
  root.name = "lighting-root";

  const preset = LIGHTING_PRESETS[config.lightingMode];

  const ambientLight = new AmbientLight(GALLERY_TOKENS.lighting.ambient, preset.ambientIntensity);
  root.add(ambientLight);

  const hemisphere = new HemisphereLight(
    config.lightingMode === "contrast"
      ? GALLERY_TOKENS.lighting.hemisphereContrastSky
      : GALLERY_TOKENS.lighting.hemisphereDaySky,
    config.lightingMode === "contrast"
      ? GALLERY_TOKENS.lighting.hemisphereContrastGround
      : GALLERY_TOKENS.lighting.hemisphereDayGround,
    config.lightingMode === "contrast" ? 0.22 : 0.45,
  );
  root.add(hemisphere);

  const directionalLight = new DirectionalLight(GALLERY_TOKENS.lighting.directional, preset.directionalIntensity);
  directionalLight.position.set(
    preset.directionalPosition[0],
    preset.directionalPosition[1],
    preset.directionalPosition[2],
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = preset.shadowMapSize;
  directionalLight.shadow.mapSize.height = preset.shadowMapSize;
  directionalLight.shadow.radius = preset.shadowSoftness;
  directionalLight.shadow.bias = config.lightingMode === "contrast" ? -0.00024 : -0.00012;
  directionalLight.shadow.normalBias = config.lightingMode === "contrast" ? 0.02 : 0.01;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 120;
  root.add(directionalLight);

  if (config.lightingMode === "contrast") {
    const rimDirectional = new DirectionalLight(GALLERY_TOKENS.lighting.rim, 0.16);
    rimDirectional.position.set(-4, 3.2, -8);
    root.add(rimDirectional);

    const ceilingBounce = new DirectionalLight(GALLERY_TOKENS.lighting.bounce, 0.11);
    ceilingBounce.position.set(0, 8, -12);
    root.add(ceilingBounce);
  }

  const ceilingGrid = getCeilingGridLayout(config);
  const ceilingAnchors = ceilingGrid.anchors;
  if (config.ceilingLightIntensity > 0) {
    const ceilingFill = new RectAreaLight(
      GALLERY_TOKENS.lighting.gold,
      config.ceilingLightIntensity * (config.lightingMode === "contrast" ? 1 : 0.65),
      config.lightGridWidth * GALLERY_DEFAULTS.architecture.ceilingFillLightWidthScale,
      ceilingGrid.depthLength * GALLERY_DEFAULTS.architecture.ceilingFillLightDepthScale,
    );
    ceilingFill.position.set(
      0,
      config.corridor.height - GALLERY_DEFAULTS.architecture.ceilingFillLightInset,
      ceilingGrid.depthCenter,
    );
    ceilingFill.lookAt(0, config.corridor.height, ceilingGrid.depthCenter);
    root.add(ceilingFill);
  }

  if (config.ceilingSpotsEnabled && config.ceilingSpotsIntensity > 0) {
    const sampledAnchors = sampleAnchorsEvenly(
      ceilingAnchors,
      GALLERY_DEFAULTS.architecture.maxCeilingSpotLights,
    );
    for (const anchor of sampledAnchors) {
      const fadeOpacity = getCeilingGridFadeOpacity(ceilingGrid, anchor.z);
      if (fadeOpacity <= GALLERY_DEFAULTS.architecture.ceilingGridFadeMinOpacity) {
        continue;
      }

      const floorTarget = new Object3D();
      floorTarget.position.set(anchor.x, -0.02, anchor.z);

      const spot = new SpotLight(
        GALLERY_TOKENS.lighting.gold,
        config.ceilingSpotsIntensity * (config.lightingMode === "contrast" ? 1.08 : 1) * fadeOpacity,
        config.corridor.height * 1.9,
        Math.PI / 3.2,
        0.5,
        1,
      );
      spot.position.set(anchor.x, config.corridor.height - 0.03, anchor.z);
      spot.target = floorTarget;
      spot.castShadow = false;
      root.add(floorTarget, spot);
    }
  }

  for (const anchor of getArchitecturalLedRakeLightLayout(config)) {
    const fadeOpacity = getCeilingGridFadeOpacity(ceilingGrid, anchor.z);
    if (fadeOpacity <= GALLERY_DEFAULTS.architecture.ceilingGridFadeMinOpacity) {
      continue;
    }

    const ledRakeLight = new PointLight(
      GALLERY_TOKENS.lighting.gold,
      GALLERY_DEFAULTS.architecture.ledRakeLightIntensity *
        anchor.intensityScale *
        fadeOpacity,
      GALLERY_DEFAULTS.architecture.ledRakeLightDistance,
      2,
    );
    ledRakeLight.position.set(anchor.x, anchor.y, anchor.z);
    ledRakeLight.castShadow = false;
    root.add(ledRakeLight);
  }

  return root;
};

