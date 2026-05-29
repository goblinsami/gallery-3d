import { describe, expect, it, vi } from "vitest";
import { ScrollProgressController, type ScrollProgressState } from "../journey/scrollProgressController";

const createElementStub = (): HTMLElement =>
  ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as HTMLElement;

describe("ScrollProgressController loop phases", () => {
  it("emits clamped progress without white mix when loop is disabled", () => {
    const states: ScrollProgressState[] = [];
    const controller = new ScrollProgressController({
      element: createElementStub(),
      loop: false,
      onProgress: (state) => states.push(state),
    });

    controller.setProgress(1.4);
    controller.setProgress(-0.2);

    expect(states[0]).toEqual({ progress: 1, whiteMix: 0 });
    expect(states[1]).toEqual({ progress: 0, whiteMix: 0 });
  });

  it("supports early white lead-in while camera progress is still advancing", () => {
    const states: ScrollProgressState[] = [];
    const controller = new ScrollProgressController({
      element: createElementStub(),
      loop: true,
      loopWhiteAfterEndWindow: 0.2,
      loopWhiteStartsBeforeEndWindow: 0.2,
      loopWhiteFadeOutWindow: 0.3,
      loopWhiteFadeOutRevealWindow: 0.15,
      loopProgressAdvanceDuringWhiteFadeOut: 0.2,
      onProgress: (state) => states.push(state),
    });

    controller.setProgress(0.5);
    controller.setProgress(0.85);
    controller.setProgress(0.95);
    controller.setProgress(1.1);
    controller.setProgress(1.19);
    controller.setProgress(1.3);
    controller.setProgress(1.49);

    expect(states[0]).toEqual({ progress: 0.5, whiteMix: 0 });
    expect(states[1].progress).toBeCloseTo(0.85);
    expect(states[1].whiteMix).toBeGreaterThan(0);
    expect(states[1].whiteMix).toBeLessThan(1);
    expect(states[2].progress).toBeCloseTo(0.95);
    expect(states[2].whiteMix).toBeGreaterThan(states[1].whiteMix);
    expect(states[3].progress).toBe(1);
    expect(states[3].whiteMix).toBeGreaterThan(0.8);
    expect(states[3].whiteMix).toBeLessThan(1);
    expect(states[4].progress).toBe(1);
    expect(states[4].whiteMix).toBeGreaterThan(0.95);
    expect(states[4].whiteMix).toBeLessThanOrEqual(1);
    expect(states[5].progress).toBeGreaterThan(0);
    expect(states[5].progress).toBeLessThan(0.2);
    expect(states[5].whiteMix).toBeGreaterThan(0);
    expect(states[5].whiteMix).toBeLessThan(1);
    expect(states[6].progress).toBeGreaterThan(0.19);
    expect(states[6].progress).toBeLessThanOrEqual(0.2);
    expect(states[6].whiteMix).toBe(0);
  });

  it("does not wrap backward before first loop completion", () => {
    const states: ScrollProgressState[] = [];
    const controller = new ScrollProgressController({
      element: createElementStub(),
      loop: true,
      loopWhiteAfterEndWindow: 0.14,
      loopWhiteFadeOutWindow: 0.22,
      onProgress: (state) => states.push(state),
    });

    controller.setProgress(0);
    (controller as unknown as { running: boolean; velocity: number; tick: () => void }).running = true;
    (controller as unknown as { running: boolean; velocity: number; tick: () => void }).velocity = -0.4;
    (controller as unknown as { running: boolean; velocity: number; tick: () => void }).tick();

    expect(states[0]).toEqual({ progress: 0, whiteMix: 0 });
    expect(states[1].progress).toBe(0);
    expect(states[1].whiteMix).toBe(0);
  });

  it("keeps loop restart continuity after first full cycle", () => {
    const states: ScrollProgressState[] = [];
    const controller = new ScrollProgressController({
      element: createElementStub(),
      loop: true,
      loopWhiteAfterEndWindow: 0.1,
      loopWhiteFadeOutWindow: 0.2,
      loopProgressAdvanceDuringWhiteFadeOut: 0.18,
      onProgress: (state) => states.push(state),
    });

    const cycleLength = 1 + 0.1 + 0.2;
    controller.setProgress(cycleLength - 0.001);
    controller.setProgress(cycleLength);

    expect(states[0].progress).toBeGreaterThan(0.17);
    expect(states[1].progress).toBeGreaterThanOrEqual(0.17);
    expect(states[1].progress).toBeLessThanOrEqual(0.181);
  });
});
