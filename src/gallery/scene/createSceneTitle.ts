import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";

export interface SceneTitleResult {
  root: Group;
  material: MeshStandardMaterial;
}

const fontLoader = new FontLoader();

const loadFont = async (fontUrl: string): Promise<import("three/examples/jsm/loaders/FontLoader.js").Font> =>
  new Promise((resolve, reject) => {
    fontLoader.load(fontUrl, resolve, undefined, reject);
  });

export const createSceneTitle = async (config: ArtGallerySceneConfig): Promise<SceneTitleResult> => {
  const root = new Group();

  let mesh: Mesh;

  try {
    const font = await loadFont(config.sceneTitleConfig.fontUrl);
    const geometry = new TextGeometry(config.sceneTitle, {
      font,
      size: config.sceneTitleConfig.size,
      depth: config.sceneTitleConfig.depth,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });

    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (bounds) {
      const centerX = (bounds.max.x - bounds.min.x) / 2;
      geometry.translate(-centerX, 0, 0);
    }

    const material = new MeshStandardMaterial({
      color: config.sceneTitleConfig.color,
      transparent: true,
      opacity: config.sceneTitleConfig.maxOpacity,
      roughness: 0.4,
      metalness: 0.18,
    });

    mesh = new Mesh(geometry, material);
  } catch {
    const fallbackGeometry = new BoxGeometry(3.8, 0.8, 0.25);
    const fallbackMaterial = new MeshStandardMaterial({
      color: config.sceneTitleConfig.color,
      transparent: true,
      opacity: config.sceneTitleConfig.maxOpacity,
      roughness: 0.5,
      metalness: 0.08,
    });
    mesh = new Mesh(fallbackGeometry, fallbackMaterial);
  }

  mesh.castShadow = true;
  root.position.set(
    config.sceneTitleConfig.position[0],
    config.sceneTitleConfig.position[1],
    config.sceneTitleConfig.position[2],
  );
  root.add(mesh);

  return { root, material: mesh.material as MeshStandardMaterial };
};

