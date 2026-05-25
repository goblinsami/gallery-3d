import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import { textureCache } from "./textureCache";

export interface TextureLoadOptions {
  url: string;
  fallbackUrl?: string;
}

const textureLoader = new TextureLoader();

const createFallbackTexture = (): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;

  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#22324a");
    gradient.addColorStop(1, "#4b5568");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(255,255,255,0.85)";
    context.font = "600 32px sans-serif";
    context.textAlign = "center";
    context.fillText("Artwork Unavailable", canvas.width / 2, canvas.height / 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
};

const loadTexture = (url: string): Promise<Texture> =>
  new Promise((resolve, reject) => {
    const cached = textureCache.get(url);
    if (cached) {
      resolve(cached);
      return;
    }

    textureLoader.load(
      url,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        resolve(textureCache.set(url, texture));
      },
      undefined,
      reject,
    );
  });

export const loadTextureWithFallback = async (
  options: TextureLoadOptions,
): Promise<{ texture: Texture; sourceUrl: string }> => {
  try {
    const texture = await loadTexture(options.url);
    return { texture, sourceUrl: options.url };
  } catch {
    if (options.fallbackUrl) {
      try {
        const fallbackTexture = await loadTexture(options.fallbackUrl);
        return { texture: fallbackTexture, sourceUrl: options.fallbackUrl };
      } catch {
        return { texture: createFallbackTexture(), sourceUrl: "__generated_fallback__" };
      }
    }

    return { texture: createFallbackTexture(), sourceUrl: "__generated_fallback__" };
  }
};

