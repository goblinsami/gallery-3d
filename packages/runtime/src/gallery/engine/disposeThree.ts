import {
  Material,
  Mesh,
  Object3D,
  Texture,
} from "three";

const textureKeys = [
  "map",
  "alphaMap",
  "aoMap",
  "bumpMap",
  "displacementMap",
  "emissiveMap",
  "envMap",
  "lightMap",
  "metalnessMap",
  "normalMap",
  "roughnessMap",
  "specularMap",
] as const;

const disposeTexture = (texture: Texture | null | undefined): void => {
  if (texture && typeof texture.dispose === "function") {
    texture.dispose();
  }
};

export const disposeMaterial = (material: Material): void => {
  const candidate = material as Material & Record<string, unknown>;

  for (const key of textureKeys) {
    const value = candidate[key] as Texture | null | undefined;
    disposeTexture(value);
  }

  material.dispose();
};

export const disposeThree = (root: Object3D): void => {
  root.traverse((node) => {
    const mesh = node as Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (!mesh.material) {
      return;
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial);
      return;
    }

    disposeMaterial(mesh.material);
  });
};

