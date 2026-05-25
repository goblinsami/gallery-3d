import { gsap } from "gsap";
import { clamp } from "../utils/clamp";

export interface ScrollProgressControllerOptions {
  element: HTMLElement;
  initialProgress?: number;
  sensitivity?: number;
  smoothing?: number;
  damping?: number;
  loop?: boolean;
  onProgress: (progress: number) => void;
}

export class ScrollProgressController {
  private readonly element: HTMLElement;
  private readonly onProgress: (progress: number) => void;
  private sensitivity: number;
  private readonly smoothing: number;
  private readonly damping: number;
  private loop: boolean;

  private running = false;
  private velocity = 0;
  private progress = 0;
  private targetProgress = 0;
  private readonly wrap01 = (value: number): number => ((value % 1) + 1) % 1;

  private readonly toPixelDelta = (event: WheelEvent): number => {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return event.deltaY * 16;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return event.deltaY * window.innerHeight * 0.85;
    }

    return event.deltaY;
  };

  private readonly normalizeWheelDelta = (event: WheelEvent): number => {
    const pixelDelta = this.toPixelDelta(event);
    if (!Number.isFinite(pixelDelta)) {
      return 0;
    }

    // 100px is a common mouse wheel notch magnitude. We normalize everything to that.
    const rawUnits = pixelDelta / 100;
    const absUnits = Math.abs(rawUnits);
    const compressed =
      absUnits <= 1 ? rawUnits : Math.sign(rawUnits) * (1 + Math.log10(Math.max(1, absUnits)));

    return clamp(compressed, -4, 4);
  };

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (event.ctrlKey) {
      return;
    }

    const normalizedDelta = this.normalizeWheelDelta(event);
    this.velocity += normalizedDelta * this.sensitivity;
  };

  constructor(options: ScrollProgressControllerOptions) {
    this.element = options.element;
    this.onProgress = options.onProgress;
    this.sensitivity = clamp(options.sensitivity ?? 0.00025, 0.00005, 0.01);
    this.smoothing = options.smoothing ?? 0.18;
    this.damping = options.damping ?? 0.86;
    this.loop = options.loop ?? false;
    this.progress = this.loop
      ? this.wrap01(options.initialProgress ?? 0)
      : clamp(options.initialProgress ?? 0, 0, 1);
    this.targetProgress = this.progress;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.element.addEventListener("wheel", this.onWheel, { passive: false });
    gsap.ticker.add(this.tick);
  }

  setProgress(progress: number): void {
    const normalized = this.loop ? this.wrap01(progress) : clamp(progress, 0, 1);
    this.progress = normalized;
    this.targetProgress = normalized;
    this.velocity = 0;
    this.onProgress(normalized);
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = clamp(sensitivity, 0.00005, 0.01);
  }

  setLoop(loop: boolean): void {
    if (this.loop === loop) {
      return;
    }

    this.loop = loop;
    const normalized = this.loop ? this.wrap01(this.progress) : clamp(this.progress, 0, 1);
    this.progress = normalized;
    this.targetProgress = normalized;
    this.velocity = 0;
    this.onProgress(normalized);
  }

  dispose(): void {
    this.running = false;
    this.element.removeEventListener("wheel", this.onWheel);
    gsap.ticker.remove(this.tick);
  }

  private tick = (): void => {
    if (!this.running) {
      return;
    }

    this.targetProgress = this.loop
      ? this.targetProgress + this.velocity
      : clamp(this.targetProgress + this.velocity, 0, 1);
    this.velocity *= this.damping;

    if (Math.abs(this.velocity) < 0.00001) {
      this.velocity = 0;
    }

    this.progress += (this.targetProgress - this.progress) * this.smoothing;

    if (Math.abs(this.targetProgress - this.progress) < 0.000001) {
      this.progress = this.targetProgress;
    }

    if (this.loop) {
      // Keep values bounded while preserving interpolation continuity across cycles.
      if (Math.abs(this.progress) > 1000 || Math.abs(this.targetProgress) > 1000) {
        const delta = this.progress - this.targetProgress;
        const wrappedTarget = this.wrap01(this.targetProgress);
        this.targetProgress = wrappedTarget;
        this.progress = wrappedTarget + delta;
      }

      this.onProgress(this.wrap01(this.progress));
      return;
    }

    this.onProgress(clamp(this.progress, 0, 1));
  };
}
