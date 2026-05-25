import { BackSide, BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
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

interface TitleGeometryOptions {
  size: number;
  depth: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createTitleGeometry = (
  text: string,
  font: import("three/examples/jsm/loaders/FontLoader.js").Font,
  options: TitleGeometryOptions,
): TextGeometry =>
  new TextGeometry(text, {
    font,
    size: options.size,
    depth: options.depth,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });

const measureTitleTextWidth = (
  text: string,
  font: import("three/examples/jsm/loaders/FontLoader.js").Font,
  options: TitleGeometryOptions,
  cache: Map<string, number>,
): number => {
  const cached = cache.get(text);
  if (typeof cached === "number") {
    return cached;
  }

  const geometry = createTitleGeometry(text, font, options);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const width = bounds ? bounds.max.x - bounds.min.x : 0;
  geometry.dispose();
  cache.set(text, width);
  return width;
};

const splitLongToken = (
  token: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] => {
  if (!token) {
    return [token];
  }

  if (measure(token) <= maxWidth) {
    return [token];
  }

  const chunks: string[] = [];
  let current = "";

  for (const char of token) {
    const next = `${current}${char}`;
    if (current && measure(next) > maxWidth) {
      chunks.push(current);
      current = char;
      continue;
    }

    current = next;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [token];
};

const wrapSceneTitleLines = (
  text: string,
  font: import("three/examples/jsm/loaders/FontLoader.js").Font,
  options: TitleGeometryOptions,
  maxWidth: number,
): string[] => {
  const content = text.trim();
  if (!content) {
    return ["Untitled Gallery"];
  }

  const cache = new Map<string, number>();
  const measure = (value: string): number => measureTitleTextWidth(value, font, options, cache);
  const paragraphs = content.split(/\r?\n/);
  const wrapped: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (wrapped.length > 0 && wrapped[wrapped.length - 1] !== "") {
        wrapped.push("");
      }
      continue;
    }

    let currentLine = "";
    for (const word of words) {
      const chunks = splitLongToken(word, maxWidth, measure);
      for (const chunk of chunks) {
        const candidate = currentLine ? `${currentLine} ${chunk}` : chunk;
        if (!currentLine || measure(candidate) <= maxWidth) {
          currentLine = candidate;
          continue;
        }

        wrapped.push(currentLine);
        currentLine = chunk;
      }
    }

    if (currentLine) {
      wrapped.push(currentLine);
    }
  }

  return wrapped.length > 0 ? wrapped : ["Untitled Gallery"];
};

export const createSceneTitle = async (config: ArtGallerySceneConfig): Promise<SceneTitleResult> => {
  const root = new Group();

  let material: MeshStandardMaterial;

  try {
    const font = await loadFont(config.sceneTitleConfig.fontUrl);
    material = new MeshStandardMaterial({
      color: config.sceneTitleConfig.color,
      transparent: true,
      opacity: config.sceneTitleConfig.maxOpacity,
      roughness: 0.4,
      metalness: 0.18,
    });
    const titleOptions: TitleGeometryOptions = {
      size: config.sceneTitleConfig.size,
      depth: config.sceneTitleConfig.depth,
    };
    const lines = wrapSceneTitleLines(
      config.sceneTitle,
      font,
      titleOptions,
      config.sceneTitleConfig.maxWidth,
    );
    const useDaylightContrast =
      config.lightingMode === "day" &&
      config.sceneTitleConfig.daylightContrastEnabled &&
      config.sceneTitleConfig.daylightContrastStrength > 0;
    const contrastStrength = clamp(config.sceneTitleConfig.daylightContrastStrength, 0, 1);
    const contrastScale = 1 + 0.01 + contrastStrength * 0.06;
    const contrastDepthOffset = Math.max(0.004, config.sceneTitleConfig.depth * 0.12);
    const contrastOpacityFactor = 0.16 + contrastStrength * 0.56;
    const contrastMaterial = useDaylightContrast
      ? new MeshStandardMaterial({
          color: config.sceneTitleConfig.daylightContrastColor,
          transparent: true,
          opacity: config.sceneTitleConfig.maxOpacity * contrastOpacityFactor,
          roughness: 0.8,
          metalness: 0,
          side: BackSide,
          depthWrite: false,
        })
      : null;
    const lineStep = Math.max(0.05, config.sceneTitleConfig.size * config.sceneTitleConfig.lineHeight);
    const totalHeight = (lines.length - 1) * lineStep;

    lines.forEach((line, index) => {
      const geometry = createTitleGeometry(line, font, titleOptions);
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox;
      if (bounds) {
        const centerX = (bounds.min.x + bounds.max.x) / 2;
        geometry.translate(-centerX, (totalHeight / 2) - index * lineStep, 0);
      }

      const lineMesh = new Mesh(geometry, material);
      lineMesh.castShadow = true;
      root.add(lineMesh);

      if (contrastMaterial) {
        const contrastMesh = new Mesh(geometry, contrastMaterial);
        contrastMesh.scale.set(contrastScale, contrastScale, 1);
        contrastMesh.position.z = -contrastDepthOffset;
        contrastMesh.castShadow = false;
        contrastMesh.onBeforeRender = () => {
          contrastMaterial.opacity = material.opacity * contrastOpacityFactor;
        };
        root.add(contrastMesh);
      }
    });
  } catch {
    const fallbackGeometry = new BoxGeometry(3.8, 0.8, 0.25);
    material = new MeshStandardMaterial({
      color: config.sceneTitleConfig.color,
      transparent: true,
      opacity: config.sceneTitleConfig.maxOpacity,
      roughness: 0.5,
      metalness: 0.08,
    });
    const fallbackMesh = new Mesh(fallbackGeometry, material);
    fallbackMesh.castShadow = true;
    root.add(fallbackMesh);
  }

  root.position.set(
    config.sceneTitleConfig.position[0],
    config.sceneTitleConfig.position[1],
    config.sceneTitleConfig.position[2],
  );

  return { root, material };
};

