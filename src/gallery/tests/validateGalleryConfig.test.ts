import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";

describe("validateGalleryConfig", () => {
  it("returns defaults for empty payload", () => {
    const result = validateGalleryConfig();
    expect(result.config.id).toBe(DEFAULT_GALLERY_CONFIG.id);
    expect(result.config.artworks.length).toBeGreaterThan(0);
    expect(result.config.sceneBackgroundColor).toBe(DEFAULT_GALLERY_CONFIG.sceneBackgroundColor);
    expect(result.config.sceneFogColor).toBe(DEFAULT_GALLERY_CONFIG.sceneFogColor);
    expect(result.config.scrollStrength).toBe(DEFAULT_GALLERY_CONFIG.scrollStrength);
    expect(result.config.mobileDetailsOverlayEnabled).toBe(DEFAULT_GALLERY_CONFIG.mobileDetailsOverlayEnabled);
    expect(result.config.ceilingSpotsEnabled).toBe(DEFAULT_GALLERY_CONFIG.ceilingSpotsEnabled);
    expect(result.config.ceilingSpotsColor).toBe(DEFAULT_GALLERY_CONFIG.ceilingSpotsColor);
    expect(result.config.ceilingSpotsIntensity).toBe(DEFAULT_GALLERY_CONFIG.ceilingSpotsIntensity);
    expect(result.config.artworkBacklightEnabled).toBe(DEFAULT_GALLERY_CONFIG.artworkBacklightEnabled);
    expect(result.config.artworkBacklightColor).toBe(DEFAULT_GALLERY_CONFIG.artworkBacklightColor);
    expect(result.config.artworkBacklightIntensity).toBe(DEFAULT_GALLERY_CONFIG.artworkBacklightIntensity);
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
    expect(result.config.artworkTurnLeadIn).toBe(DEFAULT_GALLERY_CONFIG.artworkTurnLeadIn);
    expect(result.config.sceneTitleConfig.daylightContrastEnabled).toBe(
      DEFAULT_GALLERY_CONFIG.sceneTitleConfig.daylightContrastEnabled,
    );
    expect(result.config.sceneTitleConfig.daylightContrastColor).toBe(
      DEFAULT_GALLERY_CONFIG.sceneTitleConfig.daylightContrastColor,
    );
    expect(result.config.sceneTitleConfig.daylightContrastStrength).toBeCloseTo(
      DEFAULT_GALLERY_CONFIG.sceneTitleConfig.daylightContrastStrength,
    );
    expect(result.config.corridor.carpetEnabled).toBe(DEFAULT_GALLERY_CONFIG.corridor.carpetEnabled);
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
      sceneBackgroundColor: "#020202",
      sceneFogColor: "#090909",
      ceilingSpotsEnabled: true,
      ceilingSpotsColor: "#ffd2a2",
      ceilingSpotsIntensity: 1.8,
      artworkBacklightEnabled: true,
      artworkBacklightColor: "#ff9a55",
      artworkBacklightIntensity: 2.2,
      scrollStrength: 3,
      mobileDetailsOverlayEnabled: false,
      loopWhiteAfterEndWindow: 0.24,
      loopWhiteStartsBeforeEndWindow: 0.18,
      loopWhiteFadeOutRevealWindow: 0.2,
      loopWhiteFadeOutWindow: 0.44,
      loopProgressAdvanceDuringWhiteFadeOut: 0.19,
      artworkFocusFill: 0.68,
      artworkTurnSmoothness: 0.82,
      artworkTurnKeyframes: 7,
      artworkTurnLeadIn: 0.34,
      sceneTitleConfig: {
        maxWidth: 5.5,
        lineHeight: 1.4,
        daylightContrastEnabled: false,
        daylightContrastColor: "#17263b",
        daylightContrastStrength: 0.6,
      },
      corridor: {
        wallColor: "#ffffff",
        carpetEnabled: false,
        carpetColor: "#aa1010",
        carpetWidth: 0.64,
      },
    });

    expect(result.config.sceneTitle).toBe("Custom Title");
    expect(result.config.sceneBackgroundColor).toBe("#020202");
    expect(result.config.sceneFogColor).toBe("#090909");
    expect(result.config.ceilingSpotsEnabled).toBe(true);
    expect(result.config.ceilingSpotsColor).toBe("#ffd2a2");
    expect(result.config.ceilingSpotsIntensity).toBeCloseTo(1.8);
    expect(result.config.artworkBacklightEnabled).toBe(true);
    expect(result.config.artworkBacklightColor).toBe("#ff9a55");
    expect(result.config.artworkBacklightIntensity).toBeCloseTo(2.2);
    expect(result.config.scrollStrength).toBeCloseTo(3);
    expect(result.config.mobileDetailsOverlayEnabled).toBe(false);
    expect(result.config.loopWhiteAfterEndWindow).toBeCloseTo(0.24);
    expect(result.config.loopWhiteStartsBeforeEndWindow).toBeCloseTo(0.18);
    expect(result.config.loopWhiteFadeOutRevealWindow).toBeCloseTo(0.2);
    expect(result.config.loopWhiteFadeOutWindow).toBeCloseTo(0.44);
    expect(result.config.loopProgressAdvanceDuringWhiteFadeOut).toBeCloseTo(0.19);
    expect(result.config.artworkFocusFill).toBeCloseTo(0.68);
    expect(result.config.artworkTurnSmoothness).toBeCloseTo(0.82);
    expect(result.config.artworkTurnKeyframes).toBe(7);
    expect(result.config.artworkTurnLeadIn).toBeCloseTo(0.34);
    expect(result.config.sceneTitleConfig.maxWidth).toBeCloseTo(5.5);
    expect(result.config.sceneTitleConfig.lineHeight).toBeCloseTo(1.4);
    expect(result.config.sceneTitleConfig.daylightContrastEnabled).toBe(false);
    expect(result.config.sceneTitleConfig.daylightContrastColor).toBe("#17263b");
    expect(result.config.sceneTitleConfig.daylightContrastStrength).toBeCloseTo(0.6);
    expect(result.config.corridor.wallColor).toBe("#ffffff");
    expect(result.config.corridor.carpetEnabled).toBe(false);
    expect(result.config.corridor.carpetColor).toBe("#aa1010");
    expect(result.config.corridor.carpetWidth).toBeCloseTo(0.64);
    expect(result.config.corridor.width).toBe(DEFAULT_GALLERY_CONFIG.corridor.width);
  });

  it("clamps out-of-range scrollStrength values", () => {
    const low = validateGalleryConfig({ scrollStrength: 0 });
    const high = validateGalleryConfig({ scrollStrength: 10 });

    expect(low.config.scrollStrength).toBe(0.25);
    expect(high.config.scrollStrength).toBe(8);
  });

  it("clamps ceiling/artwork light intensities", () => {
    const low = validateGalleryConfig({
      ceilingSpotsIntensity: -1,
      artworkBacklightIntensity: -1,
    });
    const high = validateGalleryConfig({
      ceilingSpotsIntensity: 99,
      artworkBacklightIntensity: 99,
    });

    expect(low.config.ceilingSpotsIntensity).toBe(0);
    expect(low.config.artworkBacklightIntensity).toBe(0);
    expect(high.config.ceilingSpotsIntensity).toBe(4);
    expect(high.config.artworkBacklightIntensity).toBe(4);
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

  it("clamps carpet width to corridor bounds", () => {
    const low = validateGalleryConfig({
      corridor: {
        carpetWidth: 0,
      },
    });
    const high = validateGalleryConfig({
      corridor: {
        width: 6,
        carpetWidth: 99,
      },
    });

    expect(low.config.corridor.carpetWidth).toBeCloseTo(0.12);
    expect(high.config.corridor.carpetWidth).toBeCloseTo(5.65);
  });

  it("clamps out-of-range artworkTurnSmoothness values", () => {
    const low = validateGalleryConfig({ artworkTurnSmoothness: -1 });
    const high = validateGalleryConfig({ artworkTurnSmoothness: 2 });

    expect(low.config.artworkTurnSmoothness).toBe(0);
    expect(high.config.artworkTurnSmoothness).toBe(1);
  });

  it("clamps sceneTitle wrapping values", () => {
    const low = validateGalleryConfig({
      sceneTitleConfig: {
        maxWidth: 0,
        lineHeight: 0,
      },
    });
    const high = validateGalleryConfig({
      sceneTitleConfig: {
        maxWidth: 99,
        lineHeight: 99,
      },
    });

    expect(low.config.sceneTitleConfig.maxWidth).toBeCloseTo(0.8);
    expect(low.config.sceneTitleConfig.lineHeight).toBeCloseTo(0.8);
    expect(high.config.sceneTitleConfig.maxWidth).toBeCloseTo(40);
    expect(high.config.sceneTitleConfig.lineHeight).toBeCloseTo(2.4);
  });

  it("clamps sceneTitle daylight contrast strength", () => {
    const low = validateGalleryConfig({
      sceneTitleConfig: {
        daylightContrastStrength: -1,
      },
    });
    const high = validateGalleryConfig({
      sceneTitleConfig: {
        daylightContrastStrength: 99,
      },
    });

    expect(low.config.sceneTitleConfig.daylightContrastStrength).toBe(0);
    expect(high.config.sceneTitleConfig.daylightContrastStrength).toBe(1);
  });

  it("clamps and rounds artworkTurnKeyframes", () => {
    const low = validateGalleryConfig({ artworkTurnKeyframes: 0 });
    const high = validateGalleryConfig({ artworkTurnKeyframes: 99 });
    const rounded = validateGalleryConfig({ artworkTurnKeyframes: 4.7 });

    expect(low.config.artworkTurnKeyframes).toBe(1);
    expect(high.config.artworkTurnKeyframes).toBe(12);
    expect(rounded.config.artworkTurnKeyframes).toBe(5);
  });

  it("clamps artworkTurnLeadIn", () => {
    const low = validateGalleryConfig({ artworkTurnLeadIn: -1 });
    const high = validateGalleryConfig({ artworkTurnLeadIn: 2 });

    expect(low.config.artworkTurnLeadIn).toBe(0);
    expect(high.config.artworkTurnLeadIn).toBe(0.85);
  });

  it("supports legacy infiniteGallery flag as alias of infiniteCorridor", () => {
    const result = validateGalleryConfig({ infiniteGallery: true } as never);
    expect(result.config.infiniteCorridor).toBe(true);
    expect(result.warnings.some((warning) => warning.includes("infiniteGallery"))).toBe(true);
  });

  it("sanitizes artwork sideText and clamps its sizing values", () => {
    const result = validateGalleryConfig({
      artworks: [
        {
          id: "a-1",
          title: "A",
          imageUrl: "/images/work1.jpg",
          sideText: {
            eyebrow: "Eyebrow",
            title: "Side Title",
            description: "Desc",
            width: 99,
            height: 0,
            gap: -1,
            offsetY: 5,
            offsetZ: -9,
            align: "before",
            borderEnabled: true,
            borderColor: "#ff9933",
            borderIntensity: 9,
            borderWidth: 0,
          },
        },
      ],
    });

    const sideText = result.config.artworks[0].sideText;
    expect(sideText).toBeDefined();
    expect(sideText?.width).toBe(3.6);
    expect(sideText?.height).toBe(0.6);
    expect(sideText?.gap).toBe(0.08);
    expect(sideText?.offsetY).toBe(2);
    expect(sideText?.offsetZ).toBe(-3);
    expect(sideText?.align).toBe("before");
    expect(sideText?.borderEnabled).toBe(true);
    expect(sideText?.borderColor).toBe("#ff9933");
    expect(sideText?.borderIntensity).toBe(4);
    expect(sideText?.borderWidth).toBe(0.01);
  });
});
