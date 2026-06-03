import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import {
  getCeilingGridFadeOpacity,
  type CeilingGridLayout,
} from "./ceilingSpotLayout";

type GradientAxis = "x" | "y";
type GradientFocus = "start" | "center" | "end";

interface SegmentPosition {
  zCenter: number;
}

interface BakedLightBucket {
  opacity: number;
  matrices: Matrix4[];
}

const createRgba = (colorValue: string, alpha: number): string => {
  const color = new Color(colorValue);
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(
    color.b * 255,
  )}, ${alpha})`;
};

const addGradientStops = (
  gradient: CanvasGradient,
  focus: GradientFocus,
  colorValue: string,
): void => {
  if (focus === "start") {
    gradient.addColorStop(0, createRgba(colorValue, 1));
    gradient.addColorStop(0.24, createRgba(colorValue, 0.52));
    gradient.addColorStop(1, createRgba(colorValue, 0));
    return;
  }

  if (focus === "end") {
    gradient.addColorStop(0, createRgba(colorValue, 0));
    gradient.addColorStop(0.76, createRgba(colorValue, 0.52));
    gradient.addColorStop(1, createRgba(colorValue, 1));
    return;
  }

  gradient.addColorStop(0, createRgba(colorValue, 0));
  gradient.addColorStop(0.36, createRgba(colorValue, 0.32));
  gradient.addColorStop(0.5, createRgba(colorValue, 0.9));
  gradient.addColorStop(0.64, createRgba(colorValue, 0.32));
  gradient.addColorStop(1, createRgba(colorValue, 0));
};

const createGradientTexture = (
  axis: GradientAxis,
  focus: GradientFocus,
): CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (context) {
    const gradient =
      axis === "x"
        ? context.createLinearGradient(0, 0, canvas.width, 0)
        : context.createLinearGradient(0, 0, 0, canvas.height);
    addGradientStops(gradient, focus, GALLERY_TOKENS.architecture.ledStrip);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createBakeMaterial = (
  texture: CanvasTexture,
  opacity: number,
): MeshBasicMaterial =>
  new MeshBasicMaterial({
    color: GALLERY_TOKENS.architecture.ledStrip,
    map: texture,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    side: DoubleSide,
  });

const getFadeBucketOpacity = (opacity: number): number => {
  const steps = Math.max(1, GALLERY_DEFAULTS.architecture.ceilingGridFadeSteps);
  return Math.max(0, Math.min(1, Math.round(opacity * steps) / steps));
};

const addBakedLightMatrix = (
  buckets: Map<string, BakedLightBucket>,
  grid: CeilingGridLayout,
  z: number,
  matrix: Matrix4,
): void => {
  const opacity = getCeilingGridFadeOpacity(grid, z);
  if (opacity <= GALLERY_DEFAULTS.architecture.ceilingGridFadeMinOpacity) {
    return;
  }

  const bucketOpacity = getFadeBucketOpacity(opacity);
  if (bucketOpacity <= 0) {
    return;
  }

  const key = bucketOpacity.toFixed(2);
  const bucket = buckets.get(key) ?? { opacity: bucketOpacity, matrices: [] };
  bucket.matrices.push(matrix.clone());
  buckets.set(key, bucket);
};

const createMaterialForOpacity = (
  material: MeshBasicMaterial,
  opacity: number,
): MeshBasicMaterial => {
  if (opacity >= 0.999) {
    return material;
  }

  const fadedMaterial = material.clone();
  fadedMaterial.opacity = material.opacity * opacity;
  return fadedMaterial;
};

const addBakedLightMeshes = (
  root: Group,
  name: string,
  geometry: PlaneGeometry,
  material: MeshBasicMaterial,
  buckets: Map<string, BakedLightBucket>,
): void => {
  Array.from(buckets.values())
    .sort((a, b) => b.opacity - a.opacity)
    .forEach((bucket) => {
      const mesh = new InstancedMesh(
        geometry,
        createMaterialForOpacity(material, bucket.opacity),
        bucket.matrices.length,
      );
      mesh.name = `${name}-${Math.round(bucket.opacity * 100)}`;
      bucket.matrices.forEach((matrix, index) => {
        mesh.setMatrixAt(index, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      root.add(mesh);
    });
};

const createTransform = (
  x: number,
  y: number,
  z: number,
  rotationX = 0,
  rotationY = 0,
): Matrix4 =>
  new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromEuler(new Euler(rotationX, rotationY, 0)),
    new Vector3(1, 1, 1),
  );

const addSegmentBakedLights = (
  buckets: Map<string, BakedLightBucket>,
  grid: CeilingGridLayout,
  segmentZPositions: readonly SegmentPosition[],
  createMatrix: (zCenter: number) => Matrix4,
): void => {
  segmentZPositions.forEach(({ zCenter }) => {
    addBakedLightMatrix(buckets, grid, zCenter, createMatrix(zCenter));
  });
};

export const createArchitecturalLedBake = (
  config: ArtGallerySceneConfig,
  grid: CeilingGridLayout,
  segmentZPositions: readonly SegmentPosition[],
): Group => {
  const root = new Group();
  root.name = "architectural-led-bake-root";

  const surfaceOffset = GALLERY_DEFAULTS.architecture.ledBakeSurfaceOffset;
  const wallX = config.corridor.width / 2 - surfaceOffset;
  const floorGlowWidth = Math.min(
    GALLERY_DEFAULTS.architecture.ledBakeFloorWidth,
    config.corridor.width / 2,
  );
  const wallBandHeight = Math.min(
    GALLERY_DEFAULTS.architecture.ledBakeWallEdgeHeight,
    config.corridor.height / 2,
  );
  const gridSegmentLength = grid.depthLength / Math.max(1, grid.crossRailZPositions.length - 1);

  const floorGlowGeometry = new PlaneGeometry(floorGlowWidth, gridSegmentLength);
  const wallEdgeGlowGeometry = new PlaneGeometry(gridSegmentLength, wallBandHeight);
  const verticalWallGlowGeometry = new PlaneGeometry(
    GALLERY_DEFAULTS.architecture.ledBakeVerticalWallWidth,
    config.corridor.height - GALLERY_DEFAULTS.architecture.ledStripEdgeInset * 2,
  );
  const ceilingGlowGeometry = new PlaneGeometry(floorGlowWidth, gridSegmentLength);

  const xStartMaterial = createBakeMaterial(
    createGradientTexture("x", "start"),
    GALLERY_DEFAULTS.architecture.ledBakeFloorOpacity,
  );
  const xEndMaterial = createBakeMaterial(
    createGradientTexture("x", "end"),
    GALLERY_DEFAULTS.architecture.ledBakeFloorOpacity,
  );
  const xCenterMaterial = createBakeMaterial(
    createGradientTexture("x", "center"),
    GALLERY_DEFAULTS.architecture.ledBakeWallOpacity,
  );
  const yStartMaterial = createBakeMaterial(
    createGradientTexture("y", "start"),
    GALLERY_DEFAULTS.architecture.ledBakeWallOpacity,
  );
  const yEndMaterial = createBakeMaterial(
    createGradientTexture("y", "end"),
    GALLERY_DEFAULTS.architecture.ledBakeCeilingOpacity,
  );
  const ceilingStartMaterial = createBakeMaterial(
    createGradientTexture("x", "start"),
    GALLERY_DEFAULTS.architecture.ledBakeCeilingOpacity,
  );
  const ceilingEndMaterial = createBakeMaterial(
    createGradientTexture("x", "end"),
    GALLERY_DEFAULTS.architecture.ledBakeCeilingOpacity,
  );

  const floorLeftBuckets = new Map<string, BakedLightBucket>();
  const floorRightBuckets = new Map<string, BakedLightBucket>();
  const ceilingLeftBuckets = new Map<string, BakedLightBucket>();
  const ceilingRightBuckets = new Map<string, BakedLightBucket>();
  const wallLowerLeftBuckets = new Map<string, BakedLightBucket>();
  const wallLowerRightBuckets = new Map<string, BakedLightBucket>();
  const wallUpperLeftBuckets = new Map<string, BakedLightBucket>();
  const wallUpperRightBuckets = new Map<string, BakedLightBucket>();

  addSegmentBakedLights(floorLeftBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(-wallX + floorGlowWidth / 2, surfaceOffset, zCenter, -Math.PI / 2),
  );
  addSegmentBakedLights(floorRightBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(wallX - floorGlowWidth / 2, surfaceOffset, zCenter, -Math.PI / 2),
  );
  addSegmentBakedLights(ceilingLeftBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(
      -wallX + floorGlowWidth / 2,
      config.corridor.height - surfaceOffset,
      zCenter,
      Math.PI / 2,
    ),
  );
  addSegmentBakedLights(ceilingRightBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(
      wallX - floorGlowWidth / 2,
      config.corridor.height - surfaceOffset,
      zCenter,
      Math.PI / 2,
    ),
  );
  addSegmentBakedLights(wallLowerLeftBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(-wallX, wallBandHeight / 2, zCenter, 0, Math.PI / 2),
  );
  addSegmentBakedLights(wallLowerRightBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(wallX, wallBandHeight / 2, zCenter, 0, -Math.PI / 2),
  );
  addSegmentBakedLights(wallUpperLeftBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(
      -wallX,
      config.corridor.height - wallBandHeight / 2,
      zCenter,
      0,
      Math.PI / 2,
    ),
  );
  addSegmentBakedLights(wallUpperRightBuckets, grid, segmentZPositions, (zCenter) =>
    createTransform(
      wallX,
      config.corridor.height - wallBandHeight / 2,
      zCenter,
      0,
      -Math.PI / 2,
    ),
  );

  const verticalLeftBuckets = new Map<string, BakedLightBucket>();
  const verticalRightBuckets = new Map<string, BakedLightBucket>();
  grid.crossRailZPositions.forEach((z) => {
    addBakedLightMatrix(
      verticalLeftBuckets,
      grid,
      z,
      createTransform(-wallX, config.corridor.height / 2, z, 0, Math.PI / 2),
    );
    addBakedLightMatrix(
      verticalRightBuckets,
      grid,
      z,
      createTransform(wallX, config.corridor.height / 2, z, 0, -Math.PI / 2),
    );
  });

  addBakedLightMeshes(root, "led-bake-floor-left", floorGlowGeometry, xStartMaterial, floorLeftBuckets);
  addBakedLightMeshes(root, "led-bake-floor-right", floorGlowGeometry, xEndMaterial, floorRightBuckets);
  addBakedLightMeshes(root, "led-bake-ceiling-left", ceilingGlowGeometry, ceilingStartMaterial, ceilingLeftBuckets);
  addBakedLightMeshes(root, "led-bake-ceiling-right", ceilingGlowGeometry, ceilingEndMaterial, ceilingRightBuckets);
  addBakedLightMeshes(root, "led-bake-wall-lower-left", wallEdgeGlowGeometry, yStartMaterial, wallLowerLeftBuckets);
  addBakedLightMeshes(root, "led-bake-wall-lower-right", wallEdgeGlowGeometry, yStartMaterial, wallLowerRightBuckets);
  addBakedLightMeshes(root, "led-bake-wall-upper-left", wallEdgeGlowGeometry, yEndMaterial, wallUpperLeftBuckets);
  addBakedLightMeshes(root, "led-bake-wall-upper-right", wallEdgeGlowGeometry, yEndMaterial, wallUpperRightBuckets);
  addBakedLightMeshes(root, "led-bake-wall-vertical-left", verticalWallGlowGeometry, xCenterMaterial, verticalLeftBuckets);
  addBakedLightMeshes(root, "led-bake-wall-vertical-right", verticalWallGlowGeometry, xCenterMaterial, verticalRightBuckets);

  return root;
};
