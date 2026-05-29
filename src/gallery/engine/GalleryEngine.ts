import {
  Color,
  FogExp2,
  Group,
  Material,
  PerspectiveCamera,
  Scene,
  SpotLight,
  Vector3,
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
import { createStationalCard } from "../scene/createStationalCard";
import { buildCameraKeyframes, calculateArtworkLayout } from "../journey/cameraKeyframes";
import { getCameraStateAtProgress } from "../journey/getCameraStateAtProgress";
import { textureCache } from "../utils/textureCache";
import { lerpVec3 } from "../utils/math";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { isStationalCard } from "../utils/galleryItems";

interface FocusSpotlightEntry {
  itemIndex: number;
  spotlight: SpotLight;
  baseIntensity: number;
  focusBoost: number;
  idleBoost: number;
}

interface FocusSurfaceEntry {
  itemIndex: number;
  root: Group;
  baseScale: number;
  focusScale: number;
  damping: number;
}

interface RenderViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  aspect: number;
}

const LOOP_FOG_BOOST = 0.08;
const MIN_AUTO_LANDSCAPE_ASPECT = 1.35;
const MAX_AUTO_ASPECT = 2.4;
const PORTRAIT_MAX_AUTO_ASPECT = 4 / 3;
const MIN_EXPLICIT_ASPECT = 9 / 20;
const MAX_EXPLICIT_ASPECT = 2.6;
const DEFAULT_MOBILE_BREAKPOINT = 820;
const DEFAULT_JOURNEY_ASPECT = 16 / 9;
const JOURNEY_ASPECT_EPSILON = 0.01;

export class GalleryEngine {
  private readonly container: HTMLElement;
  private config: ArtGallerySceneConfig;

  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;

  private buildArtifacts: EngineBuildArtifacts | null = null;
  private sceneGraph: GallerySceneGraph | null = null;
  private keyframes: CameraKeyframe[] = [];
  private itemSpotlights: FocusSpotlightEntry[] = [];
  private focusSurfaces: FocusSurfaceEntry[] = [];
  private titleMaterial: Material | null = null;

  private progress = 0;
  private animationFrameId: number | null = null;
  private initialized = false;
  private smoothedLookAt: Vec3 | null = null;
  private loopWhiteMix = 0;
  private baseFogDensity = 0.025;
  private readonly whiteColor = new Color(GALLERY_TOKENS.scene.white);
  private readonly baseBackgroundColor = new Color();
  private readonly baseFogColor = new Color();
  private readonly mixedBackgroundColor = new Color();
  private readonly mixedFogColor = new Color();
  private readonly projectedItemPoint = new Vector3();
  private lastContainerWidth = 0;
  private lastContainerHeight = 0;
  private renderViewport: RenderViewport | null = null;
  private journeyViewportAspect = DEFAULT_JOURNEY_ASPECT;
  private activeItemIndex: number | null = null;

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

  getActiveArtworkIndex(): number | null {
    return this.activeItemIndex;
  }

  getActiveItemIndex(): number | null {
    return this.activeItemIndex;
  }

  getClosestItemIndexFromClientPoint(clientX: number, clientY: number): number | null {
    if (!this.camera || !this.buildArtifacts || this.buildArtifacts.layout.length === 0) {
      return null;
    }

    const rect = this.container.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const fallbackWidth = Math.max(1, Math.round(rect.width));
    const fallbackHeight = Math.max(1, Math.round(rect.height));
    const viewport = this.renderViewport ?? {
      x: 0,
      y: 0,
      width: fallbackWidth,
      height: fallbackHeight,
      aspect: fallbackWidth / fallbackHeight,
    };

    if (
      localX < viewport.x ||
      localX > viewport.x + viewport.width ||
      localY < viewport.y ||
      localY > viewport.y + viewport.height
    ) {
      return null;
    }

    const maxDistancePx = clamp(viewport.width * 0.22, 72, 240);
    let closestIndex: number | null = null;
    let closestDistanceSq = maxDistancePx * maxDistancePx;

    for (const item of this.buildArtifacts.layout) {
      const [x, y, z] = item.focusTarget;
      const projected = this.projectedItemPoint
        .set(x, y, z)
        .project(this.camera);

      if (
        !Number.isFinite(projected.x) ||
        !Number.isFinite(projected.y) ||
        !Number.isFinite(projected.z) ||
        projected.z < -1 ||
        projected.z > 1
      ) {
        continue;
      }

      const screenX = viewport.x + ((projected.x + 1) * 0.5) * viewport.width;
      const screenY = viewport.y + ((1 - projected.y) * 0.5) * viewport.height;
      const dx = localX - screenX;
      const dy = localY - screenY;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq <= closestDistanceSq) {
        closestDistanceSq = distanceSq;
        closestIndex = item.index;
      }
    }

    return closestIndex;
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

  resize(force = false): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    const containerWidth = Math.max(1, this.container.clientWidth);
    const containerHeight = Math.max(1, this.container.clientHeight);
    const nextViewport = this.calculateRenderViewport(containerWidth, containerHeight);

    if (
      !force &&
      containerWidth === this.lastContainerWidth &&
      containerHeight === this.lastContainerHeight &&
      this.renderViewport &&
      nextViewport.x === this.renderViewport.x &&
      nextViewport.y === this.renderViewport.y &&
      nextViewport.width === this.renderViewport.width &&
      nextViewport.height === this.renderViewport.height
    ) {
      return;
    }

    this.lastContainerWidth = containerWidth;
    this.lastContainerHeight = containerHeight;
    this.renderViewport = nextViewport;

    this.camera.aspect = nextViewport.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(containerWidth, containerHeight, false);
    this.renderer.setViewport(
      nextViewport.x,
      nextViewport.y,
      nextViewport.width,
      nextViewport.height,
    );
    this.renderer.setScissor(
      nextViewport.x,
      nextViewport.y,
      nextViewport.width,
      nextViewport.height,
    );
    this.renderer.setScissorTest(true);
    this.updateJourneyViewportAspect(nextViewport.aspect, force);
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
    this.activeItemIndex = null;
    this.renderViewport = null;
    this.journeyViewportAspect = DEFAULT_JOURNEY_ASPECT;
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

      this.resize();
      this.renderer.setScissorTest(false);
      this.renderer.clear(true, true, true);

      if (this.renderViewport) {
        this.renderer.setViewport(
          this.renderViewport.x,
          this.renderViewport.y,
          this.renderViewport.width,
          this.renderViewport.height,
        );
        this.renderer.setScissor(
          this.renderViewport.x,
          this.renderViewport.y,
          this.renderViewport.width,
          this.renderViewport.height,
        );
        this.renderer.setScissorTest(true);
      }

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  private getPreferredAspectRatio(containerWidth: number, containerHeight: number): number {
    const containerAspect = containerWidth / containerHeight;
    const mobileBreakpoint = clamp(
      this.config.camera.mobileBreakpointWidth ?? DEFAULT_MOBILE_BREAKPOINT,
      320,
      1600,
    );
    const isMobileViewport = containerWidth <= mobileBreakpoint;

    if (isMobileViewport) {
      const mobileAspect = this.config.camera.mobileTargetAspectRatio;
      if (typeof mobileAspect === "number" && Number.isFinite(mobileAspect)) {
        return clamp(mobileAspect, MIN_EXPLICIT_ASPECT, MAX_EXPLICIT_ASPECT);
      }
    }

    const explicitAspect = this.config.camera.targetAspectRatio;
    if (typeof explicitAspect === "number" && Number.isFinite(explicitAspect)) {
      return clamp(explicitAspect, MIN_EXPLICIT_ASPECT, MAX_EXPLICIT_ASPECT);
    }

    const corridor = this.config.corridor;
    const corridorAspect = clamp(
      corridor.width / Math.max(corridor.height, 0.001),
      MIN_AUTO_LANDSCAPE_ASPECT,
      MAX_AUTO_ASPECT,
    );

    if (containerAspect < 1) {
      return Math.min(corridorAspect, PORTRAIT_MAX_AUTO_ASPECT);
    }

    return corridorAspect;
  }

  private calculateRenderViewport(
    containerWidth: number,
    containerHeight: number,
  ): RenderViewport {
    const containerAspect = containerWidth / containerHeight;
    const targetAspect = this.getPreferredAspectRatio(containerWidth, containerHeight);

    let viewportWidth = containerWidth;
    let viewportHeight = containerHeight;

    if (containerAspect > targetAspect) {
      viewportWidth = Math.round(containerHeight * targetAspect);
    } else {
      viewportHeight = Math.round(containerWidth / targetAspect);
    }

    viewportWidth = Math.max(1, Math.min(containerWidth, viewportWidth));
    viewportHeight = Math.max(1, Math.min(containerHeight, viewportHeight));

    return {
      x: Math.floor((containerWidth - viewportWidth) / 2),
      y: Math.floor((containerHeight - viewportHeight) / 2),
      width: viewportWidth,
      height: viewportHeight,
      aspect: viewportWidth / viewportHeight,
    };
  }

  private updateJourneyViewportAspect(nextAspect: number, force = false): void {
    if (!this.buildArtifacts) {
      this.journeyViewportAspect = nextAspect;
      return;
    }

    if (
      !force &&
      Math.abs(nextAspect - this.journeyViewportAspect) < JOURNEY_ASPECT_EPSILON
    ) {
      return;
    }

    this.journeyViewportAspect = nextAspect;
    const layout = calculateArtworkLayout(this.config, {
      viewportAspect: this.journeyViewportAspect,
    });
    const keyframes = buildCameraKeyframes(this.config, layout);
    this.keyframes = keyframes;
    this.buildArtifacts = {
      config: this.config,
      layout,
      keyframes,
    };
    this.smoothedLookAt = null;
    this.applyState();
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
    const activeItemIndex = state.activeItemIndex ?? state.activeArtworkIndex;
    this.activeItemIndex = activeItemIndex;

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

    this.itemSpotlights.forEach((entry) => {
      const isActive = activeItemIndex === entry.itemIndex;
      entry.spotlight.intensity = isActive
        ? entry.baseIntensity * entry.focusBoost
        : entry.baseIntensity * entry.idleBoost;
    });

    this.focusSurfaces.forEach((entry) => {
      const isActive = activeItemIndex === entry.itemIndex;
      const targetScale = isActive ? entry.focusScale : entry.baseScale;
      const currentScale = entry.root.scale.x;
      const nextScale = currentScale + (targetScale - currentScale) * entry.damping;
      entry.root.scale.set(nextScale, nextScale, nextScale);
    });
  }

  private async rebuildScene(): Promise<void> {
    if (!this.scene) {
      return;
    }

    this.clearSceneGraph();
    textureCache.clear();

    const layout = calculateArtworkLayout(this.config, {
      viewportAspect: this.journeyViewportAspect,
    });
    const keyframes = buildCameraKeyframes(this.config, layout);

    const corridorRoot = createCorridor(this.config);
    const artworkRoot = new Group();
    artworkRoot.name = "gallery-items-root";

    const lightingRoot = createLighting(this.config);
    const environmentRoot = createEnvironment(this.config, this.scene.fog as FogExp2 | null);

    this.itemSpotlights = [];
    this.focusSurfaces = [];

    for (const item of layout) {
      if (isStationalCard(item)) {
        const created = await createStationalCard(item, this.config.lightingMode);
        artworkRoot.add(created.meshGroup);
        lightingRoot.add(created.spotlight);
        lightingRoot.add(created.spotlightTarget);
        this.itemSpotlights.push({
          itemIndex: item.index,
          spotlight: created.spotlight,
          baseIntensity: created.baseSpotlightIntensity,
          focusBoost: 1.24,
          idleBoost: 0.54,
        });
        this.focusSurfaces.push({
          itemIndex: item.index,
          root: created.meshGroup,
          baseScale: 1,
          focusScale: 1.035,
          damping: 0.16,
        });
        continue;
      }

      const created = await createArtwork(this.config, item);
      artworkRoot.add(created.meshGroup);
      lightingRoot.add(created.spotlight);
      lightingRoot.add(created.spotlightTarget);
      this.itemSpotlights.push({
        itemIndex: item.index,
        spotlight: created.spotlight,
        baseIntensity: created.baseSpotlightIntensity,
        focusBoost: 1.18,
        idleBoost: 0.42,
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
      spotlights: this.itemSpotlights.map((entry) => entry.spotlight),
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
    this.baseBackgroundColor.set(this.config.sceneBackgroundColor);
    this.baseFogColor.set(this.config.sceneFogColor);
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
    this.itemSpotlights = [];
    this.focusSurfaces = [];
    this.titleMaterial = null;
  }
}

