import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { getGalleryItemCount } from "../utils/galleryItems";
import type { ArchitecturalMaterialSet } from "./createArchitecturalMaterials";

const resolveSegmentCount = (config: ArtGallerySceneConfig): number => {
  const artworkDepth = getGalleryItemCount(config) * config.corridor.artworkSpacing;
  const totalDepth = artworkDepth + config.corridor.segmentLength * 2;
  const baseCount = Math.ceil(totalDepth / config.corridor.segmentLength) + 2;

  if (config.infiniteCorridor) {
    return Math.max(baseCount, 16);
  }

  return baseCount;
};

export const createCorridor = (
  config: ArtGallerySceneConfig,
  materials: ArchitecturalMaterialSet,
): Group => {
  const root = new Group();
  root.name = "corridor-root";

  const width = config.corridor.width;
  const height = config.corridor.height;
  const segmentLength = config.corridor.segmentLength;
  const thickness = config.corridor.wallThickness;
  const segmentCount = resolveSegmentCount(config);
  const corridorDepth = Math.max(segmentLength, segmentCount * segmentLength);
  const seamOverlap = 0.004;

  const floorGeometry = new BoxGeometry(width + seamOverlap * 2, thickness, corridorDepth + seamOverlap * 2);
  const ceilingGeometry = new PlaneGeometry(width + seamOverlap * 2, corridorDepth + seamOverlap * 2);
  const wallGeometry = new PlaneGeometry(corridorDepth + seamOverlap * 2, height + seamOverlap * 2);

  const carpetEnabled = config.corridor.carpetEnabled;
  const carpetMaterial = carpetEnabled
    ? new MeshStandardMaterial({
        color: new Color(config.corridor.carpetColor),
        roughness: 0.86,
        metalness: 0.03,
      })
    : null;
  if (carpetMaterial) {
    carpetMaterial.polygonOffset = true;
    carpetMaterial.polygonOffsetFactor = -1.2;
    carpetMaterial.polygonOffsetUnits = -1;
  }
  const carpetThickness = Math.max(0.008, thickness * 0.05);
  const carpetGeometry = carpetEnabled
    ? new BoxGeometry(config.corridor.carpetWidth, carpetThickness, corridorDepth)
    : null;

  const zCenter = -corridorDepth / 2;

  const floor = new Mesh(floorGeometry, materials.floor);
  floor.position.set(0, -thickness / 2, zCenter);
  floor.receiveShadow = true;

  const ceiling = new Mesh(ceilingGeometry, materials.ceiling);
  ceiling.position.set(0, height, zCenter);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.receiveShadow = true;

  const leftWall = new Mesh(wallGeometry, materials.wall);
  leftWall.position.set(-width / 2, height / 2, zCenter);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;

  const rightWall = new Mesh(wallGeometry, materials.wall);
  rightWall.position.set(width / 2, height / 2, zCenter);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;

  root.add(floor, ceiling, leftWall, rightWall);

  if (carpetGeometry && carpetMaterial) {
    const carpet = new Mesh(carpetGeometry, carpetMaterial);
    carpet.position.set(0, carpetThickness / 2, zCenter);
    carpet.receiveShadow = true;
    carpet.castShadow = false;
    root.add(carpet);
  }

  return root;
};

