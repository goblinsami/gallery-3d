import { gsap } from "gsap";
import { clamp } from "../utils/clamp";

export interface ScrollProgressState {
  progress: number;
  whiteMix: number;
}

export interface ScrollProgressControllerOptions {
  element: HTMLElement;
  initialProgress?: number;
  sensitivity?: number;
  smoothing?: number;
  damping?: number;
  loop?: boolean;
  loopWhiteAfterEndWindow?: number;
  loopWhiteStartsBeforeEndWindow?: number;
  loopWhiteFadeOutWindow?: number;
  loopWhiteFadeOutRevealWindow?: number;
  loopProgressAdvanceDuringWhiteFadeOut?: number;
  onProgress: (state: ScrollProgressState) => void;
}

const EMIT_PROGRESS_EPSILON = 0.000001;
const EMIT_WHITE_MIX_EPSILON = 0.000001;

export class ScrollProgressController {
  private readonly element: HTMLElement;
  private readonly onProgress: (state: ScrollProgressState) => void;
  private sensitivity: number;
  private readonly smoothing: number;
  private readonly damping: number;
  private loop: boolean;
  private loopWhiteAfterEndWindow: number;
  private loopWhiteStartsBeforeEndWindow: number;
  private loopWhiteFadeOutWindow: number;
  private loopWhiteFadeOutRevealWindow: number;
  private loopProgressAdvanceDuringWhiteFadeOut: number;
  private hasCompletedInitialLoop = false;
  private interactionEnabled = true;

  private running = false;
  private velocity = 0;
  private progress = 0;
  private targetProgress = 0;
  private activeTouchId: number | null = null;
  private lastTouchY: number | null = null;
  private lastEmittedState: ScrollProgressState | null = null;
  private readonly smoothstep = (value: number): number => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  private readonly wrap = (value: number, modulus: number): number =>
    ((value % modulus) + modulus) % modulus;
  private mapLoopCycleToJourneyProgress = (cycleProgress: number): number => {
    const clampedCycleProgress = clamp(cycleProgress, 0, 1);
    if (!this.hasCompletedInitialLoop) {
      return clampedCycleProgress;
    }

    const loopOffset = clamp(this.loopProgressAdvanceDuringWhiteFadeOut, 0, 0.45);
    return clamp(loopOffset + clampedCycleProgress * (1 - loopOffset), 0, 1);
  };

  private readonly toPixelDelta = (event: WheelEvent): number => {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return event.deltaY * 16;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return event.deltaY * window.innerHeight * 0.85;
    }

    return event.deltaY;
  };

  private readonly normalizePixelDelta = (pixelDelta: number): number => {
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

  private readonly normalizeWheelDelta = (event: WheelEvent): number => {
    return this.normalizePixelDelta(this.toPixelDelta(event));
  };

  private readonly onWheel = (event: WheelEvent): void => {
    if (!this.interactionEnabled) {
      return;
    }

    if (event.ctrlKey) {
      return;
    }

    event.preventDefault();
    const normalizedDelta = this.normalizeWheelDelta(event);
    this.velocity += normalizedDelta * this.sensitivity;
  };

  private readonly onTouchStart = (event: TouchEvent): void => {
    if (!this.interactionEnabled) {
      this.activeTouchId = null;
      this.lastTouchY = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    this.activeTouchId = touch.identifier;
    this.lastTouchY = touch.clientY;
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    if (!this.interactionEnabled) {
      return;
    }

    if (this.lastTouchY === null) {
      return;
    }

    const touches = Array.from(event.touches);
    if (touches.length === 0) {
      return;
    }

    const trackedTouch =
      touches.find((touch) => touch.identifier === this.activeTouchId) ?? touches[0];

    if (event.cancelable) {
      event.preventDefault();
    }

    const pixelDelta = this.lastTouchY - trackedTouch.clientY;
    this.lastTouchY = trackedTouch.clientY;
    this.activeTouchId = trackedTouch.identifier;

    const normalizedDelta = this.normalizePixelDelta(pixelDelta);
    this.velocity += normalizedDelta * this.sensitivity;
  };

  private readonly onTouchEnd = (event: TouchEvent): void => {
    if (!this.interactionEnabled) {
      this.activeTouchId = null;
      this.lastTouchY = null;
      return;
    }

    const touches = Array.from(event.touches);
    if (touches.length === 0) {
      this.activeTouchId = null;
      this.lastTouchY = null;
      return;
    }

    const trackedTouch =
      touches.find((touch) => touch.identifier === this.activeTouchId) ?? touches[0];
    this.activeTouchId = trackedTouch.identifier;
    this.lastTouchY = trackedTouch.clientY;
  };

  private readonly onTouchCancel = (): void => {
    this.activeTouchId = null;
    this.lastTouchY = null;
  };

  constructor(options: ScrollProgressControllerOptions) {
    this.element = options.element;
    this.onProgress = options.onProgress;
    this.sensitivity = clamp(options.sensitivity ?? 0.00025, 0.00005, 0.01);
    this.smoothing = options.smoothing ?? 0.18;
    this.damping = options.damping ?? 0.86;
    this.loop = options.loop ?? false;
    this.loopWhiteAfterEndWindow = clamp(options.loopWhiteAfterEndWindow ?? 0.09, 0.02, 0.45);
    this.loopWhiteStartsBeforeEndWindow = clamp(options.loopWhiteStartsBeforeEndWindow ?? 0.12, 0, 0.45);
    this.loopWhiteFadeOutWindow = clamp(options.loopWhiteFadeOutWindow ?? 0.34, 0.05, 0.6);
    this.loopWhiteFadeOutRevealWindow = clamp(options.loopWhiteFadeOutRevealWindow ?? 0.16, 0.03, 0.45);
    this.loopProgressAdvanceDuringWhiteFadeOut = clamp(
      options.loopProgressAdvanceDuringWhiteFadeOut ?? 0.14,
      0,
      0.45,
    );
    const initialProgress = options.initialProgress ?? 0;
    const cycleLength = this.getLoopCycleLength();
    this.hasCompletedInitialLoop = this.loop && initialProgress >= cycleLength - 0.000001;
    this.progress = this.loop
      ? this.hasCompletedInitialLoop
        ? this.wrap(initialProgress, cycleLength)
        : clamp(initialProgress, 0, cycleLength)
      : clamp(initialProgress, 0, 1);
    this.targetProgress = this.progress;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.element.addEventListener("wheel", this.onWheel, { passive: false });
    this.element.addEventListener("touchstart", this.onTouchStart, { passive: true });
    this.element.addEventListener("touchmove", this.onTouchMove, { passive: false });
    this.element.addEventListener("touchend", this.onTouchEnd, { passive: true });
    this.element.addEventListener("touchcancel", this.onTouchCancel, { passive: true });
    gsap.ticker.add(this.tick);
  }

  setProgress(progress: number): void {
    const normalized = this.loop
      ? this.normalizeLoopProgress(progress)
      : clamp(progress, 0, 1);
    this.progress = normalized;
    this.targetProgress = normalized;
    this.velocity = 0;
    this.emitCurrentState();
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = clamp(sensitivity, 0.00005, 0.01);
  }

  setLoopTransitionWindows(
    whiteAfterEndWindow: number,
    whiteStartsBeforeEndWindow: number,
    whiteFadeOutWindow: number,
    whiteFadeOutRevealWindow: number,
    progressAdvanceDuringWhiteFadeOut: number,
  ): void {
    this.loopWhiteAfterEndWindow = clamp(whiteAfterEndWindow, 0.02, 0.45);
    this.loopWhiteStartsBeforeEndWindow = clamp(whiteStartsBeforeEndWindow, 0, 0.45);
    this.loopWhiteFadeOutWindow = clamp(whiteFadeOutWindow, 0.05, 0.6);
    this.loopWhiteFadeOutRevealWindow = clamp(whiteFadeOutRevealWindow, 0.03, 0.45);
    this.loopProgressAdvanceDuringWhiteFadeOut = clamp(progressAdvanceDuringWhiteFadeOut, 0, 0.45);
    this.progress = this.loop ? this.normalizeLoopProgress(this.progress) : clamp(this.progress, 0, 1);
    this.targetProgress = this.loop
      ? this.normalizeLoopProgress(this.targetProgress)
      : clamp(this.targetProgress, 0, 1);
    this.emitCurrentState();
  }

  setLoop(loop: boolean): void {
    if (this.loop === loop) {
      return;
    }

    this.loop = loop;
    if (!this.loop) {
      this.hasCompletedInitialLoop = false;
    }
    const normalized = this.loop ? this.normalizeLoopProgress(this.progress) : clamp(this.progress, 0, 1);
    this.progress = normalized;
    this.targetProgress = normalized;
    this.velocity = 0;
    this.emitCurrentState();
  }

  setInteractionEnabled(enabled: boolean): void {
    if (this.interactionEnabled === enabled) {
      return;
    }

    this.interactionEnabled = enabled;
    if (!enabled) {
      this.velocity = 0;
      this.targetProgress = this.progress;
      this.activeTouchId = null;
      this.lastTouchY = null;
    }
  }

  dispose(): void {
    this.running = false;
    this.element.removeEventListener("wheel", this.onWheel);
    this.element.removeEventListener("touchstart", this.onTouchStart);
    this.element.removeEventListener("touchmove", this.onTouchMove);
    this.element.removeEventListener("touchend", this.onTouchEnd);
    this.element.removeEventListener("touchcancel", this.onTouchCancel);
    gsap.ticker.remove(this.tick);
  }

  private tick = (): void => {
    if (!this.running) {
      return;
    }

    if (this.loop) {
      const cycleLength = this.getLoopCycleLength();
      const nextTarget = this.targetProgress + this.velocity;

      this.targetProgress = this.hasCompletedInitialLoop ? nextTarget : Math.max(0, nextTarget);

      if (!this.hasCompletedInitialLoop && this.targetProgress >= cycleLength - 0.000001) {
        this.hasCompletedInitialLoop = true;
      }
    } else {
      this.targetProgress = clamp(this.targetProgress + this.velocity, 0, 1);
    }
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
        const cycleLength = this.getLoopCycleLength();
        const delta = this.progress - this.targetProgress;
        const wrappedTarget = this.wrap(this.targetProgress, cycleLength);
        this.targetProgress = wrappedTarget;
        this.progress = wrappedTarget + delta;
      }

      this.emitCurrentState();
      return;
    }

    this.emitCurrentState();
  };

  private getLoopCycleLength(): number {
    return 1 + this.loopWhiteAfterEndWindow + this.loopWhiteFadeOutWindow;
  }

  private normalizeLoopProgress(progress: number): number {
    const cycleLength = this.getLoopCycleLength();
    if (progress >= cycleLength - 0.000001) {
      this.hasCompletedInitialLoop = true;
    }

    return this.hasCompletedInitialLoop
      ? this.wrap(progress, cycleLength)
      : clamp(progress, 0, cycleLength);
  }

  private resolveProgressState(rawProgress: number): ScrollProgressState {
    if (!this.loop) {
      return {
        progress: clamp(rawProgress, 0, 1),
        whiteMix: 0,
      };
    }

    const whiteInWindow = Math.max(0.0001, this.loopWhiteAfterEndWindow);
    const whiteLeadWindow = clamp(this.loopWhiteStartsBeforeEndWindow, 0, 0.45);
    const whiteOutWindow = Math.max(0.0001, this.loopWhiteFadeOutWindow);
    const cycleLength = this.getLoopCycleLength();
    const cycleProgress = this.wrap(rawProgress, cycleLength);
    const whiteInEnd = 1 + whiteInWindow;
    const leadStart = Math.max(0, 1 - whiteLeadWindow);
    const whiteInTotalWindow = Math.max(0.0001, whiteLeadWindow + whiteInWindow);

    if (cycleProgress <= whiteInEnd) {
      const mappedCycleProgress = cycleProgress <= 1
        ? this.mapLoopCycleToJourneyProgress(cycleProgress)
        : 1;

      if (whiteLeadWindow > 0 && cycleProgress >= leadStart) {
        const phase = clamp((cycleProgress - leadStart) / whiteInTotalWindow, 0, 1);
        return {
          progress: mappedCycleProgress,
          whiteMix: this.smoothstep(phase),
        };
      }

      return {
        progress: mappedCycleProgress,
        whiteMix: cycleProgress <= 1 ? 0 : this.smoothstep(clamp((cycleProgress - 1) / whiteInWindow, 0, 1)),
      };
    }

    const phaseOut = clamp((cycleProgress - whiteInEnd) / whiteOutWindow, 0, 1);
    const revealRatio = clamp(this.loopWhiteFadeOutRevealWindow / whiteOutWindow, 0.1, 1);
    const fadeOutPhase = clamp(phaseOut / revealRatio, 0, 1);
    const whiteMix = 1 - this.smoothstep(fadeOutPhase);
    const restartProgress = this.loopProgressAdvanceDuringWhiteFadeOut * this.smoothstep(phaseOut);

    return {
      progress: clamp(restartProgress, 0, 1),
      whiteMix: clamp(whiteMix, 0, 1),
    };
  }

  private emitCurrentState(): void {
    const state = this.resolveProgressState(this.progress);
    if (
      this.lastEmittedState &&
      Math.abs(state.progress - this.lastEmittedState.progress) <= EMIT_PROGRESS_EPSILON &&
      Math.abs(state.whiteMix - this.lastEmittedState.whiteMix) <= EMIT_WHITE_MIX_EPSILON
    ) {
      return;
    }

    this.lastEmittedState = state;
    this.onProgress(state);
  }
}
