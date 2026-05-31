import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CONFIG } from "../config/defaultGalleryConfig";
import { buildCameraKeyframes, calculateArtworkLayout } from "../journey/cameraKeyframes";
import type { PositionedArtwork, PositionedStationalCard } from "../types/galleryRuntime";

const getArtworkLayout = (...args: Parameters<typeof calculateArtworkLayout>): PositionedArtwork[] =>
  calculateArtworkLayout(...args).filter(
    (item): item is PositionedArtwork => item.type !== "stational-card",
  );

const getStationalLayout = (...args: Parameters<typeof calculateArtworkLayout>): PositionedStationalCard[] =>
  calculateArtworkLayout(...args).filter(
    (item): item is PositionedStationalCard => item.type === "stational-card",
  );

describe("buildCameraKeyframes", () => {
  it("includes intro/focus/return labels", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: DEFAULT_GALLERY_CONFIG.artworks.slice(0, 2),
    };

    const layout = getArtworkLayout(config);
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
      getArtworkLayout(oneArtworkConfig),
    );

    const keyframesB = buildCameraKeyframes(
      manyArtworkConfig,
      getArtworkLayout(manyArtworkConfig),
    );

    expect(keyframesB.length).toBeGreaterThan(keyframesA.length);
  });

  it("starts at progress 0 and ends at progress 1", () => {
    const layout = getArtworkLayout(DEFAULT_GALLERY_CONFIG);
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

    const closeLayout = getArtworkLayout(closeConfig);
    const farLayout = getArtworkLayout(farConfig);

    const closeDistance = Math.abs(closeLayout[0].focusPosition[0] - closeLayout[0].focusTarget[0]);
    const farDistance = Math.abs(farLayout[0].focusPosition[0] - farLayout[0].focusTarget[0]);

    expect(closeDistance).toBeLessThan(farDistance);
  });

  it("moves camera farther on narrow viewport aspects to keep artwork in frame", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworks: [
        {
          ...DEFAULT_GALLERY_CONFIG.artworks[0],
          width: 2.8,
          height: 1.6,
          sideText: undefined,
        },
      ],
    };

    const wideLayout = getArtworkLayout(config, { viewportAspect: 16 / 9 });
    const narrowLayout = getArtworkLayout(config, { viewportAspect: 3 / 4 });

    const wideDistance = Math.abs(wideLayout[0].focusPosition[0] - wideLayout[0].focusTarget[0]);
    const narrowDistance = Math.abs(narrowLayout[0].focusPosition[0] - narrowLayout[0].focusTarget[0]);

    expect(narrowDistance).toBeGreaterThan(wideDistance);
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

    const lowKeyframes = buildCameraKeyframes(lowTurnConfig, getArtworkLayout(lowTurnConfig));
    const highKeyframes = buildCameraKeyframes(highTurnConfig, getArtworkLayout(highTurnConfig));

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

    const noLeadKeyframes = buildCameraKeyframes(noLeadConfig, getArtworkLayout(noLeadConfig));
    const withLeadKeyframes = buildCameraKeyframes(withLeadConfig, getArtworkLayout(withLeadConfig));

    expect(noLeadKeyframes.some((entry) => entry.label.includes("turn-lead-start"))).toBe(false);
    expect(withLeadKeyframes.some((entry) => entry.label.includes("turn-lead-start"))).toBe(true);

    const leadStart = withLeadKeyframes.find((entry) => entry.label === "artwork-0-turn-lead-start");
    const travelEnd = withLeadKeyframes.find((entry) => entry.label === "artwork-0-travel-end");

    expect(leadStart).toBeDefined();
    expect(travelEnd).toBeDefined();
    expect(leadStart!.position[2]).toBeGreaterThan(travelEnd!.position[2]);
    expect(leadStart!.lookAt[0]).not.toBe(travelEnd!.lookAt[0]);
  });

  it("skips turn keyframes for stational cards and pushes through the card", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      artworkTurnKeyframes: 8,
      artworkTurnLeadIn: 0.45,
      items: [
        {
          id: "station-01",
          type: "stational-card" as const,
          title: "Station",
        },
      ],
      artworks: [],
    };

    const stationalLayout = getStationalLayout(config);
    const station = stationalLayout[0];
    const stationDepth = station.depth ?? 0;
    const keyframes = buildCameraKeyframes(config, stationalLayout);

    expect(station).toBeDefined();
    expect(keyframes.some((entry) => entry.label.includes("turn-lead-start"))).toBe(false);
    expect(keyframes.some((entry) => entry.label.includes("focus-turn-"))).toBe(false);

    const focusInEnd = keyframes.find((entry) => entry.label === "artwork-0-focus-in-end");
    expect(focusInEnd).toBeDefined();
    expect(focusInEnd!.position[2]).toBeLessThan(station.position[2] - stationDepth / 2);
  });

  it("keeps forward cadence after stational card pass-through", () => {
    const config = {
      ...DEFAULT_GALLERY_CONFIG,
      corridor: {
        ...DEFAULT_GALLERY_CONFIG.corridor,
        artworkSpacing: 14,
      },
      items: [
        {
          id: "station-01",
          type: "stational-card" as const,
          title: "Station",
        },
        {
          ...DEFAULT_GALLERY_CONFIG.artworks[0],
          id: "work-after-station",
          type: "artwork" as const,
          side: "left" as const,
        },
      ],
      artworks: [
        {
          ...DEFAULT_GALLERY_CONFIG.artworks[0],
          id: "work-after-station",
          side: "left" as const,
        },
      ],
    };

    const layout = calculateArtworkLayout(config);
    const keyframes = buildCameraKeyframes(config, layout);
    const focusInEnd = keyframes.find((entry) => entry.label === "artwork-0-focus-in-end");
    const returnEnd = keyframes.find((entry) => entry.label === "artwork-0-return-end");

    expect(focusInEnd).toBeDefined();
    expect(returnEnd).toBeDefined();
    const forwardAdvance = focusInEnd!.position[2] - returnEnd!.position[2];
    expect(forwardAdvance).toBeGreaterThanOrEqual(config.corridor.artworkSpacing * 0.14);
  });
});

