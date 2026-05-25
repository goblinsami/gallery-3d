import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  type Texture,
} from "three";
import type { PositionedArtwork } from "../types/galleryRuntime";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";

export interface CreatedArtworkFrame {
  root: Group;
  imageMaterial: MeshStandardMaterial;
}

const resolveDisplaySize = (
  texture: Texture,
  targetWidth: number,
  targetHeight: number,
): { width: number; height: number } => {
  const image = texture.image as { width?: number; height?: number } | undefined;
  if (!image?.width || !image?.height) {
    return { width: targetWidth, height: targetHeight };
  }

  const textureRatio = image.width / image.height;
  const frameRatio = targetWidth / targetHeight;

  if (textureRatio > frameRatio) {
    return {
      width: targetWidth,
      height: targetWidth / textureRatio,
    };
  }

  return {
    width: targetHeight * textureRatio,
    height: targetHeight,
  };
};

export const createArtworkFrame = (artwork: PositionedArtwork, texture: Texture): CreatedArtworkFrame => {
  const width = artwork.width ?? GALLERY_DEFAULTS.artwork.width;
  const height = artwork.height ?? GALLERY_DEFAULTS.artwork.height;
  const frameThickness = artwork.frameThickness ?? GALLERY_DEFAULTS.artwork.frameThickness;
  const frameDepth = artwork.frameDepth ?? GALLERY_DEFAULTS.artwork.frameDepth;

  const root = new Group();

  const frameGeometry = new BoxGeometry(width + frameThickness * 2, height + frameThickness * 2, frameDepth);
  const frameMaterial = new MeshStandardMaterial({
    color: artwork.frameColor ?? GALLERY_DEFAULTS.artwork.frameColor,
    roughness: 0.62,
    metalness: 0.23,
  });
  const frameMesh = new Mesh(frameGeometry, frameMaterial);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;

  const planeGeometry = new PlaneGeometry(1, 1);
  const imageMaterial = new MeshStandardMaterial({
    map: texture,
    roughness: 0.52,
    metalness: 0.02,
  });
  const imageMesh = new Mesh(planeGeometry, imageMaterial);
  const displaySize = resolveDisplaySize(texture, width, height);
  imageMesh.scale.set(displaySize.width, displaySize.height, 1);
  imageMesh.position.z = frameDepth / 2 + 0.02;
  imageMesh.receiveShadow = true;

  root.add(frameMesh);
  root.add(imageMesh);

  return {
    root,
    imageMaterial,
  };
};

