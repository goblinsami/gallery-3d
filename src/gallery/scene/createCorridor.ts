import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

const resolveSegmentCount = (config: ArtGallerySceneConfig): number => {
  const artworkDepth = Math.max(1, config.artworks.length) * config.corridor.artworkSpacing;
  const totalDepth = artworkDepth + config.corridor.segmentLength * 2;
  const baseCount = Math.ceil(totalDepth / config.corridor.segmentLength) + 2;

  if (config.infiniteCorridor) {
    return Math.max(baseCount, 16);
  }

  return baseCount;
};

export const createCorridor = (config: ArtGallerySceneConfig): Group => {
  const root = new Group();
  root.name = "corridor-root";

  const width = config.corridor.width;
  const height = config.corridor.height;
  const segmentLength = config.corridor.segmentLength;
  const thickness = config.corridor.wallThickness;

  const floorGeometry = new BoxGeometry(width + thickness * 2, thickness, segmentLength);
  const ceilingGeometry = floorGeometry.clone();
  const wallGeometry = new BoxGeometry(thickness, height + thickness, segmentLength);

  const floorMaterial = new MeshStandardMaterial({ color: new Color(config.corridor.floorColor), roughness: 0.9 });
  const ceilingMaterial = new MeshStandardMaterial({
    color: new Color(config.corridor.ceilingColor),
    roughness: 0.65,
  });
  const wallMaterial = new MeshStandardMaterial({ color: new Color(config.corridor.wallColor), roughness: 0.75 });

  const segmentCount = resolveSegmentCount(config);

  for (let index = 0; index < segmentCount; index += 1) {
    const z = -(index + 0.5) * segmentLength;

    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -thickness / 2, z);
    floor.receiveShadow = true;

    const ceiling = new Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, height + thickness / 2, z);
    ceiling.receiveShadow = true;

    const leftWall = new Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-(width / 2 + thickness / 2), height / 2, z);
    leftWall.receiveShadow = true;

    const rightWall = new Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(width / 2 + thickness / 2, height / 2, z);
    rightWall.receiveShadow = true;

    root.add(floor, ceiling, leftWall, rightWall);
  }

  return root;
};

