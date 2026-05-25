import {
  Color,
  FogExp2,
  Group,
  Material,
  PerspectiveCamera,
  Scene,
  SpotLight,
  WebGLRenderer,
} from "three";
import { clamp } from "../utils/clamp";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import type { ArtGallerySceneConfig, DeepPartial, Vec3 } from "../types/galleryConfig";
import type { CameraKeyframe, EngineBuildArtifacts, GallerySceneGraph } from "../types/galleryRuntime";
import { createScene } from "./createScene";
import { createCamera } from "./createCamera";
import { createRenderer } from "./createRenderer";
import { disposeThree } from "./disposeThree";
import { createCorridor } from "../scene/createCorridor";
import { createLighting } from "../scene/createLighting";
import { createEnvironment } from "../scene/createEnvironment";
import { createSceneTitle } from "../scene/createSceneTitle";
import { createArtwork } from "../scene/createArtwork";
import { buildCameraKeyframes, calculateArtworkLayout } from "../journey/cameraKeyframes";
import { getCameraStateAtProgress } from "../journey/getCameraStateAtProgress";
import { textureCache } from "../utils/textureCache";
import { lerpVec3 } from "../utils/math";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";

interface ArtworkSpotlightEntry {
  artworkIndex: number;
  spotlight: SpotLight;
  baseIntensity: number;
}

const LOOP_FOG_BOOST = 0.08;

export class GalleryEngine {
  private readonly container: HTMLElement;
  private config: ArtGallerySceneConfig;

  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;

  private buildArtifacts: EngineBuildArtifacts | null = null;
  private sceneGraph: GallerySceneGraph | null = null;
  private keyframes: CameraKeyframe[] = [];
  private artworkSpotlights: ArtworkSpotlightEntry[] = [];
  private titleMaterial: Material | null = null;

  private progress = 0;
  private animationFrameId: number | null = null;
  private initialized = false;
  private smoothedLookAt: Vec3 | null = null;
  private loopWhiteMix = 0;
  private baseFogDensity = 0.025;
  private readonly whiteColor = new Color("#ffffff");
  private readonly baseBackgroundColor = new Color();
  private readonly baseFogColor = new Color();
  private readonly mixedBackgroundColor = new Color();
  private readonly mixedFogColor = new Color();

  constructor(container: HTMLElement, config: ArtGallerySceneConfig) {
    this.container = container;
    this.config = validateGalleryConfig(config).config;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.scene = createScene(this.config);
    this.camera = createCamera(this.config);
    this.renderer = createRenderer(this.config);
    this.container.appendChild(this.renderer.domElement);
    this.resetAtmosphereBase();

    await this.rebuildScene();
    this.resize();
    this.applyState();
    this.startRenderLoop();

    this.initialized = true;
  }

  setProgress(progress: number): void {
    this.progress = clamp(progress, 0, 1);
    this.applyState();
  }

  setLoopWhiteMix(whiteMix: number): void {
    this.loopWhiteMix = clamp(whiteMix, 0, 1);
    this.applyState();
  }

  async updateConfig(config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>): Promise<void> {
    const validation = validateGalleryConfig(config as DeepPartial<ArtGallerySceneConfig>);
    this.config = validation.config;
    if (!this.config.infiniteCorridor) {
      this.loopWhiteMix = 0;
    }

    if (!this.scene || !this.camera || !this.renderer) {
      return;
    }

    this.resetAtmosphereBase();
    await this.rebuildScene();
    this.applyState();
  }

  resize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.clearSceneGraph();

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    textureCache.clear();
    this.loopWhiteMix = 0;
    this.initialized = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }

  private startRenderLoop(): void {
    const render = (): void => {
      if (!this.scene || !this.camera || !this.renderer) {
        return;
      }

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  private applyState(): void {
    if (!this.camera || !this.scene || !this.renderer || this.keyframes.length === 0) {
      return;
    }

    const state = getCameraStateAtProgress(this.keyframes, this.progress);
    const desiredPosition = state.position;
    const desiredLookAt = state.lookAt;
    const titleOpacity = state.titleOpacity;
    const whiteMix = this.config.infiniteCorridor ? this.loopWhiteMix : 0;

    this.applyAtmosphere(whiteMix);

    const lookAtSmoothing = clamp(1 - this.config.artworkTurnSmoothness * 0.85, 0.03, 1);

    this.camera.position.set(desiredPosition[0], desiredPosition[1], desiredPosition[2]);
    this.smoothedLookAt = this.smoothedLookAt
      ? lerpVec3(this.smoothedLookAt, desiredLookAt, lookAtSmoothing)
      : desiredLookAt;
    this.camera.lookAt(this.smoothedLookAt[0], this.smoothedLookAt[1], this.smoothedLookAt[2]);

    if (this.titleMaterial && "opacity" in this.titleMaterial) {
      (this.titleMaterial as Material & { opacity: number }).opacity = titleOpacity;
    }

    this.artworkSpotlights.forEach((entry) => {
      const isActive = state.activeArtworkIndex === entry.artworkIndex;
      entry.spotlight.intensity = isActive ? entry.baseIntensity * 1.18 : entry.baseIntensity * 0.42;
    });
  }

  private async rebuildScene(): Promise<void> {
    if (!this.scene) {
      return;
    }

    this.clearSceneGraph();
    textureCache.clear();

    const layout = calculateArtworkLayout(this.config);
    const keyframes = buildCameraKeyframes(this.config, layout);

    const corridorRoot = createCorridor(this.config);
    const artworkRoot = new Group();
    artworkRoot.name = "artworks-root";

    const lightingRoot = createLighting(this.config);
    const environmentRoot = createEnvironment(this.config, this.scene.fog as FogExp2 | null);

    this.artworkSpotlights = [];

    for (const artwork of layout) {
      const created = await createArtwork(this.config, artwork);
      artworkRoot.add(created.meshGroup);
      lightingRoot.add(created.spotlight);
      lightingRoot.add(created.spotlightTarget);
      this.artworkSpotlights.push({
        artworkIndex: artwork.index,
        spotlight: created.spotlight,
        baseIntensity: created.baseSpotlightIntensity,
      });
    }

    const title = await createSceneTitle(this.config);
    const titleRoot = title.root;
    this.titleMaterial = title.material;

    this.scene.add(corridorRoot, environmentRoot, artworkRoot, lightingRoot, titleRoot);

    this.sceneGraph = {
      sceneNodes: {
        corridorRoot,
        artworkRoot,
        environmentRoot,
        lightingRoot,
        titleRoot,
      },
      spotlights: this.artworkSpotlights.map((entry) => entry.spotlight),
      titleMaterial: title.material,
    };

    this.keyframes = keyframes;
    this.smoothedLookAt = null;
    this.buildArtifacts = {
      config: this.config,
      layout,
      keyframes,
    };
  }

  private resetAtmosphereBase(): void {
    const backgroundHex = this.config.lightingMode === "contrast" ? "#070b12" : "#e6ebf3";
    const fogHex = this.config.lightingMode === "contrast" ? "#0a0f18" : "#e7ecf3";
    this.baseBackgroundColor.set(backgroundHex);
    this.baseFogColor.set(fogHex);
    this.baseFogDensity = LIGHTING_PRESETS[this.config.lightingMode].fogDensity;
  }

  private applyAtmosphere(whiteMix: number): void {
    if (!this.scene || !this.renderer) {
      return;
    }

    this.mixedBackgroundColor.copy(this.baseBackgroundColor).lerp(this.whiteColor, whiteMix);
    this.mixedFogColor.copy(this.baseFogColor).lerp(this.whiteColor, whiteMix);

    if (this.scene.background instanceof Color) {
      this.scene.background.copy(this.mixedBackgroundColor);
    } else {
      this.scene.background = this.mixedBackgroundColor.clone();
    }

    if (this.scene.fog instanceof FogExp2) {
      this.scene.fog.color.copy(this.mixedFogColor);
      this.scene.fog.density = this.baseFogDensity + whiteMix * LOOP_FOG_BOOST;
    }

    this.renderer.setClearColor(this.mixedBackgroundColor, 1);
  }

  private clearSceneGraph(): void {
    if (!this.scene || !this.sceneGraph) {
      return;
    }

    const nodes = this.sceneGraph.sceneNodes;
    const groups = [
      nodes.corridorRoot,
      nodes.artworkRoot,
      nodes.environmentRoot,
      nodes.lightingRoot,
      nodes.titleRoot,
    ];

    groups.forEach((group) => {
      this.scene?.remove(group);
      disposeThree(group);
    });

    this.sceneGraph = null;
    this.artworkSpotlights = [];
    this.titleMaterial = null;
  }
}

