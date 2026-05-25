import type { Texture } from "three";

interface CachedTexture {
  texture: Texture;
  refCount: number;
}

export class TextureCache {
  private readonly cache = new Map<string, CachedTexture>();

  get(url: string): Texture | null {
    const cached = this.cache.get(url);
    if (!cached) {
      return null;
    }

    cached.refCount += 1;
    return cached.texture;
  }

  set(url: string, texture: Texture): Texture {
    this.cache.set(url, { texture, refCount: 1 });
    return texture;
  }

  release(url: string): void {
    const cached = this.cache.get(url);
    if (!cached) {
      return;
    }

    cached.refCount -= 1;
    if (cached.refCount <= 0) {
      cached.texture.dispose();
      this.cache.delete(url);
    }
  }

  clear(): void {
    this.cache.forEach(({ texture }) => texture.dispose());
    this.cache.clear();
  }
}

export const textureCache = new TextureCache();

