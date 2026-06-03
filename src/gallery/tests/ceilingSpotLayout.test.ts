import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { getCeilingGridLayout } from "../scene/ceilingSpotLayout";

describe("getCeilingGridLayout", () => {
  it("creates modular rails with a recessed light at every intersection", () => {
    const layout = getCeilingGridLayout(DEFAULT_GALLERY_CONFIG);

    expect(layout.longitudinalRailXPositions).toHaveLength(3);
    expect(layout.crossRailZPositions.length).toBeGreaterThanOrEqual(8);
    expect(layout.anchors).toHaveLength(
      layout.longitudinalRailXPositions.length * layout.crossRailZPositions.length,
    );
  });

  it("extends the ceiling module depth for infinite corridors", () => {
    const finite = getCeilingGridLayout({
      ...DEFAULT_GALLERY_CONFIG,
      infiniteCorridor: false,
    });
    const infinite = getCeilingGridLayout({
      ...DEFAULT_GALLERY_CONFIG,
      infiniteCorridor: true,
    });

    expect(infinite.depthLength).toBeGreaterThan(finite.depthLength);
  });

  it("uses configured light grid width for longitudinal rails", () => {
    const layout = getCeilingGridLayout({
      ...DEFAULT_GALLERY_CONFIG,
      lightGridWidth: 4.8,
    });

    expect(layout.longitudinalRailXPositions).toEqual([-2.4, 0, 2.4]);
  });
});
