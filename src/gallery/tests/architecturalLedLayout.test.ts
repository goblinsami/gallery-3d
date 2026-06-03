import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { GALLERY_DEFAULTS } from "../constants/galleryDefaults";
import {
  getArchitecturalLedLayout,
  getArchitecturalLedRakeLightLayout,
} from "../scene/architecturalLedLayout";
import { getCeilingGridLayout } from "../scene/ceilingSpotLayout";

describe("architecturalLedLayout", () => {
  it("adds continuous led strips to wall-floor and wall-ceiling joints", () => {
    const layout = getArchitecturalLedLayout(DEFAULT_GALLERY_CONFIG);

    expect(layout.longitudinalAnchors).toHaveLength(4);
    expect(layout.longitudinalAnchors.map((anchor) => anchor.y)).toContain(
      GALLERY_DEFAULTS.architecture.ledStripEdgeInset,
    );
    expect(layout.longitudinalAnchors.map((anchor) => anchor.y)).toContain(
      DEFAULT_GALLERY_CONFIG.corridor.height -
        GALLERY_DEFAULTS.architecture.ledStripEdgeInset,
    );
  });

  it("adds vertical strips at each ceiling module axis", () => {
    const ledLayout = getArchitecturalLedLayout(DEFAULT_GALLERY_CONFIG);
    const ceilingLayout = getCeilingGridLayout(DEFAULT_GALLERY_CONFIG);

    expect(ledLayout.verticalAnchors).toHaveLength(
      ceilingLayout.crossRailZPositions.length * 2,
    );
  });

  it("bounds the number of warm rake lights", () => {
    const anchors = getArchitecturalLedRakeLightLayout(DEFAULT_GALLERY_CONFIG);

    expect(anchors.length).toBeLessThanOrEqual(
      GALLERY_DEFAULTS.architecture.maxLedRakeLights,
    );
  });

  it("samples real led lights from floor and vertical strips", () => {
    const anchors = getArchitecturalLedRakeLightLayout(DEFAULT_GALLERY_CONFIG);
    const floorY =
      GALLERY_DEFAULTS.architecture.ledStripEdgeInset +
      GALLERY_DEFAULTS.architecture.ledFloorLightYOffset;
    const verticalY =
      DEFAULT_GALLERY_CONFIG.corridor.height *
      GALLERY_DEFAULTS.architecture.ledVerticalLightHeightScale;

    expect(anchors.some((anchor) => anchor.y === floorY)).toBe(true);
    expect(anchors.some((anchor) => anchor.y === verticalY)).toBe(true);
    expect(anchors.some((anchor) => anchor.intensityScale < 1)).toBe(true);
  });
});
