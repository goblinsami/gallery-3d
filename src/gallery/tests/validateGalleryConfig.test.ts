import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";

describe("validateGalleryConfig", () => {
  it("returns defaults for empty payload", () => {
    const result = validateGalleryConfig();
    expect(result.config.id).toBe(DEFAULT_GALLERY_CONFIG.id);
    expect(result.config.artworks.length).toBeGreaterThan(0);
    expect(result.config.scrollStrength).toBe(DEFAULT_GALLERY_CONFIG.scrollStrength);
    expect(result.config.loopWhiteAfterEndWindow).toBe(DEFAULT_GALLERY_CONFIG.loopWhiteAfterEndWindow);
    expect(result.config.loopWhiteStartsBeforeEndWindow).toBe(
      DEFAULT_GALLERY_CONFIG.loopWhiteStartsBeforeEndWindow,
    );
    expect(result.config.loopWhiteFadeOutRevealWindow).toBe(DEFAULT_GALLERY_CONFIG.loopWhiteFadeOutRevealWindow);
    expect(result.config.loopWhiteFadeOutWindow).toBe(DEFAULT_GALLERY_CONFIG.loopWhiteFadeOutWindow);
    expect(result.config.loopProgressAdvanceDuringWhiteFadeOut).toBe(
      DEFAULT_GALLERY_CONFIG.loopProgressAdvanceDuringWhiteFadeOut,
    );
    expect(result.config.artworkFocusFill).toBe(DEFAULT_GALLERY_CONFIG.artworkFocusFill);
    expect(result.config.artworkTurnSmoothness).toBe(DEFAULT_GALLERY_CONFIG.artworkTurnSmoothness);
    expect(result.config.artworkTurnKeyframes).toBe(DEFAULT_GALLERY_CONFIG.artworkTurnKeyframes);
  });

  it("detects invalid artworks and preserves valid ones", () => {
    const result = validateGalleryConfig({
      artworks: [
        { id: "invalid", title: "No image" },
        {
          id: "valid",
          title: "Valid",
          imageUrl: "https://picsum.photos/id/1025/1200/900",
        },
      ],
    });

    expect(result.errors.length).toBe(1);
    expect(result.config.artworks).toHaveLength(1);
    expect(result.config.artworks[0].id).toBe("valid");
  });

  it("merges partial payload with defaults", () => {
    const result = validateGalleryConfig({
      sceneTitle: "Custom Title",
      scrollStrength: 3,
      loopWhiteAfterEndWindow: 0.24,
      loopWhiteStartsBeforeEndWindow: 0.18,
      loopWhiteFadeOutRevealWindow: 0.2,
      loopWhiteFadeOutWindow: 0.44,
      loopProgressAdvanceDuringWhiteFadeOut: 0.19,
      artworkFocusFill: 0.68,
      artworkTurnSmoothness: 0.82,
      artworkTurnKeyframes: 7,
      corridor: {
        wallColor: "#ffffff",
      },
    });

    expect(result.config.sceneTitle).toBe("Custom Title");
    expect(result.config.scrollStrength).toBeCloseTo(3);
    expect(result.config.loopWhiteAfterEndWindow).toBeCloseTo(0.24);
    expect(result.config.loopWhiteStartsBeforeEndWindow).toBeCloseTo(0.18);
    expect(result.config.loopWhiteFadeOutRevealWindow).toBeCloseTo(0.2);
    expect(result.config.loopWhiteFadeOutWindow).toBeCloseTo(0.44);
    expect(result.config.loopProgressAdvanceDuringWhiteFadeOut).toBeCloseTo(0.19);
    expect(result.config.artworkFocusFill).toBeCloseTo(0.68);
    expect(result.config.artworkTurnSmoothness).toBeCloseTo(0.82);
    expect(result.config.artworkTurnKeyframes).toBe(7);
    expect(result.config.corridor.wallColor).toBe("#ffffff");
    expect(result.config.corridor.width).toBe(DEFAULT_GALLERY_CONFIG.corridor.width);
  });

  it("clamps out-of-range scrollStrength values", () => {
    const low = validateGalleryConfig({ scrollStrength: 0 });
    const high = validateGalleryConfig({ scrollStrength: 10 });

    expect(low.config.scrollStrength).toBe(0.25);
    expect(high.config.scrollStrength).toBe(8);
  });

  it("converts legacy sensitivity values to strength scale", () => {
    const legacyDefault = validateGalleryConfig({ scrollStrength: 0.00024 });
    const legacyFaster = validateGalleryConfig({ scrollStrength: 0.00048 });

    expect(legacyDefault.config.scrollStrength).toBeCloseTo(1);
    expect(legacyFaster.config.scrollStrength).toBeCloseTo(2);
  });

  it("clamps loop transition windows and aligns reveal/readable windows", () => {
    const low = validateGalleryConfig({
      loopWhiteAfterEndWindow: 0,
      loopWhiteStartsBeforeEndWindow: -1,
      loopWhiteFadeOutRevealWindow: 0,
      loopWhiteFadeOutWindow: 0,
      loopProgressAdvanceDuringWhiteFadeOut: -1,
    });
    const high = validateGalleryConfig({
      loopWhiteAfterEndWindow: 2,
      loopWhiteStartsBeforeEndWindow: 5,
      loopWhiteFadeOutRevealWindow: 2,
      loopWhiteFadeOutWindow: 2,
      loopProgressAdvanceDuringWhiteFadeOut: 5,
    });
    const aligned = validateGalleryConfig({
      loopWhiteFadeOutRevealWindow: 0.35,
      loopWhiteFadeOutWindow: 0.2,
    });

    expect(low.config.loopWhiteAfterEndWindow).toBe(0.02);
    expect(low.config.loopWhiteStartsBeforeEndWindow).toBe(0);
    expect(low.config.loopWhiteFadeOutRevealWindow).toBe(0.03);
    expect(low.config.loopWhiteFadeOutWindow).toBe(0.05);
    expect(low.config.loopProgressAdvanceDuringWhiteFadeOut).toBe(0);
    expect(high.config.loopWhiteAfterEndWindow).toBe(0.45);
    expect(high.config.loopWhiteStartsBeforeEndWindow).toBe(0.45);
    expect(high.config.loopWhiteFadeOutRevealWindow).toBe(0.45);
    expect(high.config.loopWhiteFadeOutWindow).toBe(0.6);
    expect(high.config.loopProgressAdvanceDuringWhiteFadeOut).toBe(0.45);
    expect(aligned.config.loopWhiteFadeOutWindow).toBe(0.35);
    expect(aligned.warnings.some((warning) => warning.includes("loopWhiteFadeOutRevealWindow"))).toBe(true);
  });

  it("supports legacy loop transition keys as aliases", () => {
    const result = validateGalleryConfig({
      loopWhiteTransitionWindow: 0.11,
      loopWhiteLeadWindow: 0.15,
      loopTitleRevealWindow: 0.19,
      loopTitleReadableWindow: 0.31,
      loopRestartProgressWindow: 0.17,
    } as never);

    expect(result.config.loopWhiteAfterEndWindow).toBeCloseTo(0.11);
    expect(result.config.loopWhiteStartsBeforeEndWindow).toBeCloseTo(0.15);
    expect(result.config.loopWhiteFadeOutRevealWindow).toBeCloseTo(0.19);
    expect(result.config.loopWhiteFadeOutWindow).toBeCloseTo(0.31);
    expect(result.config.loopProgressAdvanceDuringWhiteFadeOut).toBeCloseTo(0.17);
    expect(result.warnings.some((warning) => warning.includes("loopWhiteTransitionWindow"))).toBe(true);
  });

  it("clamps out-of-range artworkFocusFill values", () => {
    const low = validateGalleryConfig({ artworkFocusFill: 0 });
    const high = validateGalleryConfig({ artworkFocusFill: 2 });

    expect(low.config.artworkFocusFill).toBe(0.35);
    expect(high.config.artworkFocusFill).toBe(0.95);
  });

  it("clamps out-of-range artworkTurnSmoothness values", () => {
    const low = validateGalleryConfig({ artworkTurnSmoothness: -1 });
    const high = validateGalleryConfig({ artworkTurnSmoothness: 2 });

    expect(low.config.artworkTurnSmoothness).toBe(0);
    expect(high.config.artworkTurnSmoothness).toBe(1);
  });

  it("clamps and rounds artworkTurnKeyframes", () => {
    const low = validateGalleryConfig({ artworkTurnKeyframes: 0 });
    const high = validateGalleryConfig({ artworkTurnKeyframes: 99 });
    const rounded = validateGalleryConfig({ artworkTurnKeyframes: 4.7 });

    expect(low.config.artworkTurnKeyframes).toBe(1);
    expect(high.config.artworkTurnKeyframes).toBe(12);
    expect(rounded.config.artworkTurnKeyframes).toBe(5);
  });

  it("supports legacy infiniteGallery flag as alias of infiniteCorridor", () => {
    const result = validateGalleryConfig({ infiniteGallery: true } as never);
    expect(result.config.infiniteCorridor).toBe(true);
    expect(result.warnings.some((warning) => warning.includes("infiniteGallery"))).toBe(true);
  });
});

