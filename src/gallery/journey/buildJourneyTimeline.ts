import type { GalleryTimingsConfig } from "../types/galleryConfig";
import type { JourneyTimeline } from "../types/galleryRuntime";

interface SegmentInput {
  label: string;
  weight: number;
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
  artworkCount: number,
): JourneyTimeline => {
  const segments: SegmentInput[] = [{ label: "intro", weight: timings.introDuration }];

  for (let i = 0; i < artworkCount; i += 1) {
    segments.push(
      { label: `artwork-${i}-travel`, weight: timings.travelDuration },
      { label: `artwork-${i}-focus-in`, weight: timings.focusDuration * 0.45 },
      { label: `artwork-${i}-focus-hold`, weight: timings.focusDuration * 0.55 },
      { label: `artwork-${i}-return`, weight: timings.returnDuration },
    );
  }

  segments.push({ label: "outro", weight: timings.travelDuration * 0.65 });
  return toTimeline(segments);
};

