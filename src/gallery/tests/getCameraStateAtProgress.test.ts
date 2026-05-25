import { describe, expect, it } from "vitest";
import type { CameraKeyframe } from "../types/galleryRuntime";
import { getCameraStateAtProgress } from "../journey/getCameraStateAtProgress";

const keyframes: CameraKeyframe[] = [
  {
    progress: 0,
    position: [0, 1, 10],
    lookAt: [0, 1, 0],
    titleOpacity: 1,
    activeArtworkIndex: null,
    label: "start",
  },
  {
    progress: 1,
    position: [0, 1, -20],
    lookAt: [0, 1, -30],
    titleOpacity: 0,
    activeArtworkIndex: 3,
    label: "end",
  },
];

describe("getCameraStateAtProgress", () => {
  it("returns start state for progress below 0", () => {
    const state = getCameraStateAtProgress(keyframes, -0.3);
    expect(state.position).toEqual([0, 1, 10]);
    expect(state.titleOpacity).toBe(1);
  });

  it("returns end state for progress above 1", () => {
    const state = getCameraStateAtProgress(keyframes, 1.2);
    expect(state.position).toEqual([0, 1, -20]);
    expect(state.titleOpacity).toBe(0);
  });

  it("interpolates values at mid progress", () => {
    const state = getCameraStateAtProgress(keyframes, 0.5);
    expect(state.position[2]).toBeCloseTo(-5);
    expect(state.lookAt[2]).toBeCloseTo(-15);
    expect(state.titleOpacity).toBeCloseTo(0.5);
  });
});

