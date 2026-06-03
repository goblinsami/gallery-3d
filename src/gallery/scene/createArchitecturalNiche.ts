import { BoxGeometry, Group, Mesh } from "three";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { ArchitecturalMaterialSet } from "./createArchitecturalMaterials";

const addNicheTrim = (
  root: Group,
  width: number,
  height: number,
  depth: number,
  trimWidth: number,
  materials: ArchitecturalMaterialSet,
): void => {
  const horizontalGeometry = new BoxGeometry(width + trimWidth * 2, trimWidth, depth);
  const verticalGeometry = new BoxGeometry(trimWidth, height, depth);
  const trimZ = -depth * 0.22;

  const top = new Mesh(horizontalGeometry, materials.wall);
  top.position.set(0, height / 2 + trimWidth / 2, trimZ);
  const bottom = new Mesh(horizontalGeometry, materials.wall);
  bottom.position.set(0, -(height / 2 + trimWidth / 2), trimZ);
  const left = new Mesh(verticalGeometry, materials.wall);
  left.position.set(-(width / 2 + trimWidth / 2), 0, trimZ);
  const right = new Mesh(verticalGeometry, materials.wall);
  right.position.set(width / 2 + trimWidth / 2, 0, trimZ);

  root.add(top, bottom, left, right);
};

export const createArtworkNiche = (
  width: number,
  height: number,
  materials: ArchitecturalMaterialSet,
): Group => {
  const root = new Group();
  root.name = "artwork-niche";

  const depth = GALLERY_DEFAULTS.architecture.nicheDepth;
  const padding = GALLERY_DEFAULTS.architecture.nichePadding;
  const trimWidth = GALLERY_DEFAULTS.architecture.nicheTrimWidth;
  const nicheWidth = width + padding * 2;
  const nicheHeight = height + padding * 2;
  const recess = new Mesh(
    new BoxGeometry(nicheWidth, nicheHeight, depth),
    materials.nicheRecess,
  );
  recess.position.z = -depth / 2;
  recess.receiveShadow = true;
  root.add(recess);

  addNicheTrim(root, nicheWidth, nicheHeight, depth * 0.42, trimWidth, materials);
  return root;
};

export const createStationNiche = (
  width: number,
  height: number,
  materials: ArchitecturalMaterialSet,
): Group => {
  const root = new Group();
  root.name = "station-niche";

  const depth = GALLERY_DEFAULTS.architecture.nicheDepth;
  const trimWidth = GALLERY_DEFAULTS.architecture.nicheTrimWidth * 1.5;
  const nicheWidth = width * GALLERY_DEFAULTS.architecture.stationNicheWidthScale;
  const nicheHeight = height * GALLERY_DEFAULTS.architecture.stationNicheHeightScale;
  addNicheTrim(root, nicheWidth, nicheHeight, depth, trimWidth, materials);

  return root;
};
