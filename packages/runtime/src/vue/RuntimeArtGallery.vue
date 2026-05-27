<template>
  <section class="scrollix-runtime-root art-gallery-runtime-root" data-status="ready">
    <p v-if="parseError" class="scrollix-runtime-status">
      {{ parseError }}
    </p>

    <ArtGalleryRuntime
      :config="resolvedRuntimeConfig"
      :initial-progress="normalizedInitialProgress"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ArtGalleryRuntime from "../gallery/components/ArtGalleryRuntime.vue";
import { DEFAULT_GALLERY_CONFIG } from "../gallery/config/defaultGalleryConfig";
import type { ArtGallerySceneConfig, DeepPartial } from "../gallery/types/galleryConfig";

const props = withDefaults(
  defineProps<{
    configJson?: string;
    initialProgress?: number;
    assetBaseUrl?: string;
  }>(),
  {
    configJson: "",
    initialProgress: 0,
    assetBaseUrl: "",
  },
);

const normalizedInitialProgress = computed(() => {
  if (!Number.isFinite(props.initialProgress)) return 0;
  return Math.max(0, Math.min(1, props.initialProgress));
});

const parsedPayload = computed<{
  config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;
  parseError: string | null;
}>(() => {
  const trimmed = props.configJson.trim();
  if (!trimmed) {
    return {
      config: DEFAULT_GALLERY_CONFIG,
      parseError: null,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        config: DEFAULT_GALLERY_CONFIG,
        parseError: "[Scrollix Art Gallery] config-json must be a JSON object. Rendering default gallery.",
      };
    }
    return {
      config: parsed as DeepPartial<ArtGallerySceneConfig>,
      parseError: null,
    };
  } catch (error) {
    return {
      config: DEFAULT_GALLERY_CONFIG,
      parseError: `[Scrollix Art Gallery] Invalid config-json: ${
        error instanceof Error ? error.message : "Unexpected parse error"
      }`,
    };
  }
});

const runtimeConfig = computed(() => parsedPayload.value.config);
const parseError = computed(() => parsedPayload.value.parseError);

const shouldResolveWithRuntimeBase = (assetPath: string): boolean =>
  assetPath.startsWith("/images/") || assetPath.startsWith("/fonts/");

const resolveAssetUrl = (value: string | undefined): string | undefined => {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    if (!props.assetBaseUrl.trim() || !shouldResolveWithRuntimeBase(trimmed)) {
      return trimmed;
    }
    try {
      return new URL(trimmed.slice(1), props.assetBaseUrl).toString();
    } catch (_error) {
      return trimmed;
    }
  }

  if (!props.assetBaseUrl.trim()) {
    return trimmed;
  }

  try {
    return new URL(trimmed, props.assetBaseUrl).toString();
  } catch (_error) {
    return trimmed;
  }
};

const resolvedRuntimeConfig = computed<ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>>(() => {
  const source = runtimeConfig.value;
  const cloned = JSON.parse(JSON.stringify(source)) as ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;

  if (
    cloned &&
    typeof cloned === "object" &&
    !Array.isArray(cloned) &&
    cloned.sceneTitleConfig &&
    typeof cloned.sceneTitleConfig === "object"
  ) {
    cloned.sceneTitleConfig.fontUrl =
      resolveAssetUrl(cloned.sceneTitleConfig.fontUrl) ?? cloned.sceneTitleConfig.fontUrl;
  }

  if (
    cloned &&
    typeof cloned === "object" &&
    !Array.isArray(cloned) &&
    Array.isArray(cloned.artworks)
  ) {
    cloned.artworks = cloned.artworks.map((artwork) => {
      const nextArtwork = { ...artwork };
      nextArtwork.imageUrl = resolveAssetUrl(nextArtwork.imageUrl) ?? nextArtwork.imageUrl;
      nextArtwork.fallbackImageUrl =
        resolveAssetUrl(nextArtwork.fallbackImageUrl) ?? nextArtwork.fallbackImageUrl;
      return nextArtwork;
    });
  }

  return cloned;
});
</script>
