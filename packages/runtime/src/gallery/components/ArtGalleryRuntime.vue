<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GalleryEngine } from "../engine/GalleryEngine";
import type { ArtGallerySceneConfig, ArtworkConfig, DeepPartial } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import {
  ScrollProgressController,
  type ScrollProgressState,
} from "../journey/scrollProgressController";
import { toWheelSensitivity } from "../utils/scrollStrength";
import { GALLERY_TOKENS } from "../config/galleryTokens";

interface Props {
  config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;
  initialProgress?: number;
}

const DEFAULT_MOBILE_BREAKPOINT = 820;
const MOBILE_TAP_MOVE_THRESHOLD_PX = 14;
const MOBILE_TAP_TIME_THRESHOLD_MS = 320;

const props = withDefaults(defineProps<Props>(), {
  initialProgress: 0,
});

const emit = defineEmits<{
  (event: "progress", progress: number): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const whiteOverlayOpacity = ref(0);
const containerWidth = ref(0);
const containerHeight = ref(0);
const activeArtworkIndex = ref<number | null>(null);
const mobileOverlayVisible = ref(false);
const tapPointerId = ref<number | null>(null);
const tapStartX = ref(0);
const tapStartY = ref(0);
const tapStartTime = ref(0);
const tapMoved = ref(false);
let engine: GalleryEngine | null = null;
let scrollController: ScrollProgressController | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeTimeout: number | null = null;
let viewportResizeTimeout: number | null = null;

const updateContainerMetrics = (): void => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  containerWidth.value = Math.max(1, Math.round(rect.width));
  containerHeight.value = Math.max(1, Math.round(rect.height));
};

const resolveMobileBreakpoint = (config: ArtGallerySceneConfig): number =>
  Math.max(320, Math.min(1600, config.camera.mobileBreakpointWidth ?? DEFAULT_MOBILE_BREAKPOINT));

const isMobileContainer = (width: number, height: number, breakpoint: number): boolean =>
  Math.min(width, height) <= breakpoint;

const requestResize = (delayMs = 0): void => {
  if (viewportResizeTimeout !== null) {
    window.clearTimeout(viewportResizeTimeout);
    viewportResizeTimeout = null;
  }

  viewportResizeTimeout = window.setTimeout(() => {
    viewportResizeTimeout = null;
    updateContainerMetrics();
    engine?.resize();
  }, delayMs);
};

const handleWindowResize = (): void => {
  requestResize(20);
};

const handleOrientationChange = (): void => {
  requestResize(40);
  requestResize(220);
};

const handleVisualViewportResize = (): void => {
  requestResize(20);
};

const resolvedConfig = computed(() => validateGalleryConfig(props.config).config);
const isMobileLayout = computed(() => {
  const config = resolvedConfig.value;
  const breakpoint = resolveMobileBreakpoint(config);
  const width = containerWidth.value || (typeof window !== "undefined" ? window.innerWidth : 0);
  const height = containerHeight.value || (typeof window !== "undefined" ? window.innerHeight : 0);
  return isMobileContainer(width, height, breakpoint);
});
const runtimeSceneConfig = computed<ArtGallerySceneConfig>(() => {
  const config = resolvedConfig.value;
  if (!isMobileLayout.value) {
    return config;
  }

  if (!config.mobileDetailsOverlayEnabled) {
    return config;
  }

  return {
    ...config,
    artworks: config.artworks.map((artwork) => ({
      ...artwork,
      sideText: undefined,
    })),
  };
});
const whiteOverlayStyle = computed(() => ({
  opacity: whiteOverlayOpacity.value,
  background: GALLERY_TOKENS.scene.white,
}));
const activeArtwork = computed<ArtworkConfig | null>(() => {
  const index = activeArtworkIndex.value;
  if (index === null || index < 0 || index >= resolvedConfig.value.artworks.length) {
    return null;
  }
  return resolvedConfig.value.artworks[index];
});
const overlayEyebrow = computed(() => activeArtwork.value?.sideText?.eyebrow?.trim() || "Gallery Note");
const overlayTitle = computed(() => {
  const sideTextTitle = activeArtwork.value?.sideText?.title?.trim();
  if (sideTextTitle) return sideTextTitle;
  return activeArtwork.value?.title?.trim() ?? "";
});
const overlayDescription = computed(() => {
  const sideTextDescription = activeArtwork.value?.sideText?.description?.trim();
  if (sideTextDescription) return sideTextDescription;
  return activeArtwork.value?.description?.trim() ?? "";
});
const canShowMobileOverlay = computed(
  () =>
    resolvedConfig.value.mobileDetailsOverlayEnabled &&
    isMobileLayout.value &&
    Boolean(overlayTitle.value || overlayDescription.value),
);
const mobileOverlayHasBackdrop = computed(() => resolvedConfig.value.mobileDetailsBackdropEnabled);
const mobileOverlayBackdropStyle = computed(() => {
  if (!mobileOverlayHasBackdrop.value) {
    return { background: "transparent" };
  }

  const intensity = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropIntensity));
  const height = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropHeight));
  const midStop = Math.round(height * 42);
  const endStop = Math.round(height * 100);

  return {
    background: `linear-gradient(to top, rgba(2, 7, 20, ${(0.78 * intensity).toFixed(3)}) 0%, rgba(2, 7, 20, ${(0.35 * intensity).toFixed(3)}) ${midStop}%, rgba(2, 7, 20, ${(0.08 * intensity).toFixed(3)}) ${endStop}%, transparent 100%)`,
  };
});

const closeMobileOverlay = (): void => {
  mobileOverlayVisible.value = false;
};

const isTapIgnoredTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(".mobile-overlay-toggle") ||
      target.closest(".mobile-artwork-overlay-card"),
  );
};

const toggleMobileOverlay = (): void => {
  if (!canShowMobileOverlay.value) return;
  mobileOverlayVisible.value = !mobileOverlayVisible.value;
};

const handlePointerDown = (event: PointerEvent): void => {
  if (!isMobileLayout.value) return;
  if (!canShowMobileOverlay.value) return;
  if (isTapIgnoredTarget(event.target)) return;
  tapPointerId.value = event.pointerId;
  tapStartX.value = event.clientX;
  tapStartY.value = event.clientY;
  tapStartTime.value = event.timeStamp;
  tapMoved.value = false;
};

const handlePointerMove = (event: PointerEvent): void => {
  if (tapPointerId.value !== event.pointerId) return;
  if (tapMoved.value) return;
  const dx = event.clientX - tapStartX.value;
  const dy = event.clientY - tapStartY.value;
  if (Math.hypot(dx, dy) > MOBILE_TAP_MOVE_THRESHOLD_PX) {
    tapMoved.value = true;
  }
};

const resetTapState = (): void => {
  tapPointerId.value = null;
  tapMoved.value = false;
  tapStartTime.value = 0;
};

const handlePointerUp = (event: PointerEvent): void => {
  if (tapPointerId.value !== event.pointerId) return;
  if (isTapIgnoredTarget(event.target)) {
    resetTapState();
    return;
  }
  const elapsed = event.timeStamp - tapStartTime.value;
  const shouldToggle = !tapMoved.value && elapsed <= MOBILE_TAP_TIME_THRESHOLD_MS;
  resetTapState();
  if (!shouldToggle) return;
  toggleMobileOverlay();
};

const handlePointerCancel = (): void => {
  resetTapState();
};

const handleProgress = (state: ScrollProgressState): void => {
  whiteOverlayOpacity.value = state.whiteMix;
  engine?.setLoopWhiteMix(state.whiteMix);
  engine?.setProgress(state.progress);
  activeArtworkIndex.value = engine?.getActiveArtworkIndex() ?? null;
  if (!canShowMobileOverlay.value) {
    closeMobileOverlay();
  }
  emit("progress", state.progress);
};

onMounted(async () => {
  if (!containerRef.value) {
    return;
  }

  updateContainerMetrics();

  engine = new GalleryEngine(containerRef.value, runtimeSceneConfig.value);
  await engine.init();
  engine.setProgress(props.initialProgress);
  activeArtworkIndex.value = engine.getActiveArtworkIndex();

  scrollController = new ScrollProgressController({
    element: containerRef.value,
    initialProgress: props.initialProgress,
    sensitivity: toWheelSensitivity(resolvedConfig.value.scrollStrength),
    loop: resolvedConfig.value.infiniteCorridor,
    loopWhiteAfterEndWindow: resolvedConfig.value.loopWhiteAfterEndWindow,
    loopWhiteStartsBeforeEndWindow: resolvedConfig.value.loopWhiteStartsBeforeEndWindow,
    loopWhiteFadeOutWindow: resolvedConfig.value.loopWhiteFadeOutWindow,
    loopWhiteFadeOutRevealWindow: resolvedConfig.value.loopWhiteFadeOutRevealWindow,
    loopProgressAdvanceDuringWhiteFadeOut: resolvedConfig.value.loopProgressAdvanceDuringWhiteFadeOut,
    onProgress: handleProgress,
  });
  scrollController.start();
  scrollController.setProgress(props.initialProgress);

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimeout !== null) {
      window.clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      updateContainerMetrics();
      engine?.resize();
    }, 80);
  });

  resizeObserver.observe(containerRef.value);
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("orientationchange", handleOrientationChange);
  window.visualViewport?.addEventListener("resize", handleVisualViewportResize);
  window.visualViewport?.addEventListener("scroll", handleVisualViewportResize);
  requestResize(0);
  requestResize(120);
  requestResize(320);
});

watch(
  () => runtimeSceneConfig.value,
  async (nextConfig) => {
    if (!engine) {
      return;
    }

    await engine.updateConfig(nextConfig);
    scrollController?.setSensitivity(toWheelSensitivity(nextConfig.scrollStrength));
    scrollController?.setLoopTransitionWindows(
      nextConfig.loopWhiteAfterEndWindow,
      nextConfig.loopWhiteStartsBeforeEndWindow,
      nextConfig.loopWhiteFadeOutWindow,
      nextConfig.loopWhiteFadeOutRevealWindow,
      nextConfig.loopProgressAdvanceDuringWhiteFadeOut,
    );
    scrollController?.setLoop(nextConfig.infiniteCorridor);
    activeArtworkIndex.value = engine.getActiveArtworkIndex();
    if (!canShowMobileOverlay.value) {
      closeMobileOverlay();
    }
  },
  { deep: true },
);

watch(
  () => isMobileLayout.value,
  () => {
    if (!isMobileLayout.value) {
      closeMobileOverlay();
    }
  },
);

onBeforeUnmount(() => {
  scrollController?.dispose();
  scrollController = null;

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (resizeTimeout !== null) {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }

  if (viewportResizeTimeout !== null) {
    window.clearTimeout(viewportResizeTimeout);
    viewportResizeTimeout = null;
  }

  window.removeEventListener("resize", handleWindowResize);
  window.removeEventListener("orientationchange", handleOrientationChange);
  window.visualViewport?.removeEventListener("resize", handleVisualViewportResize);
  window.visualViewport?.removeEventListener("scroll", handleVisualViewportResize);

  engine?.dispose();
  engine = null;
});
</script>

<template>
  <div
    ref="containerRef"
    class="art-gallery-runtime"
    aria-label="3D Art Gallery Runtime"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <div class="white-overlay" :style="whiteOverlayStyle" />
    <button
      v-if="canShowMobileOverlay"
      type="button"
      class="mobile-overlay-toggle"
      @click.stop="toggleMobileOverlay"
      aria-label="Toggle artwork details"
    >
      Details
    </button>
    <div
      v-if="mobileOverlayVisible && canShowMobileOverlay"
      class="mobile-artwork-overlay"
      :class="{ 'no-backdrop': !mobileOverlayHasBackdrop }"
      :style="mobileOverlayBackdropStyle"
      role="dialog"
      aria-modal="false"
      @click.self="closeMobileOverlay"
    >
      <article class="mobile-artwork-overlay-card">
        <header class="mobile-artwork-overlay-header">
          <p class="mobile-artwork-overlay-eyebrow">{{ overlayEyebrow }}</p>
          <button
            type="button"
            class="mobile-artwork-overlay-close"
            @click.stop="closeMobileOverlay"
            aria-label="Close details"
          >
            Close
          </button>
        </header>
        <h3 class="mobile-artwork-overlay-title">{{ overlayTitle }}</h3>
        <p v-if="overlayDescription" class="mobile-artwork-overlay-description">
          {{ overlayDescription }}
        </p>
      </article>
    </div>
  </div>
</template>


