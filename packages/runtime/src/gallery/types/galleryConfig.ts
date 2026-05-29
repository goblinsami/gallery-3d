export type LightingMode = "contrast" | "day";
export type ArtworkSide = "left" | "right";
export type Vec3 = [number, number, number];
export type GalleryItemType = "artwork" | "stational-card";

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
  borderEnabled?: boolean;
  borderColor?: string;
  borderIntensity?: number;
  borderWidth?: number;
}

export interface ArtworkConfig {
  type?: "artwork";
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

export type StationalCardVariant =
  | "about"
  | "contact"
  | "manifesto"
  | "services"
  | "awards"
  | "testimonial"
  | "cta"
  | "custom";

export type StationalCardLayout = "text" | "image-left" | "image-right";

export interface StationalCardSocialLink {
  label: string;
  url: string;
  icon?: string;
}

export interface StationalCardContact {
  email?: string;
  phone?: string;
  location?: string;
}

export interface StationalCardCta {
  label: string;
  url: string;
}

export interface StationalCardConfig {
  id: string;
  type: "stational-card";
  variant?: StationalCardVariant;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  layout?: StationalCardLayout;
  socialLinks?: StationalCardSocialLink[];
  contact?: StationalCardContact;
  cta?: StationalCardCta;
  width?: number;
  height?: number;
  depth?: number;
  backgroundColor?: string;
  borderColor?: string;
  glowColor?: string;
  spotlightIntensity?: number;
  mobileColumnLayout?: boolean;
}

export type GalleryItem = ArtworkConfig | StationalCardConfig;

export interface SceneTitleConfig {
  fontUrl: string;
  size: number;
  depth: number;
  maxWidth: number;
  lineHeight: number;
  color: string;
  daylightContrastEnabled: boolean;
  daylightContrastColor: string;
  daylightContrastStrength: number;
  position: Vec3;
  maxOpacity: number;
  fadeStartProgress: number;
  fadeEndProgress: number;
}

export interface GalleryCameraConfig {
  fov: number;
  targetAspectRatio?: number;
  mobileTargetAspectRatio?: number;
  mobileBreakpointWidth?: number;
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
  carpetEnabled: boolean;
  carpetWidth: number;
  carpetColor: string;
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
  enhanceNightReadibility: boolean;
  scrollStrength: number;
  mobileDetailsOverlayEnabled: boolean;
  mobileDetailsBackdropEnabled: boolean;
  mobileDetailsBackdropIntensity: number;
  mobileDetailsBackdropHeight: number;
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
  items?: GalleryItem[];
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

