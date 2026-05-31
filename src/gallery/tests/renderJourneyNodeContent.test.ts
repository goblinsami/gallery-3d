import { describe, expect, it } from "vitest";
import type { GalleryItem } from "../types/galleryConfig";
import { renderJourneyNodeContent } from "../utils/renderJourneyNodeContent";

describe("renderJourneyNodeContent", () => {
  it("renders artwork nodes with progress and metadata", () => {
    const artwork: GalleryItem = {
      type: "artwork",
      id: "art-1",
      title: "Nike Air Max Campaign",
      description: "A multi-sensory launch story.",
      imageUrl: "/images/nike.jpg",
      metadata: {
        medium: "Creative Direction",
        year: "2025",
        artist: "L. Vega",
        tags: ["campaign", "motion"],
      },
    };

    const rendered = renderJourneyNodeContent(artwork, 1, 8);
    expect(rendered).not.toBeNull();
    expect(rendered?.node.type).toBe("ArtworkNode");
    expect(rendered?.progressLabel).toBe("2 / 8");
    expect(rendered?.subtitle).toBe("Creative Direction · 2025");
    expect(rendered?.sections.find((section) => section.id === "details")?.lines).toContain(
      "Artist: L. Vega",
    );
  });

  it("renders stational nodes with extended content sections", () => {
    const station: GalleryItem = {
      id: "about",
      type: "stational-card",
      variant: "about",
      title: "About Me",
      subtitle: "Creative Director · Barcelona",
      description: "Building premium digital narratives.",
      biography: "15+ years across studio, product, and campaign work.",
      services: ["Direction", "Visual Language"],
      testimonials: ["\"Outstanding collaboration\" - Studio Frame"],
      references: ["Awwwards", "Behance Feature"],
      contact: {
        email: "hello@example.com",
      },
      socialLinks: [{ label: "Instagram", url: "https://instagram.com/example" }],
      cta: {
        label: "View Portfolio",
        url: "https://example.com/work",
      },
    };

    const rendered = renderJourneyNodeContent(station, 3, 12);
    expect(rendered).not.toBeNull();
    expect(rendered?.node.type).toBe("StationalNode");
    expect(rendered?.eyebrow).toBe("About");
    expect(rendered?.progressLabel).toBe("4 / 12");
    expect(rendered?.sections.find((section) => section.id === "services")?.lines).toEqual([
      "Direction",
      "Visual Language",
    ]);
    expect(rendered?.socialLinks).toHaveLength(1);
  });
});
