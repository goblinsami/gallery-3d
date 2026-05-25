export type LightingMode = "contrast" | "day";
export type ArtworkSide = "left" | "right";
export type Vec3 = [number, number, number];

export interface ArtworkMetadata {
  artist?: string;
  year?: string;
  medium?: string;
  tags?: string[];
}

export type ArtworkSideTextAlign = "before" | "after";

export interface ArtworkSideTextConfig {
  eyebrow?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  gap?: number;
  offsetY?: number;
  offsetZ?: number;
  align?: ArtworkSideTextAlign;
  backgroundColor?: string;
  textColor?: string;
}

export interface ArtworkConfig {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  side?: ArtworkSide;
  width?: number;
  height?: number;
  frameEnabled?: boolean;
  frameColor?: string;
  frameThickness?: number;
  frameDepth?: number;
  spotlightIntensity?: number;
  sideText?: ArtworkSideTextConfig;
  metadata?: ArtworkMetadata;
}

export interface SceneTitleConfig {
  fontUrl: string;
  size: number;
  depth: number;
  color: string;
  position: Vec3;
  maxOpacity: number;
  fadeStartProgress: number;
  fadeEndProgress: number;
}

export interface GalleryCameraConfig {
  fov: number;
  startPosition: Vec3;
  height: number;
  movementSmoothing: number;
  near: number;
  far: number;
}

export interface GalleryCorridorConfig {
  width: number;
  height: number;
  segmentLength: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  artworkSpacing: number;
  wallThickness: number;
  artworkInset: number;
}

export interface GalleryTimingsConfig {
  introDuration: number;
  travelDuration: number;
  focusDuration: number;
  returnDuration: number;
}

export interface ArtGallerySceneConfig {
  id: string;
  sceneTitle: string;
  lightingMode: LightingMode;
  infiniteCorridor: boolean;
  sceneBackgroundColor: string;
  sceneFogColor: string;
  ceilingSpotsEnabled: boolean;
  ceilingSpotsColor: string;
  ceilingSpotsIntensity: number;
  artworkBacklightEnabled: boolean;
  artworkBacklightColor: string;
  artworkBacklightIntensity: number;
  scrollStrength: number;
  loopWhiteAfterEndWindow: number;
  loopWhiteStartsBeforeEndWindow: number;
  loopWhiteFadeOutRevealWindow: number;
  loopWhiteFadeOutWindow: number;
  loopProgressAdvanceDuringWhiteFadeOut: number;
  artworkFocusFill: number;
  artworkTurnSmoothness: number;
  artworkTurnKeyframes: number;
  artworkTurnLeadIn: number;
  camera: GalleryCameraConfig;
  corridor: GalleryCorridorConfig;
  sceneTitleConfig: SceneTitleConfig;
  artworks: ArtworkConfig[];
  timings: GalleryTimingsConfig;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

