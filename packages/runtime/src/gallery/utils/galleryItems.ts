import type {
  ArtGallerySceneConfig,
  ArtworkConfig,
  GalleryItem,
  StationalCardConfig,
} from "../types/galleryConfig";

export const isStationalCard = (
  item: GalleryItem | null | undefined,
): item is StationalCardConfig => Boolean(item && item.type === "stational-card");

export const isArtworkItem = (
  item: GalleryItem | null | undefined,
): item is ArtworkConfig => Boolean(item && item.type !== "stational-card");

export const toArtworkItem = (artwork: ArtworkConfig): ArtworkConfig => ({
  ...artwork,
  type: "artwork",
});

export const getGalleryItems = (config: ArtGallerySceneConfig): GalleryItem[] => {
  if (
    Array.isArray(config.items) &&
    config.items.length > 0 &&
    config.items.some((item) => item.type === "stational-card")
  ) {
    return config.items;
  }

  if (Array.isArray(config.artworks) && config.artworks.length > 0) {
    return config.artworks.map(toArtworkItem);
  }

  if (Array.isArray(config.items) && config.items.length > 0) {
    return config.items;
  }

  return [];
};

export const getArtworkItems = (config: ArtGallerySceneConfig): ArtworkConfig[] =>
  getGalleryItems(config).filter(isArtworkItem);

export const getGalleryItemCount = (config: ArtGallerySceneConfig): number =>
  Math.max(1, getGalleryItems(config).length);
