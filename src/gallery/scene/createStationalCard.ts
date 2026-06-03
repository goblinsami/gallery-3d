import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
} from "three";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { PositionedStationalCard } from "../types/galleryRuntime";
import { loadTextureWithFallback } from "../utils/textureLoader";
import { renderStationalCardContent } from "../utils/renderStationalCardContent";
import type { ArchitecturalMaterialSet } from "./createArchitecturalMaterials";
import { createStationNiche } from "./createArchitecturalNiche";

const BASE_CANVAS_HEIGHT = 760;
const MIN_CANVAS_DIM = 640;
const MAX_CANVAS_DIM = 2048;
const STATIONAL_REFERENCE_TEXT_PLANE_HEIGHT = GALLERY_DEFAULTS.stationalCard.height * 0.9;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const resolveCanvasSize = (
  planeWidth: number,
  planeHeight: number,
): { canvasWidth: number; canvasHeight: number; scale: number } => {
  const safeAspect = clamp(planeWidth / Math.max(planeHeight, 0.01), 0.45, 2.8);
  const rawWidth = Math.round(BASE_CANVAS_HEIGHT * safeAspect);
  const canvasWidth = Math.round(clamp(rawWidth, MIN_CANVAS_DIM, MAX_CANVAS_DIM));
  const canvasHeight = Math.round(clamp(Math.round(canvasWidth / safeAspect), MIN_CANVAS_DIM, MAX_CANVAS_DIM));
  return {
    canvasWidth,
    canvasHeight,
    scale: canvasHeight / BASE_CANVAS_HEIGHT,
  };
};

const wrapTextLines = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text.split(/\s+/g).filter(Boolean);
  let line = "";
  const lines: string[] = [];

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = context.measureText(testLine).width;
    if (testWidth > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) {
        return lines;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  return lines;
};

const normalizeLabel = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized.toUpperCase() : undefined;
};

const createTextTexture = (
  station: PositionedStationalCard,
  planeWidth: number,
  planeHeight: number,
): CanvasTexture => {
  const content = renderStationalCardContent(station);
  const { canvasWidth, canvasHeight, scale } = resolveCanvasSize(planeWidth, planeHeight);
  const textScale = scale * clamp(planeHeight / STATIONAL_REFERENCE_TEXT_PLANE_HEIGHT, 0.78, 1.55);
  const normalizedTitle = normalizeLabel(content.title) ?? "STATION";
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    const fallback = new CanvasTexture(canvas);
    fallback.colorSpace = SRGBColorSpace;
    fallback.minFilter = LinearFilter;
    fallback.magFilter = LinearFilter;
    return fallback;
  }

  const panelBackground = "rgba(7, 11, 18, 0.76)";
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = panelBackground;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const paddingX = Math.round(Math.max(42 * textScale, canvasWidth * 0.075));
  const textWidth = Math.max(64, canvasWidth - paddingX * 2);
  const titleFontSize = Math.max(64, Math.round(164 * textScale));
  const titleLineHeight = Math.max(58, Math.round(136 * textScale));
  context.fillStyle = "#f3f8ff";
  context.font = `800 ${titleFontSize}px 'Segoe UI', sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const titleLines = wrapTextLines(context, normalizedTitle, textWidth, 2);
  const totalTitleHeight = titleLineHeight * titleLines.length;
  const startY = canvasHeight * 0.5 - totalTitleHeight * 0.5 + titleLineHeight * 0.5;
  const centerX = canvasWidth * 0.5;

  titleLines.forEach((line, index) => {
    context.fillText(line, centerX, startY + index * titleLineHeight);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const getTextureAspect = (texture: Texture): number | null => {
  const image = texture.image as
    | { width?: number; height?: number; videoWidth?: number; videoHeight?: number }
    | undefined;
  const width =
    typeof image?.width === "number"
      ? image.width
      : typeof image?.videoWidth === "number"
        ? image.videoWidth
        : 0;
  const height =
    typeof image?.height === "number"
      ? image.height
      : typeof image?.videoHeight === "number"
        ? image.videoHeight
        : 0;
  if (width <= 0 || height <= 0) {
    return null;
  }
  return width / height;
};

const applyTextureCover = (
  texture: Texture,
  targetWidth: number,
  targetHeight: number,
): void => {
  const imageAspect = getTextureAspect(texture);
  if (!imageAspect) {
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    return;
  }

  const targetAspect = targetWidth / Math.max(targetHeight, 0.0001);
  if (imageAspect > targetAspect) {
    const repeatX = targetAspect / imageAspect;
    texture.repeat.set(repeatX, 1);
    texture.offset.set((1 - repeatX) * 0.5, 0);
    return;
  }

  const repeatY = imageAspect / targetAspect;
  texture.repeat.set(1, repeatY);
  texture.offset.set(0, (1 - repeatY) * 0.5);
};

export interface CreatedStationalCard {
  meshGroup: Group;
}

export const createStationalCard = async (
  station: PositionedStationalCard,
  architecturalMaterials: ArchitecturalMaterialSet,
): Promise<CreatedStationalCard> => {
  const width = clamp(station.width ?? GALLERY_DEFAULTS.stationalCard.width, 1.6, 8);
  const height = clamp(station.height ?? GALLERY_DEFAULTS.stationalCard.height, 1.2, 5);
  const depth = clamp(station.depth ?? GALLERY_DEFAULTS.stationalCard.depth, 0.02, 0.4);

  const root = new Group();
  root.name = `stational-card-${station.id}`;
  root.position.set(station.position[0], station.position[1], station.position[2]);
  root.rotation.set(station.rotation[0], station.rotation[1], station.rotation[2]);
  root.add(createStationNiche(width, height, architecturalMaterials));

  const splitLayout = station.layout === "image-left" || station.layout === "image-right";
  const stackAsColumn = splitLayout && station.mobileColumnLayout === true;
  const hasImage = Boolean(station.image);
  const textWidth = stackAsColumn
    ? width * 0.84
    : splitLayout
      ? width * 0.52
      : width * 0.86;
  const textHeight = stackAsColumn
    ? (hasImage ? height * 0.48 : height * 0.82)
    : height * 0.84;
  const textTexture = createTextTexture(station, textWidth, textHeight);
  const textX = stackAsColumn
    ? 0
    : splitLayout
    ? (station.layout === "image-left" ? width * 0.19 : -width * 0.19)
    : 0;
  const textY = stackAsColumn && hasImage ? -height * 0.2 : 0;
  const textPlane = new Mesh(
    new PlaneGeometry(textWidth, textHeight),
    new MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0.98,
    }),
  );
  textPlane.position.set(textX, textY, depth / 2 + 0.006);
  textPlane.renderOrder = 3;
  root.add(textPlane);

  if (station.image && splitLayout) {
    const { texture } = await loadTextureWithFallback({ url: station.image });
    const imageWidth = stackAsColumn ? width * 0.74 : width * 0.34;
    const imageHeight = stackAsColumn ? height * 0.3 : height * 0.76;
    applyTextureCover(texture, imageWidth, imageHeight);
    const imagePlane = new Mesh(
      new PlaneGeometry(imageWidth, imageHeight),
      new MeshStandardMaterial({
        map: texture,
        roughness: 0.38,
        metalness: 0.08,
      }),
    );
    imagePlane.position.set(
      stackAsColumn
        ? 0
        : station.layout === "image-left"
          ? -width * 0.25
          : width * 0.25,
      stackAsColumn ? height * 0.23 : 0,
      depth / 2 + 0.008,
    );
    imagePlane.renderOrder = 3;
    root.add(imagePlane);
  }

  return {
    meshGroup: root,
  };
};
