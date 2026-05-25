import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { buildCameraKeyframes, calculateArtworkLayout } from "../journey/cameraKeyframes";

describe("buildCameraKeyframes", () => {
  it("includes intro/focus/return labels", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 2),
    };

    const layout = calculateArtworkLayout(config);
    const keyframes = buildCameraKeyframes(config, layout);
    const labels = keyframes.map((entry) => entry.label);

    expect(labels).toContain("intro-end");
    expect(labels).toContain("artwork-0-focus-in-end");
    expect(labels).toContain("artwork-0-return-end");
  });

  it("scales keyframe count with artwork count", () => {
    const oneArtworkConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const manyArtworkConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 4),
    };

    const keyframesA = buildCameraKeyframes(
      oneArtworkConfig,
      calculateArtworkLayout(oneArtworkConfig),
    );

    const keyframesB = buildCameraKeyframes(
      manyArtworkConfig,
      calculateArtworkLayout(manyArtworkConfig),
    );

    expect(keyframesB.length).toBeGreaterThan(keyframesA.length);
  });

  it("starts at progress 0 and ends at progress 1", () => {
    const layout = calculateArtworkLayout(DEFAULT_GALLERY_CONFIG);
    const keyframes = buildCameraKeyframes(DEFAULT_GALLERY_CONFIG, layout);

    expect(keyframes[0].progress).toBe(0);
    expect(keyframes[keyframes.length - 1].progress).toBe(1);
  });

  it("moves camera closer when artworkFocusFill is higher", () => {
    const closeConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkFocusFill: 0.9,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const farConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkFocusFill: 0.5,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const closeLayout = calculateArtworkLayout(closeConfig);
    const farLayout = calculateArtworkLayout(farConfig);

    const closeDistance = Math.abs(closeLayout[0].focusPosition[0] - closeLayout[0].focusTarget[0]);
    const farDistance = Math.abs(farLayout[0].focusPosition[0] - farLayout[0].focusTarget[0]);

    expect(closeDistance).toBeLessThan(farDistance);
  });

  it("adds more focus-turn keyframes when artworkTurnKeyframes is higher", () => {
    const lowTurnConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkTurnKeyframes: 2,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const highTurnConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkTurnKeyframes: 6,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const lowKeyframes = buildCameraKeyframes(lowTurnConfig, calculateArtworkLayout(lowTurnConfig));
    const highKeyframes = buildCameraKeyframes(highTurnConfig, calculateArtworkLayout(highTurnConfig));

    const lowTurnFrames = lowKeyframes.filter((entry) => entry.label.includes("focus-turn-"));
    const highTurnFrames = highKeyframes.filter((entry) => entry.label.includes("focus-turn-"));

    expect(highTurnFrames.length).toBeGreaterThan(lowTurnFrames.length);
  });

  it("adds turn lead-in keyframes when artworkTurnLeadIn is enabled", () => {
    const noLeadConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkTurnLeadIn: 0,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const withLeadConfig = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkTurnLeadIn: 0.35,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 1),
    };

    const noLeadKeyframes = buildCameraKeyframes(noLeadConfig, calculateArtworkLayout(noLeadConfig));
    const withLeadKeyframes = buildCameraKeyframes(withLeadConfig, calculateArtworkLayout(withLeadConfig));

    expect(noLeadKeyframes.some((entry) => entry.label.includes("turn-lead-start"))).toBe(false);
    expect(withLeadKeyframes.some((entry) => entry.label.includes("turn-lead-start"))).toBe(true);

    const leadStart = withLeadKeyframes.find((entry) => entry.label === "artwork-0-turn-lead-start");
    const travelEnd = withLeadKeyframes.find((entry) => entry.label === "artwork-0-travel-end");

    expect(leadStart).toBeDefined();
    expect(travelEnd).toBeDefined();
    expect(leadStart!.position[2]).toBeGreaterThan(travelEnd!.position[2]);
    expect(leadStart!.lookAt[0]).not.toBe(travelEnd!.lookAt[0]);
  });
});

