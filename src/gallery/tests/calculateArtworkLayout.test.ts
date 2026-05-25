import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { calculateArtworkLayout } from "../journey/cameraKeyframes";

describe("calculateArtworkLayout", () => {
  it("alternates sides by default", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 4).map((artwork) => ({ ...artwork, side: undefined })),
    };

    const layout = calculateArtworkLayout(config);
    expect(layout.map((entry) => entry.side)).toEqual(["left", "right", "left", "right"]);
  });

  it("respects manual side overrides", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: [
        { ...DEFAULT_GALLERY_CONFIG.artworks[0], side: "right" as const },
        { ...DEFAULT_GALLERY_CONFIG.artworks[1], side: "right" as const },
        { ...DEFAULT_GALLERY_CONFIG.artworks[2], side: "left" as const },
      ],
    };

    const layout = calculateArtworkLayout(config);
    expect(layout[0].side).toBe("right");
    expect(layout[1].side).toBe("right");
    expect(layout[2].side).toBe("left");
  });

  it("uses configured spacing on z progression", () => {
    const spacing = 11;
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      corridor: {
        ...DEFAULT_GALLERY_CONFIG.corridor,
        artworkSpacing: spacing,
      },
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 3),
    };

    const layout = calculateArtworkLayout(config);
    expect(layout[1].position[2] - layout[0].position[2]).toBeCloseTo(-spacing);
    expect(layout[2].position[2] - layout[1].position[2]).toBeCloseTo(-spacing);
  });

  it("keeps consistent z ordering", () => {
    const layout = calculateArtworkLayout({
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 5),
    });

    for (let index = 1; index < layout.length; index += 1) {
      expect(layout[index].position[2]).toBeLessThan(layout[index - 1].position[2]);
    }
  });
});

