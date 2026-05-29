import type { GalleryTimingsConfig } from "../types/galleryConfig";
import type { JourneyTimeline } from "../types/galleryRuntime";

interface SegmentInput {
  label: string;
  weight: number;
}

export interface JourneyItemDescriptor {
  index: number;
  type: "artwork" | "stational-card";
}

const toTimeline = (segments: SegmentInput[]): JourneyTimeline => {
  const totalWeight = segments.reduce((total, segment) => total + segment.weight, 0);
  let cursor = 0;

  return {
    totalWeight,
    segments: segments.map((segment) => {
      const start = cursor / totalWeight;
      cursor += segment.weight;
      const end = cursor / totalWeight;
      return {
        label: segment.label,
        start,
        end,
      };
    }),
  };
};

export const buildJourneyTimeline = (
  timings: GalleryTimingsConfig,
  items: JourneyItemDescriptor[],
): JourneyTimeline => {
  const segments: SegmentInput[] = [{ label: "intro", weight: timings.introDuration }];

  for (const item of items) {
    const travelWeight = item.type === "stational-card"
      ? timings.travelDuration * 1.2
      : timings.travelDuration;
    const focusWeight = item.type === "stational-card"
      ? timings.focusDuration * 1.35
      : timings.focusDuration;
    const returnWeight = item.type === "stational-card"
      ? timings.returnDuration * 1.15
      : timings.returnDuration;

    segments.push(
      { label: `artwork-${item.index}-travel`, weight: travelWeight },
      { label: `artwork-${item.index}-focus-in`, weight: focusWeight * 0.45 },
      { label: `artwork-${item.index}-focus-hold`, weight: focusWeight * 0.55 },
      { label: `artwork-${item.index}-return`, weight: returnWeight },
    );
  }

  segments.push({ label: "outro", weight: timings.travelDuration * 0.65 });
  return toTimeline(segments);
};

