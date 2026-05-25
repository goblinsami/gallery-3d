import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import type { PositionedArtwork } from "../types/galleryRuntime";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 640;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

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

export const createArtworkSideText = (artwork: PositionedArtwork): Group | null => {
  const sideText = artwork.sideText;
  if (!sideText) {
    return null;
  }

  const title = sideText.title?.trim() ?? artwork.title;
  const eyebrow = sideText.eyebrow?.trim();
  const description = sideText.description?.trim() ?? artwork.description?.trim();
  if (!title && !eyebrow && !description) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const bgColor = sideText.backgroundColor ?? "#0e1422";
  const textColor = sideText.textColor ?? "#f3f6fb";
  const panelOpacity = 0.9;
  const paddingX = 78;
  const paddingTop = 86;
  const textWidth = CANVAS_WIDTH - paddingX * 2;

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = bgColor;
  context.globalAlpha = panelOpacity;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.globalAlpha = 1;

  let cursorY = paddingTop;
  if (eyebrow) {
    context.fillStyle = "#bcd0f1";
    context.font = "600 36px 'Segoe UI', sans-serif";
    context.fillText(eyebrow.toUpperCase(), paddingX, cursorY);
    cursorY += 64;
  }

  if (title) {
    context.fillStyle = textColor;
    context.font = "700 62px 'Segoe UI', sans-serif";
    cursorY = drawWrappedText(context, title, paddingX, cursorY, textWidth, 72, 3);
    cursorY += 18;
  }

  if (description) {
    context.fillStyle = "#dce7f8";
    context.font = "400 38px 'Segoe UI', sans-serif";
    drawWrappedText(context, description, paddingX, cursorY, textWidth, 52, 4);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  const width = clamp(sideText.width ?? GALLERY_DEFAULTS.artwork.sideTextWidth, 0.8, 3.6);
  const height = clamp(sideText.height ?? GALLERY_DEFAULTS.artwork.sideTextHeight, 0.6, 2.6);
  const gap = clamp(sideText.gap ?? GALLERY_DEFAULTS.artwork.sideTextGap, 0.08, 2.2);
  const offsetY = clamp(sideText.offsetY ?? GALLERY_DEFAULTS.artwork.sideTextOffsetY, -2, 2);
  const offsetZ = clamp(sideText.offsetZ ?? GALLERY_DEFAULTS.artwork.sideTextOffsetZ, -3, 3);
  const alignSign = sideText.align === "before" ? -1 : 1;
  const artworkWidth = artwork.width ?? GALLERY_DEFAULTS.artwork.width;

  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
  });
  const mesh = new Mesh(new PlaneGeometry(width, height), material);
  mesh.position.set(alignSign * (artworkWidth / 2 + gap + width / 2), offsetY, offsetZ + 0.03);
  mesh.renderOrder = 3;

  const root = new Group();
  root.name = `artwork-side-text-${artwork.id}`;
  root.add(mesh);
  return root;
};
