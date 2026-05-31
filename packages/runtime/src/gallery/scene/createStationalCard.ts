import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  SpotLight,
  Texture,
} from "three";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import type { PositionedStationalCard } from "../types/galleryRuntime";
import { loadTextureWithFallback } from "../utils/textureLoader";
import { renderStationalCardContent } from "../utils/renderStationalCardContent";

const BASE_CANVAS_HEIGHT = 760;
const MIN_CANVAS_DIM = 640;
const MAX_CANVAS_DIM = 2048;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const cleanColor = (value: string | undefined, fallback: string): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const isHeroStationVariant = (variant: PositionedStationalCard["variant"]): boolean =>
  variant === "about" || variant === "contact";

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

const extractAlpha = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const rgbaMatch = value.replace(/\s+/g, "").match(/^rgba\((\d+),(\d+),(\d+),([0-9.]+)\)$/i);
  if (!rgbaMatch) return fallback;
  const parsed = Number(rgbaMatch[4]);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : fallback;
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number => {
  const words = text.split(/\s+/g).filter(Boolean);
  let line = "";
  let lineCount = 0;
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = context.measureText(testLine).width;
    if (testWidth > maxWidth && line) {
      context.fillText(line, x, cursorY);
      lineCount += 1;
      cursorY += lineHeight;
      line = word;
      if (lineCount >= maxLines) {
        return cursorY;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lineCount < maxLines) {
    context.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }

  return cursorY;
};

const createTextTexture = (
  station: PositionedStationalCard,
  planeWidth: number,
  planeHeight: number,
): CanvasTexture => {
  const content = renderStationalCardContent(station);
  const heroStation = isHeroStationVariant(station.variant);
  const { canvasWidth, canvasHeight, scale } = resolveCanvasSize(planeWidth, planeHeight);
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

  const paddingX = Math.round(Math.max(36 * scale, canvasWidth * 0.058));
  const textWidth = Math.max(64, canvasWidth - paddingX * 2);
  let cursorY = Math.round(82 * scale);

  if (heroStation) {
    const eyebrow = (content.subtitle ?? content.eyebrow).toUpperCase();
    context.fillStyle = "rgba(205, 218, 236, 0.92)";
    context.font = `600 ${Math.round(25 * scale)}px 'Segoe UI', sans-serif`;
    context.fillText(eyebrow, paddingX, cursorY);
    cursorY += Math.round(54 * scale);

    context.fillStyle = "#f7fbff";
    context.font = `800 ${Math.round(126 * scale)}px 'Segoe UI', sans-serif`;
    cursorY = drawWrappedText(
      context,
      content.title.toUpperCase(),
      paddingX,
      cursorY,
      textWidth,
      Math.round(114 * scale),
      2,
    );
  } else {
    context.fillStyle = "rgba(186, 204, 232, 0.92)";
    context.font = `600 ${Math.round(30 * scale)}px 'Segoe UI', sans-serif`;
    context.fillText(content.eyebrow.toUpperCase(), paddingX, cursorY);
    cursorY += Math.round(62 * scale);

    context.fillStyle = "#f3f8ff";
    context.font = `700 ${Math.round(58 * scale)}px 'Segoe UI', sans-serif`;
    cursorY = drawWrappedText(
      context,
      content.title,
      paddingX,
      cursorY,
      textWidth,
      Math.round(66 * scale),
      3,
    );
  }

  if (content.subtitle) {
    cursorY += Math.round(8 * scale);
    context.fillStyle = "rgba(189, 206, 232, 0.93)";
    context.font = `500 ${Math.round(35 * scale)}px 'Segoe UI', sans-serif`;
    cursorY = drawWrappedText(
      context,
      content.subtitle,
      paddingX,
      cursorY,
      textWidth,
      Math.round(44 * scale),
      2,
    );
  }

  if (content.description && !heroStation) {
    cursorY += Math.round(10 * scale);
    context.fillStyle = "rgba(224, 233, 248, 0.95)";
    context.font = `400 ${Math.round(31 * scale)}px 'Segoe UI', sans-serif`;
    cursorY = drawWrappedText(
      context,
      content.description,
      paddingX,
      cursorY,
      textWidth,
      Math.round(42 * scale),
      5,
    );
  }

  const detailLines = [
    ...content.contactLines,
    ...content.socialLinks.map((link) => `${link.label}: ${link.url}`),
    content.cta ? `${content.cta.label}: ${content.cta.url}` : undefined,
  ].filter((entry): entry is string => Boolean(entry));

  if (detailLines.length > 0 && !heroStation) {
    cursorY += Math.round(12 * scale);
    context.fillStyle = "rgba(168, 188, 217, 0.9)";
    context.font = `500 ${Math.round(25 * scale)}px 'Segoe UI', sans-serif`;
    for (const line of detailLines.slice(0, 4)) {
      cursorY = drawWrappedText(
        context,
        line,
        paddingX,
        cursorY,
        textWidth,
        Math.round(34 * scale),
        2,
      );
    }
  }

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
  spotlight: SpotLight;
  spotlightTarget: Object3D;
  baseSpotlightIntensity: number;
}

export const createStationalCard = async (
  station: PositionedStationalCard,
  lightingMode: "contrast" | "day",
): Promise<CreatedStationalCard> => {
  const width = clamp(station.width ?? GALLERY_DEFAULTS.stationalCard.width, 1.6, 8);
  const height = clamp(station.height ?? GALLERY_DEFAULTS.stationalCard.height, 1.2, 5);
  const depth = clamp(station.depth ?? GALLERY_DEFAULTS.stationalCard.depth, 0.02, 0.4);
  const backgroundColor = cleanColor(station.backgroundColor, GALLERY_DEFAULTS.stationalCard.backgroundColor);
  const borderColor = cleanColor(station.borderColor, GALLERY_DEFAULTS.stationalCard.borderColor);
  const glowColor = cleanColor(station.glowColor, GALLERY_DEFAULTS.stationalCard.glowColor);
  const borderOpacity = extractAlpha(station.borderColor, 0.24);
  const glowOpacity = extractAlpha(station.glowColor, 0.18);

  const root = new Group();
  root.name = `stational-card-${station.id}`;
  root.position.set(station.position[0], station.position[1], station.position[2]);
  root.rotation.set(station.rotation[0], station.rotation[1], station.rotation[2]);

  const panel = new Mesh(
    new BoxGeometry(width, height, depth),
    new MeshStandardMaterial({
      color: new Color(backgroundColor),
      roughness: 0.42,
      metalness: 0.18,
      emissive: new Color(glowColor),
      emissiveIntensity: lightingMode === "contrast" ? 0.14 : 0.08,
    }),
  );
  panel.castShadow = false;
  panel.receiveShadow = true;
  root.add(panel);

  const border = new Mesh(
    new PlaneGeometry(width * 0.985, height * 0.965),
    new MeshBasicMaterial({
      color: new Color(borderColor),
      transparent: true,
      opacity: clamp(borderOpacity * (lightingMode === "contrast" ? 1.2 : 1), 0.08, 0.42),
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  border.position.set(0, 0, depth / 2 + 0.004);
  border.renderOrder = 2;
  root.add(border);

  const glow = new Mesh(
    new PlaneGeometry(width * 1.08, height * 1.08),
    new MeshBasicMaterial({
      color: new Color(glowColor),
      transparent: true,
      opacity: clamp(glowOpacity * (lightingMode === "contrast" ? 1.25 : 1), 0.02, 0.26),
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  glow.position.set(0, 0, depth / 2 - 0.004);
  glow.renderOrder = 1;
  root.add(glow);

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

  const stationGlow = new PointLight(
    new Color(glowColor),
    lightingMode === "contrast" ? 0.56 : 0.34,
    width * 1.5,
    1.5,
  );
  stationGlow.position.set(0, 0, depth * 0.4);
  root.add(stationGlow);

  const spotlightTarget = new Object3D();
  spotlightTarget.position.set(station.position[0], station.position[1], station.position[2]);

  const baseSpotlightIntensity = clamp(
    station.spotlightIntensity ?? GALLERY_DEFAULTS.stationalCard.spotlightIntensity,
    0,
    4,
  );
  const spotlight = new SpotLight(
    "#ffffff",
    lightingMode === "contrast" ? baseSpotlightIntensity * 1.08 : baseSpotlightIntensity * 0.86,
    34,
    Math.PI / 7.2,
    0.36,
    1.25,
  );
  spotlight.position.set(0, station.position[1] + 2.3, station.position[2] + 2.6);
  spotlight.target = spotlightTarget;
  spotlight.castShadow = false;

  return {
    meshGroup: root,
    spotlight,
    spotlightTarget,
    baseSpotlightIntensity,
  };
};
