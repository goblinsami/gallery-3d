import type { CameraKeyframe, CameraState } from "../types/galleryRuntime";
import { clamp } from "../utils/clamp";
import { inverseLerp, lerp, lerpVec3, smoothstep } from "../utils/math";

const INTRO_BLEND_LINEARITY = 0.65;

const getFrameActiveIndex = (frame: CameraKeyframe): number | null =>
  frame.activeItemIndex ?? frame.activeArtworkIndex;

const resolveActiveItem = (
  lower: CameraKeyframe,
  upper: CameraKeyframe,
  t: number,
): number | null => {
  const lowerIndex = getFrameActiveIndex(lower);
  const upperIndex = getFrameActiveIndex(upper);
  if (lowerIndex === upperIndex) {
    return lowerIndex;
  }

  return t < 0.5 ? lowerIndex : upperIndex;
};

const isIntroToFirstArtworkBlend = (lower: CameraKeyframe, upper: CameraKeyframe): boolean =>
  (lower.label === "start" && upper.label === "intro-end") ||
  (lower.label === "intro-end" && upper.label === "artwork-0-travel-end");

const isTurnAlignmentLabel = (label: string): boolean =>
  label.includes("turn-lead-start") ||
  label.includes("travel-end") ||
  label.includes("focus-turn-") ||
  label.includes("focus-in-end");

const isTurnAlignmentBlend = (lower: CameraKeyframe, upper: CameraKeyframe): boolean =>
  isTurnAlignmentLabel(lower.label) || isTurnAlignmentLabel(upper.label);

export const getCameraStateAtProgress = (
  keyframes: CameraKeyframe[],
  progress: number,
): CameraState => {
  if (keyframes.length === 0) {
    throw new Error("Cannot resolve camera state without keyframes.");
  }

  const clampedProgress = clamp(progress, 0, 1);

  if (clampedProgress <= keyframes[0].progress) {
    const frame = keyframes[0];
    return {
      position: frame.position,
      lookAt: frame.lookAt,
      titleOpacity: frame.titleOpacity,
      activeArtworkIndex: frame.activeArtworkIndex,
      activeItemIndex: getFrameActiveIndex(frame),
    };
  }

  const last = keyframes[keyframes.length - 1];
  if (clampedProgress >= last.progress) {
    return {
      position: last.position,
      lookAt: last.lookAt,
      titleOpacity: last.titleOpacity,
      activeArtworkIndex: last.activeArtworkIndex,
      activeItemIndex: getFrameActiveIndex(last),
    };
  }

  let lower = keyframes[0];
  let upper = keyframes[keyframes.length - 1];

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index];
    const next = keyframes[index + 1];

    if (clampedProgress >= current.progress && clampedProgress <= next.progress) {
      lower = current;
      upper = next;
      break;
    }
  }

  const linearT = inverseLerp(lower.progress, upper.progress, clampedProgress);
  const smoothT = smoothstep(linearT);
  const easedT = isTurnAlignmentBlend(lower, upper)
    ? linearT
    : isIntroToFirstArtworkBlend(lower, upper)
      ? lerp(smoothT, linearT, INTRO_BLEND_LINEARITY)
      : smoothT;

  return {
    position: lerpVec3(lower.position, upper.position, easedT),
    lookAt: lerpVec3(lower.lookAt, upper.lookAt, easedT),
    titleOpacity: lerp(lower.titleOpacity, upper.titleOpacity, easedT),
    activeArtworkIndex: resolveActiveItem(lower, upper, linearT),
    activeItemIndex: resolveActiveItem(lower, upper, linearT),
  };
};

