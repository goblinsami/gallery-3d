import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Fog,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { LIGHTING_PRESETS } from "../constants/lightingPresets";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArchitecturalMaterialSet } from "./createArchitecturalMaterials";
import { getArchitecturalLedLayout } from "./architecturalLedLayout";
import { createArchitecturalLedBake } from "./createArchitecturalLedBake";
import {
  getCeilingGridFadeOpacity,
  getCeilingGridLayout,
  type CeilingGridLayout,
} from "./ceilingSpotLayout";

interface FadedMatrixBucket {
  opacity: number;
  matrices: Matrix4[];
}

const getFadeBucketOpacity = (opacity: number): number => {
  const steps = Math.max(1, GALLERY_DEFAULTS.architecture.ceilingGridFadeSteps);
  return Math.max(0, Math.min(1, Math.round(opacity * steps) / steps));
};

const addFadedMatrix = (
  buckets: Map<string, FadedMatrixBucket>,
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
  material: MeshStandardMaterial,
  opacity: number,
): MeshStandardMaterial => {
  if (opacity >= 0.999) {
    return material;
  }

  const fadedMaterial = material.clone();
  fadedMaterial.transparent = true;
  fadedMaterial.opacity = opacity;
  fadedMaterial.depthWrite = false;
  return fadedMaterial;
};

const addFadedInstancedMeshes = (
  root: Group,
  name: string,
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  buckets: Map<string, FadedMatrixBucket>,
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
      bucket.matrices.forEach((bucketMatrix, index) => {
        mesh.setMatrixAt(index, bucketMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      root.add(mesh);
    });
};

export const createEnvironment = (
  config: ArtGallerySceneConfig,
  fog: Fog | null,
  materials: ArchitecturalMaterialSet,
): Group => {
  const root = new Group();
  root.name = "environment-root";

  if (fog) {
    fog.color.set(config.sceneFogColor);
    fog.near = LIGHTING_PRESETS[config.lightingMode].fogNear;
    fog.far = LIGHTING_PRESETS[config.lightingMode].fogFar;
  }

  const grid = getCeilingGridLayout(config);
  const railWidth = config.lightGridRailWidth;
  const railY = config.corridor.height - railWidth / 2 - 0.012;
  const gridSegmentLength = grid.depthLength / Math.max(1, grid.crossRailZPositions.length - 1);
  const segmentZPositions = grid.crossRailZPositions.slice(0, -1).map((z, index) => ({
    zCenter: (z + grid.crossRailZPositions[index + 1]) / 2,
  }));
  root.add(createArchitecturalLedBake(config, grid, segmentZPositions));

  const longitudinalRailGeometry = new BoxGeometry(
    railWidth,
    railWidth,
    gridSegmentLength + railWidth,
  );
  const longitudinalRailBuckets = new Map<string, FadedMatrixBucket>();
  segmentZPositions.forEach(({ zCenter }) => {
    grid.longitudinalRailXPositions.forEach((x) => {
      addFadedMatrix(
        longitudinalRailBuckets,
        grid,
        zCenter,
        new Matrix4().makeTranslation(x, railY, zCenter),
      );
    });
  });
  addFadedInstancedMeshes(
    root,
    "ceiling-longitudinal-rail",
    longitudinalRailGeometry,
    materials.ceilingGrid,
    longitudinalRailBuckets,
  );

  const crossRailGeometry = new BoxGeometry(config.corridor.width, railWidth, railWidth);
  const crossRailBuckets = new Map<string, FadedMatrixBucket>();
  grid.crossRailZPositions.forEach((z) => {
    addFadedMatrix(
      crossRailBuckets,
      grid,
      z,
      new Matrix4().makeTranslation(0, railY, z),
    );
  });
  addFadedInstancedMeshes(
    root,
    "ceiling-cross-rail",
    crossRailGeometry,
    materials.ceilingGrid,
    crossRailBuckets,
  );

  const fixtureDepth = GALLERY_DEFAULTS.architecture.ceilingFixtureDepth;
  const fixtureY = config.corridor.height - fixtureDepth / 2 - railWidth;
  const fixtureTrimGeometry = new CylinderGeometry(
    GALLERY_DEFAULTS.architecture.ceilingFixtureRadius,
    GALLERY_DEFAULTS.architecture.ceilingFixtureRadius,
    fixtureDepth,
    20,
  );
  const fixtureCoreGeometry = new CylinderGeometry(
    GALLERY_DEFAULTS.architecture.ceilingFixtureCoreRadius,
    GALLERY_DEFAULTS.architecture.ceilingFixtureCoreRadius,
    fixtureDepth + 0.004,
    18,
  );
  const fixtureTrimBuckets = new Map<string, FadedMatrixBucket>();
  const fixtureCoreBuckets = new Map<string, FadedMatrixBucket>();
  grid.anchors.forEach((anchor) => {
    addFadedMatrix(
      fixtureTrimBuckets,
      grid,
      anchor.z,
      new Matrix4().makeTranslation(anchor.x, fixtureY, anchor.z),
    );
    addFadedMatrix(
      fixtureCoreBuckets,
      grid,
      anchor.z,
      new Matrix4().makeTranslation(anchor.x, fixtureY - 0.003, anchor.z),
    );
  });
  addFadedInstancedMeshes(
    root,
    "ceiling-fixture-trim",
    fixtureTrimGeometry,
    materials.ceilingFixtureTrim,
    fixtureTrimBuckets,
  );
  addFadedInstancedMeshes(
    root,
    "ceiling-fixture-core",
    fixtureCoreGeometry,
    materials.ceilingFixtureCore,
    fixtureCoreBuckets,
  );

  const ledLayout = getArchitecturalLedLayout(config);
  const ledThickness = GALLERY_DEFAULTS.architecture.ledStripThickness;
  const longitudinalLedGeometry = new BoxGeometry(
    ledThickness,
    ledThickness,
    gridSegmentLength + ledThickness,
  );
  const longitudinalLedBuckets = new Map<string, FadedMatrixBucket>();
  segmentZPositions.forEach(({ zCenter }) => {
    ledLayout.longitudinalAnchors.forEach((anchor) => {
      addFadedMatrix(
        longitudinalLedBuckets,
        grid,
        zCenter,
        new Matrix4().makeTranslation(anchor.x, anchor.y, zCenter),
      );
    });
  });
  addFadedInstancedMeshes(
    root,
    "longitudinal-led",
    longitudinalLedGeometry,
    materials.ledStrip,
    longitudinalLedBuckets,
  );

  const verticalLedGeometry = new BoxGeometry(
    ledThickness,
    config.corridor.height - GALLERY_DEFAULTS.architecture.ledStripEdgeInset * 2,
    ledThickness,
  );
  const verticalLedBuckets = new Map<string, FadedMatrixBucket>();
  ledLayout.verticalAnchors.forEach((anchor) => {
    addFadedMatrix(
      verticalLedBuckets,
      grid,
      anchor.z,
      new Matrix4().makeTranslation(anchor.x, config.corridor.height / 2, anchor.z),
    );
  });
  addFadedInstancedMeshes(
    root,
    "vertical-led",
    verticalLedGeometry,
    materials.ledStrip,
    verticalLedBuckets,
  );

  return root;
};

