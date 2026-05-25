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

  it("orients artworks inward to corridor center", () => {
    const layout = calculateArtworkLayout({
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 2).map((artwork, index) => ({
        ...artwork,
        side: index === 0 ? "left" : "right",
      })),
    });

    expect(layout[0].rotation[1]).toBeCloseTo(Math.PI / 2);
    expect(layout[1].rotation[1]).toBeCloseTo(-Math.PI / 2);
    expect(layout[0].focusTarget[0]).toBeGreaterThan(layout[0].position[0]);
    expect(layout[1].focusTarget[0]).toBeLessThan(layout[1].position[0]);
  });

  it("expands focus composition when artwork sideText is present", () => {
    const noTextConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: [
        {
          ...DEFAULT_GALLERY_CONFIG.artworks[0],
          sideText: undefined,
          side: "left" as const,
        },
      ],
    };

    const withTextConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: [
        {
          ...DEFAULT_GALLERY_CONFIG.artworks[0],
          side: "left" as const,
          sideText: {
            eyebrow: "Note",
            title: "Long Lateral Label",
            description: "Camera should adapt to include this side text.",
            width: 2.2,
            gap: 0.8,
            align: "after" as const,
          },
        },
      ],
    };

    const noTextLayout = calculateArtworkLayout(noTextConfig)[0];
    const withTextLayout = calculateArtworkLayout(withTextConfig)[0];
    const noTextDistance = Math.abs(noTextLayout.focusPosition[0] - noTextLayout.focusTarget[0]);
    const withTextDistance = Math.abs(withTextLayout.focusPosition[0] - withTextLayout.focusTarget[0]);

    expect(withTextDistance).toBeGreaterThan(noTextDistance);
    expect(withTextLayout.focusTarget[2]).not.toBeCloseTo(withTextLayout.position[2]);
  });
});

