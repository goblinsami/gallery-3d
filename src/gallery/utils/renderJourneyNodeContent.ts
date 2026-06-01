import type {
  ArtworkConfig,
  GalleryItem,
  StationalCardConfig,
  StationalCardCta,
  StationalCardSocialLink,
} from "../types/galleryConfig";
import { isStationalCard } from "./galleryItems";

export type JourneyNodeType = "ArtworkNode" | "StationalNode";

export interface JourneyNode {
  id: string;
  index: number;
  total: number;
  type: JourneyNodeType;
  item: GalleryItem;
}

export interface JourneyNodeContentSection {
  id: string;
  title: string;
  lines: string[];
}

export interface RenderedJourneyNodeContent {
  node: JourneyNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  contactLines: string[];
  socialLinks: StationalCardSocialLink[];
  cta?: StationalCardCta;
  sections: JourneyNodeContentSection[];
  progressLabel: string;
}

const VARIANT_LABELS: Record<NonNullable<StationalCardConfig["variant"]>, string> = {
  about: "About",
  contact: "Contact",
  manifesto: "Manifesto",
  services: "Services",
  awards: "Awards",
  testimonial: "Testimonial",
  cta: "Call To Action",
  custom: "Station",
};

const clean = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const cleanAssetUrl = (value: string | undefined): string | undefined => {
  const cleaned = clean(value);
  if (!cleaned) {
    return undefined;
  }

  const lowered = cleaned.toLowerCase();
  if (lowered === "undefined" || lowered === "null") {
    return undefined;
  }

  return cleaned;
};

const toNonEmptyLines = (values: Array<string | undefined>): string[] =>
  values.filter((entry): entry is string => Boolean(entry && entry.trim().length > 0));

const toNonEmptyList = (values: string[] | undefined): string[] =>
  Array.isArray(values)
    ? values
        .map((entry) => clean(entry))
        .filter((entry): entry is string => Boolean(entry))
    : [];

const toProgressLabel = (index: number, total: number): string => {
  const safeTotal = Math.max(1, Math.round(total));
  const safeIndex = Math.max(0, Math.min(safeTotal - 1, Math.round(index)));
  return `${safeIndex + 1} / ${safeTotal}`;
};

const toJourneyNode = (
  item: GalleryItem,
  index: number,
  total: number,
): JourneyNode => {
  const clampedIndex = Math.max(0, Math.round(index));
  const safeTotal = Math.max(1, Math.round(total));
  return {
    id: item.id,
    index: clampedIndex,
    total: safeTotal,
    type: isStationalCard(item) ? "StationalNode" : "ArtworkNode",
    item,
  };
};

const renderArtworkNodeContent = (
  node: JourneyNode,
  artwork: ArtworkConfig,
): RenderedJourneyNodeContent => {
  const metadataArtist = clean(artwork.metadata?.artist);
  const metadataMedium = clean(artwork.metadata?.medium);
  const metadataYear = clean(artwork.metadata?.year);
  const tags = toNonEmptyList(artwork.metadata?.tags);
  const subtitleParts = toNonEmptyLines([metadataMedium, metadataYear]);
  const detailLines = toNonEmptyLines([
    metadataArtist ? `Artist: ${metadataArtist}` : undefined,
    metadataMedium ? `Category: ${metadataMedium}` : undefined,
    metadataYear ? `Year: ${metadataYear}` : undefined,
  ]);
  const sections: JourneyNodeContentSection[] = [];

  if (detailLines.length > 0) {
    sections.push({
      id: "details",
      title: "Details",
      lines: detailLines,
    });
  }

  if (tags.length > 0) {
    sections.push({
      id: "tags",
      title: "Tags",
      lines: tags,
    });
  }

  return {
    node,
    eyebrow: clean(artwork.sideText?.eyebrow) ?? "Artwork",
    title: clean(artwork.title) ?? "Untitled",
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined,
    description: clean(artwork.description) ?? clean(artwork.sideText?.description),
    thumbnailUrl: cleanAssetUrl(artwork.imageUrl),
    contactLines: [],
    socialLinks: [],
    cta: undefined,
    sections,
    progressLabel: toProgressLabel(node.index, node.total),
  };
};

const renderStationalNodeContent = (
  node: JourneyNode,
  station: StationalCardConfig,
): RenderedJourneyNodeContent => {
  const contactLines = toNonEmptyLines([
    clean(station.contact?.email),
    clean(station.contact?.phone),
    clean(station.contact?.location),
  ]);
  const socialLinks = Array.isArray(station.socialLinks)
    ? station.socialLinks
        .map((link) => {
          const label = clean(link.label);
          const url = clean(link.url);
          if (!label || !url) {
            return null;
          }
          const icon = clean(link.icon);
          return icon ? { label, url, icon } : { label, url };
        })
        .filter((entry): entry is StationalCardSocialLink => entry !== null)
    : [];
  const ctaLabel = clean(station.cta?.label);
  const ctaUrl = clean(station.cta?.url);
  const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : undefined;
  const biography = clean(station.biography);
  const manifesto = clean(station.manifesto);
  const services = toNonEmptyList(station.services);
  const testimonials = toNonEmptyList(station.testimonials);
  const references = toNonEmptyList(station.references);
  const description = clean(station.description) ?? biography ?? manifesto;
  const sections: JourneyNodeContentSection[] = [];

  if (biography && biography !== description) {
    sections.push({
      id: "biography",
      title: "Biography",
      lines: [biography],
    });
  }

  if (manifesto && manifesto !== description) {
    sections.push({
      id: "manifesto",
      title: "Manifesto",
      lines: [manifesto],
    });
  }

  if (services.length > 0) {
    sections.push({
      id: "services",
      title: "Services",
      lines: services,
    });
  }

  if (testimonials.length > 0) {
    sections.push({
      id: "testimonials",
      title: "Testimonials",
      lines: testimonials,
    });
  }

  if (references.length > 0) {
    sections.push({
      id: "references",
      title: "References",
      lines: references,
    });
  }

  if (contactLines.length > 0) {
    sections.push({
      id: "contact",
      title: "Contact",
      lines: contactLines,
    });
  }

  const subtitle = clean(station.subtitle);
  return {
    node,
    eyebrow: station.variant ? VARIANT_LABELS[station.variant] : "Station",
    title: clean(station.title) ?? "Station",
    subtitle,
    description,
    thumbnailUrl: cleanAssetUrl(station.image),
    contactLines,
    socialLinks,
    cta,
    sections,
    progressLabel: toProgressLabel(node.index, node.total),
  };
};

export const renderJourneyNodeContent = (
  item: GalleryItem | null | undefined,
  index: number,
  total: number,
): RenderedJourneyNodeContent | null => {
  if (!item) {
    return null;
  }

  const node = toJourneyNode(item, index, total);
  if (isStationalCard(item)) {
    return renderStationalNodeContent(node, item);
  }

  return renderArtworkNodeContent(node, item);
};
