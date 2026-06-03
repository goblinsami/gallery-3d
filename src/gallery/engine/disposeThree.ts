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

const disposeTexture = (
  texture: Texture | null | undefined,
  disposedTextures: Set<Texture>,
): void => {
  if (texture && typeof texture.dispose === "function" && !disposedTextures.has(texture)) {
    disposedTextures.add(texture);
    texture.dispose();
  }
};

export const disposeMaterial = (
  material: Material,
  disposedMaterials = new Set<Material>(),
  disposedTextures = new Set<Texture>(),
): void => {
  if (disposedMaterials.has(material)) {
    return;
  }

  disposedMaterials.add(material);
  const candidate = material as Material & Record<string, unknown>;

  for (const key of textureKeys) {
    const value = candidate[key] as Texture | null | undefined;
    disposeTexture(value, disposedTextures);
  }

  material.dispose();
};

export const disposeThree = (root: Object3D): void => {
  const disposedGeometries = new Set<Mesh["geometry"]>();
  const disposedMaterials = new Set<Material>();
  const disposedTextures = new Set<Texture>();

  root.traverse((node) => {
    const mesh = node as Mesh;

    if (mesh.geometry && !disposedGeometries.has(mesh.geometry)) {
      disposedGeometries.add(mesh.geometry);
      mesh.geometry.dispose();
    }

    if (!mesh.material) {
      return;
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) =>
        disposeMaterial(material, disposedMaterials, disposedTextures),
      );
      return;
    }

    disposeMaterial(mesh.material, disposedMaterials, disposedTextures);
  });
};

