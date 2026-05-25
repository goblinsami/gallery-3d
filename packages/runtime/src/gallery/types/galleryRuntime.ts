import type {
  ArtGallerySceneConfig,
  ArtworkConfig,
  ArtworkSide,
  Vec3,
} from "./galleryConfig";

export interface PositionedArtwork extends ArtworkConfig {
  index: number;
  side: ArtworkSide;
  position: Vec3;
  rotation: Vec3;
  lookAt: Vec3;
  focusTarget: Vec3;
  focusPosition: Vec3;
  centerPosition: Vec3;
}

export interface CameraKeyframe {
  progress: number;
  position: Vec3;
  lookAt: Vec3;
  titleOpacity: number;
  activeArtworkIndex: number | null;
  label: string;
}

export interface CameraState {
  position: Vec3;
  lookAt: Vec3;
  titleOpacity: number;
  activeArtworkIndex: number | null;
}

export interface JourneySegment {
  label: string;
  start: number;
  end: number;
}

export interface JourneyTimeline {
  segments: JourneySegment[];
  totalWeight: number;
}

export interface GallerySceneGraph {
  sceneNodes: {
    corridorRoot: import("three").Group;
    artworkRoot: import("three").Group;
    environmentRoot: import("three").Group;
    lightingRoot: import("three").Group;
    titleRoot: import("three").Group;
  };
  spotlights: import("three").SpotLight[];
  titleMaterial?: import("three").Material;
}

export interface EngineBuildArtifacts {
  config: ArtGallerySceneConfig;
  layout: PositionedArtwork[];
  keyframes: CameraKeyframe[];
}

