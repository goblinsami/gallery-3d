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
    const isStationalCard = item.type === "stational-card";
    const travelWeight = isStationalCard
      ? timings.travelDuration * 1.12
      : timings.travelDuration;
    const focusWeight = isStationalCard
      ? timings.focusDuration * 0.5
      : timings.focusDuration;
    const returnWeight = isStationalCard
      ? timings.returnDuration * 0.68
      : timings.returnDuration;
    const focusInShare = isStationalCard ? 0.96 : 0.45;
    const focusHoldShare = 1 - focusInShare;

    segments.push(
      { label: `artwork-${item.index}-travel`, weight: travelWeight },
      { label: `artwork-${item.index}-focus-in`, weight: focusWeight * focusInShare },
      { label: `artwork-${item.index}-focus-hold`, weight: focusWeight * focusHoldShare },
      { label: `artwork-${item.index}-return`, weight: returnWeight },
    );
  }

  segments.push({ label: "outro", weight: timings.travelDuration * 0.65 });
  return toTimeline(segments);
};

