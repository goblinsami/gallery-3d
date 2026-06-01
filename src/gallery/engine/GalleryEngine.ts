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
import type { PositionedGalleryItem } from "../types/galleryRuntime";

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
type BottomSheetState = "collapsed" | "half" | "full";
type DesktopSheetSide = "left" | "right";
type DesktopSheetWidth = 0.25 | 0.5;

const LOOP_FOG_BOOST = 0.08;
const MIN_AUTO_LANDSCAPE_ASPECT = 1.35;
const MAX_AUTO_ASPECT = 2.4;
const PORTRAIT_MAX_AUTO_ASPECT = 4 / 3;
const MIN_EXPLICIT_ASPECT = 9 / 20;
const MAX_EXPLICIT_ASPECT = 2.6;
const DEFAULT_MOBILE_BREAKPOINT = 820;
const DEFAULT_JOURNEY_ASPECT = 16 / 9;
const JOURNEY_ASPECT_EPSILON = 0.01;
const OVERLAY_FOCUS_BLEND_SPEED = 0.18;
const OVERLAY_FOCUS_MIX_EPSILON = 0.001;
const STATION_OVERLAY_CENTER_BLEND_MOBILE = 0.14;
const STATION_OVERLAY_CENTER_BLEND_DESKTOP = 0.1;
const STATION_OVERLAY_DISTANCE_BOOST_MOBILE = 0.34;
const STATION_OVERLAY_DISTANCE_BOOST_DESKTOP = 0.24;
const STATION_OVERLAY_FOCUS_PULL = 0.02;
const JOURNEY_PROGRESS_EPSILON = 0.000001;
const LOOP_WHITE_MIX_EPSILON = 0.000001;

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
  private effectiveRenderViewport: RenderViewport | null = null;
  private journeyViewportAspect = DEFAULT_JOURNEY_ASPECT;
  private activeItemIndex: number | null = null;
  private overlayFocusEnabled = false;
  private overlayFocusItemIndex: number | null = null;
  private overlayFocusMobile = false;
  private overlayFocusSheetState: BottomSheetState = "collapsed";
  private overlayFocusDesktopSide: DesktopSheetSide = "left";
  private overlayFocusDesktopWidth: DesktopSheetWidth = 0.5;
  private overlayFocusMix = 0;

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
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.maxWidth = "100%";
    this.renderer.domElement.style.maxHeight = "100%";
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.inset = "0";
    this.renderer.domElement.style.zIndex = "1";
    this.renderer.domElement.style.touchAction = "none";
      "radial-gradient(ellipse 120% 120% at 50% 50%, #000 72%, rgba(0, 0, 0, 0) 100%)";
    this.container.appendChild(this.renderer.domElement);
    this.resetAtmosphereBase();

    await this.rebuildScene();
    this.resize();
    this.applyState();
    this.startRenderLoop();

    this.initialized = true;
  }

  setProgress(progress: number): void {
    this.updateJourneyState(progress, this.loopWhiteMix);
  }

  setLoopWhiteMix(whiteMix: number): void {
    this.updateJourneyState(this.progress, whiteMix);
  }

  setJourneyState(progress: number, whiteMix: number): void {
    this.updateJourneyState(progress, whiteMix);
  }

  getActiveArtworkIndex(): number | null {
    return this.activeItemIndex;
  }

  getActiveItemIndex(): number | null {
    return this.activeItemIndex;
  }

  setBottomSheetFocus(
    itemIndex: number | null,
    enabled: boolean,
    mobile: boolean,
    sheetState: BottomSheetState,
    desktopSide: DesktopSheetSide,
    desktopWidth: DesktopSheetWidth,
  ): void {
    this.overlayFocusEnabled = enabled && itemIndex !== null;
    this.overlayFocusItemIndex = itemIndex;
    this.overlayFocusMobile = mobile;
    this.overlayFocusSheetState = sheetState;
    this.overlayFocusDesktopSide = desktopSide;
    this.overlayFocusDesktopWidth = desktopWidth;
    this.overlayFocusMix = this.overlayFocusEnabled ? 1 : 0;
    this.resize(true);
    this.applyState();
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
    const focusViewport = this.resolveEffectiveRenderViewport(viewport);

    if (
      localX < focusViewport.x ||
      localX > focusViewport.x + focusViewport.width ||
      localY < focusViewport.y ||
      localY > focusViewport.y + focusViewport.height
    ) {
      return null;
    }

    const maxDistancePx = clamp(focusViewport.width * 0.2, 64, 180);
    let closestIndex: number | null = null;
    let closestScore = Number.POSITIVE_INFINITY;

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

      const screenX = focusViewport.x + ((projected.x + 1) * 0.5) * focusViewport.width;
      const screenY = focusViewport.y + ((1 - projected.y) * 0.5) * focusViewport.height;
      const dx = localX - screenX;
      const dy = localY - screenY;
      const distanceSq = dx * dx + dy * dy;
      const isStation = isStationalCard(item);
      const captureRadiusPx = isStation ? maxDistancePx * 1.12 : maxDistancePx;
      const captureRadiusSq = captureRadiusPx * captureRadiusPx;
      if (distanceSq > captureRadiusSq) {
        continue;
      }

      let score = distanceSq;
      score *= 1 + Math.max(0, projected.z) * 0.35;
      if (isStation) {
        const cameraZ = this.camera.position.z;
        const nearDepth = Math.abs(cameraZ - item.position[2]);
        const depthThreshold = Math.max(2.4, (item.depth ?? 0.2) * 10);
        if (nearDepth <= depthThreshold) {
          score *= 0.8;
        }
      }

      if (score < closestScore) {
        closestScore = score;
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
    const effectiveViewport = this.resolveEffectiveRenderViewport(nextViewport);
    this.effectiveRenderViewport = effectiveViewport;

    this.camera.aspect = effectiveViewport.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(containerWidth, containerHeight, false);
    this.renderer.setViewport(
      effectiveViewport.x,
      effectiveViewport.y,
      effectiveViewport.width,
      effectiveViewport.height,
    );
    this.renderer.setScissor(
      effectiveViewport.x,
      effectiveViewport.y,
      effectiveViewport.width,
      effectiveViewport.height,
    );
    this.renderer.setScissorTest(true);
    this.container.style.setProperty("--gallery-vp-left", `${effectiveViewport.x}px`);
    this.container.style.setProperty("--gallery-vp-top", `${effectiveViewport.y}px`);
    this.container.style.setProperty(
      "--gallery-vp-right",
      `${Math.max(0, containerWidth - (effectiveViewport.x + effectiveViewport.width))}px`,
    );
    this.container.style.setProperty(
      "--gallery-vp-bottom",
      `${Math.max(0, containerHeight - (effectiveViewport.y + effectiveViewport.height))}px`,
    );
    this.updateJourneyViewportAspect(effectiveViewport.aspect, force);
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
    this.overlayFocusEnabled = false;
    this.overlayFocusItemIndex = null;
    this.overlayFocusSheetState = "collapsed";
    this.overlayFocusDesktopSide = "left";
    this.overlayFocusDesktopWidth = 0.5;
    this.overlayFocusMix = 0;
    this.renderViewport = null;
    this.effectiveRenderViewport = null;
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

      const viewport = this.effectiveRenderViewport ?? this.renderViewport;
      if (viewport) {
        this.renderer.setViewport(
          viewport.x,
          viewport.y,
          viewport.width,
          viewport.height,
        );
        this.renderer.setScissor(
          viewport.x,
          viewport.y,
          viewport.width,
          viewport.height,
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
    let desiredPosition = state.position;
    let desiredLookAt = state.lookAt;
    const titleOpacity = state.titleOpacity;
    const whiteMix = this.config.infiniteCorridor ? this.loopWhiteMix : 0;
    const activeItemIndex = state.activeItemIndex ?? state.activeArtworkIndex;
    this.activeItemIndex = activeItemIndex;

    this.applyAtmosphere(whiteMix);

    const overlayTarget = this.resolveBottomSheetFocusTarget();
    const targetMix = overlayTarget ? 1 : 0;
    this.overlayFocusMix += (targetMix - this.overlayFocusMix) * OVERLAY_FOCUS_BLEND_SPEED;
    if (Math.abs(targetMix - this.overlayFocusMix) < OVERLAY_FOCUS_MIX_EPSILON) {
      this.overlayFocusMix = targetMix;
    }

    if (overlayTarget && this.overlayFocusMix > 0) {
      desiredPosition = lerpVec3(desiredPosition, overlayTarget.position, this.overlayFocusMix);
      desiredLookAt = lerpVec3(desiredLookAt, overlayTarget.lookAt, this.overlayFocusMix);
    }

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

  private updateJourneyState(progress: number, whiteMix: number): void {
    const clampedProgress = clamp(progress, 0, 1);
    const clampedWhiteMix = this.config.infiniteCorridor ? clamp(whiteMix, 0, 1) : 0;
    const progressChanged =
      Math.abs(clampedProgress - this.progress) > JOURNEY_PROGRESS_EPSILON;
    const whiteMixChanged =
      Math.abs(clampedWhiteMix - this.loopWhiteMix) > LOOP_WHITE_MIX_EPSILON;

    if (!progressChanged && !whiteMixChanged) {
      return;
    }

    this.progress = clampedProgress;
    this.loopWhiteMix = clampedWhiteMix;
    this.applyState();
  }

  private resolveBottomSheetFocusTarget(): { position: Vec3; lookAt: Vec3 } | null {
    if (
      !this.overlayFocusEnabled ||
      this.overlayFocusItemIndex === null ||
      !this.buildArtifacts
    ) {
      return null;
    }

    const targetItem = this.buildArtifacts.layout.find(
      (entry) => entry.index === this.overlayFocusItemIndex,
    );
    if (!targetItem) {
      return null;
    }

    if ("side" in targetItem) {
      return this.resolveBottomSheetArtworkTarget(targetItem);
    }

    return this.resolveBottomSheetStationTarget(targetItem);
  }

  private resolveBottomSheetStationTarget(item: PositionedGalleryItem): { position: Vec3; lookAt: Vec3 } {
    const focusPosition = item.focusPosition;
    const centerPosition = item.centerPosition;
    const focusTarget = item.focusTarget;
    const blendToCenter = this.overlayFocusMobile
      ? STATION_OVERLAY_CENTER_BLEND_MOBILE
      : STATION_OVERLAY_CENTER_BLEND_DESKTOP;
    const distanceBoost = this.overlayFocusMobile
      ? STATION_OVERLAY_DISTANCE_BOOST_MOBILE
      : STATION_OVERLAY_DISTANCE_BOOST_DESKTOP;
    const anchoredPosition = lerpVec3(focusPosition, centerPosition, blendToCenter);
    const fartherPosition = lerpVec3(focusTarget, anchoredPosition, 1 + distanceBoost);
    const framedPosition = lerpVec3(fartherPosition, focusTarget, STATION_OVERLAY_FOCUS_PULL);

    return {
      position: framedPosition,
      lookAt: focusTarget,
    };
  }

  private resolveBottomSheetArtworkTarget(item: PositionedGalleryItem): { position: Vec3; lookAt: Vec3 } {
    if (!("side" in item)) {
      return this.resolveBottomSheetStationTarget(item);
    }

    const focusTarget = item.focusTarget;
    const normalX = item.side === "left" ? 1 : -1;
    const baseDistance = Math.abs(item.focusPosition[0] - focusTarget[0]);
    const stableDistance = clamp(
      baseDistance * this.config.artworkOverlayAngleDistanceScale,
      this.config.artworkOverlayAngleDistanceMin,
      this.config.artworkOverlayAngleDistanceMax,
    );
    const framedPosition: Vec3 = [
      focusTarget[0] + normalX * stableDistance,
      focusTarget[1],
      focusTarget[2] + this.config.artworkOverlayForwardOffset,
    ];

    return {
      position: framedPosition,
      lookAt: focusTarget,
    };
  }

  private resolveEffectiveRenderViewport(baseViewport: RenderViewport): RenderViewport {
    if (!this.overlayFocusEnabled) {
      return baseViewport;
    }

    if (this.overlayFocusMobile) {
      const topVisibleRatio = this.getTopVisibleRatioForBottomSheet();
      if (topVisibleRatio >= 0.999) {
        return baseViewport;
      }

      const clampedRatio = clamp(topVisibleRatio, 0.1, 0.95);
      const croppedHeight = Math.max(1, Math.round(baseViewport.height * clampedRatio));
      return {
        x: baseViewport.x,
        y: baseViewport.y + (baseViewport.height - croppedHeight),
        width: baseViewport.width,
        height: croppedHeight,
        aspect: baseViewport.width / croppedHeight,
      };
    }

    const desktopVisibleRatio = clamp(1 - this.overlayFocusDesktopWidth, 0.25, 0.75);
    const croppedWidth = Math.max(1, Math.round(baseViewport.width * desktopVisibleRatio));
    const anchoredToRight = this.overlayFocusDesktopSide === "left";
    return {
      x: anchoredToRight ? baseViewport.x + (baseViewport.width - croppedWidth) : baseViewport.x,
      y: baseViewport.y,
      width: croppedWidth,
      height: baseViewport.height,
      aspect: croppedWidth / baseViewport.height,
    };
  }

  private getTopVisibleRatioForBottomSheet(): number {
    if (!this.overlayFocusEnabled) {
      return 1;
    }

    if (this.overlayFocusSheetState === "full") {
      return this.overlayFocusMobile ? 0.14 : 0.18;
    }

    if (this.overlayFocusSheetState === "half") {
      return this.overlayFocusMobile ? 0.42 : 0.5;
    }

    return 1;
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

    this.renderer.setClearColor(this.mixedBackgroundColor, 0);
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

