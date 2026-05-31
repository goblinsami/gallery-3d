import type {
  ArtworkConfig,
  GalleryItem,
  StationalCardConfig,
  StationalCardCta,
  StationalCardSocialLink,
} from "../types/galleryConfig";
import { isStationalCard } from "./galleryItems";

export interface RenderedGalleryItemContent {
  eyebrow: string;
  title: string;
  subtitle?: string;
  description?: string;
  contactLines: string[];
  socialLinks: StationalCardSocialLink[];
  cta?: StationalCardCta;
  isStationalCard: boolean;
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

const artworkToContent = (artwork: ArtworkConfig): RenderedGalleryItemContent => {
  const sideText = artwork.sideText;
  const eyebrow = clean(sideText?.eyebrow) ?? "Gallery Note";
  const title = clean(sideText?.title) ?? clean(artwork.title) ?? "Untitled";
  const description = clean(sideText?.description) ?? clean(artwork.description);

  return {
    eyebrow,
    title,
    description,
    contactLines: [],
    socialLinks: [],
    isStationalCard: false,
  };
};

export const renderStationalCardContent = (
  station: StationalCardConfig,
): RenderedGalleryItemContent => {
/*   const eyebrow =
    (station.variant ? VARIANT_LABELS[station.variant] : undefined) ??
    "Station"; */
    const eyebrow = ''
  const title = clean(station.title) ?? "Station";
  const subtitle = clean(station.subtitle);
  const description = clean(station.description);
  const contactLines = [
    clean(station.contact?.email),
    clean(station.contact?.phone),
    clean(station.contact?.location),
  ].filter((entry): entry is string => Boolean(entry));
  const socialLinks = Array.isArray(station.socialLinks)
    ? station.socialLinks
        .map((link) => {
          const label = clean(link.label);
          const url = clean(link.url);
          if (!label || !url) return null;
          const icon = clean(link.icon);
          return icon ? { label, url, icon } : { label, url };
        })
        .filter((entry): entry is StationalCardSocialLink => entry !== null)
    : [];
  const ctaLabel = clean(station.cta?.label);
  const ctaUrl = clean(station.cta?.url);
  const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : undefined;

  return {
    eyebrow,
    title,
    subtitle,
    description,
    contactLines,
    socialLinks,
    cta,
    isStationalCard: true,
  };
};

export const renderGalleryItemContent = (
  item: GalleryItem | null | undefined,
): RenderedGalleryItemContent | null => {
  if (!item) {
    return null;
  }

  if (isStationalCard(item)) {
    return renderStationalCardContent(item);
  }

  return artworkToContent(item);
};
