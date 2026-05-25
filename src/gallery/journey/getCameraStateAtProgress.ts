import type { CameraKeyframe, CameraState } from "../types/galleryRuntime";
import { clamp } from "../utils/clamp";
import { inverseLerp, lerp, lerpVec3, smoothstep } from "../utils/math";

const resolveActiveArtwork = (
  lower: CameraKeyframe,
  upper: CameraKeyframe,
  t: number,
): number | null => {
  if (lower.activeArtworkIndex === upper.activeArtworkIndex) {
    return lower.activeArtworkIndex;
  }

  return t < 0.5 ? lower.activeArtworkIndex : upper.activeArtworkIndex;
};

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
    };
  }

  const last = keyframes[keyframes.length - 1];
  if (clampedProgress >= last.progress) {
    return {
      position: last.position,
      lookAt: last.lookAt,
      titleOpacity: last.titleOpacity,
      activeArtworkIndex: last.activeArtworkIndex,
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
  const easedT = smoothstep(linearT);

  return {
    position: lerpVec3(lower.position, upper.position, easedT),
    lookAt: lerpVec3(lower.lookAt, upper.lookAt, easedT),
    titleOpacity: lerp(lower.titleOpacity, upper.titleOpacity, easedT),
    activeArtworkIndex: resolveActiveArtwork(lower, upper, linearT),
  };
};

