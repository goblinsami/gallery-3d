<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GalleryEngine } from "../engine/GalleryEngine";
import type { ArtGallerySceneConfig, DeepPartial, GalleryItem } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import {
  ScrollProgressController,
  type ScrollProgressState,
} from "../journey/scrollProgressController";
import { toWheelSensitivity } from "../utils/scrollStrength";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import { getGalleryItems, isArtworkItem } from "../utils/galleryItems";
import { renderGalleryItemContent } from "../utils/renderStationalCardContent";

interface Props {
  config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;
  initialProgress?: number;
}

const DEFAULT_MOBILE_BREAKPOINT = 820;
const MOBILE_TAP_MOVE_THRESHOLD_PX = 18;
const MOBILE_TAP_TIME_THRESHOLD_MS = 450;
const MOBILE_SURFACE_CLICK_DEDUPE_MS = 420;

const props = withDefaults(defineProps<Props>(), {
  initialProgress: 0,
});

const emit = defineEmits<{
  (event: "progress", progress: number): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const whiteOverlayOpacity = ref(0);
const journeyProgress = ref(0);
const containerWidth = ref(0);
const containerHeight = ref(0);
const activeArtworkIndex = ref<number | null>(null);
const lastKnownArtworkIndex = ref<number | null>(null);
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
let lastSurfaceToggleTimestamp = Number.NEGATIVE_INFINITY;

const updateContainerMetrics = (): void => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  containerWidth.value = Math.max(1, Math.round(rect.width));
  containerHeight.value = Math.max(1, Math.round(rect.height));
};

const resolveMobileBreakpoint = (config: ArtGallerySceneConfig): number =>
  Math.max(320, Math.min(1600, config.camera.mobileBreakpointWidth ?? DEFAULT_MOBILE_BREAKPOINT));

const isMobileContainer = (width: number, breakpoint: number): boolean => width <= breakpoint;

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
  return isMobileContainer(width, breakpoint);
});
const runtimeSceneConfig = computed<ArtGallerySceneConfig>(() => {
  const config = resolvedConfig.value;
  if (!isMobileLayout.value) {
    return config;
  }

  const mobileItems = getGalleryItems(config).map((item) =>
    isArtworkItem(item)
      ? (
          config.mobileDetailsOverlayEnabled
            ? {
                ...item,
                sideText: undefined,
              }
            : item
        )
      : {
          ...item,
          mobileColumnLayout: true,
        },
  );

  if (!config.mobileDetailsOverlayEnabled) {
    return {
      ...config,
      items: mobileItems,
    };
  }

  return {
    ...config,
    items: mobileItems,
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
const galleryItems = computed<GalleryItem[]>(() => getGalleryItems(resolvedConfig.value));
const activeGalleryItem = computed<GalleryItem | null>(() => {
  const index = activeArtworkIndex.value ?? lastKnownArtworkIndex.value;
  if (index === null || index < 0 || index >= galleryItems.value.length) {
    return null;
  }
  return galleryItems.value[index];
});
const overlayContent = computed(() => renderGalleryItemContent(activeGalleryItem.value));
const overlayEyebrow = computed(() => overlayContent.value?.eyebrow ?? "Gallery Note");
const overlayTitle = computed(() => overlayContent.value?.title ?? "");
const overlaySubtitle = computed(() => overlayContent.value?.subtitle ?? "");
const overlayDescription = computed(() => overlayContent.value?.description ?? "");
const overlayContactLines = computed(() => overlayContent.value?.contactLines ?? []);
const overlaySocialLinks = computed(() => overlayContent.value?.socialLinks ?? []);
const overlayCta = computed(() => overlayContent.value?.cta);
const canShowMobileOverlay = computed(
  () =>
    resolvedConfig.value.mobileDetailsOverlayEnabled &&
    isMobileLayout.value &&
    Boolean(
      overlayTitle.value ||
        overlaySubtitle.value ||
        overlayDescription.value ||
        overlayContactLines.value.length ||
        overlaySocialLinks.value.length,
    ),
);
const mobileOverlayHasBackdrop = computed(() => resolvedConfig.value.mobileDetailsBackdropEnabled);
const mobileOverlayButtonPositionClass = computed(
  () => `mobile-overlay-toggle--${resolvedConfig.value.mobileDetailsButtonPosition}`,
);
const mobileOverlayModalPositionClass = computed(
  () => `mobile-artwork-overlay--${resolvedConfig.value.mobileDetailsModalPosition}`,
);
const mobileOverlayUsesTopAnchor = computed(
  () => resolvedConfig.value.mobileDetailsModalPosition === "top",
);
const mobileOverlayBackdropStyle = computed(() => {
  if (!mobileOverlayHasBackdrop.value) {
    return { background: "transparent" };
  }

  const intensity = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropIntensity));
  const height = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropHeight));
  const midStop = Math.round(height * 42);
  const endStop = Math.round(height * 100);
  const direction = mobileOverlayUsesTopAnchor.value ? "to bottom" : "to top";

  return {
    background: `linear-gradient(${direction}, rgba(2, 7, 20, ${(0.78 * intensity).toFixed(3)}) 0%, rgba(2, 7, 20, ${(0.35 * intensity).toFixed(3)}) ${midStop}%, rgba(2, 7, 20, ${(0.08 * intensity).toFixed(3)}) ${endStop}%, transparent 100%)`,
  };
});
const progressBarPositionClass = computed(
  () => `progress-bar-track--${resolvedConfig.value.progressBarPosition}`,
);
const progressBarTrackStyle = computed<Record<string, string>>(() => ({
  "--progress-bar-color": resolvedConfig.value.progressBarColor,
  "--progress-bar-opacity": String(
    Math.max(0, Math.min(1, resolvedConfig.value.progressBarOpacity)),
  ),
  "--progress-bar-y-offset": `${resolvedConfig.value.progressBarYOffset}px`,
  "--progress-bar-horizontal-padding": `${resolvedConfig.value.progressBarHorizontalPadding}px`,
}));
const progressBarFillStyle = computed<Record<string, string>>(() => ({
  transform: `scaleX(${Math.max(0, Math.min(1, journeyProgress.value))})`,
}));

const closeMobileOverlay = (): void => {
  mobileOverlayVisible.value = false;
};

const setActiveItemIndex = (index: number | null): void => {
  activeArtworkIndex.value = index;
  if (index !== null) {
    lastKnownArtworkIndex.value = index;
  }
};

const isTapIgnoredTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(".mobile-overlay-toggle") ||
      target.closest(".mobile-artwork-overlay") ||
      target.closest(".mobile-artwork-overlay-card"),
  );
};

const toggleMobileOverlay = (): void => {
  if (!canShowMobileOverlay.value) return;
  mobileOverlayVisible.value = !mobileOverlayVisible.value;
};

const canHandleMobileOverlayGesture = (): boolean =>
  isMobileLayout.value && resolvedConfig.value.mobileDetailsOverlayEnabled;

const tryActivateNearestItemFromSurfaceTap = (clientX: number, clientY: number): boolean => {
  const nearestItemIndex = engine?.getClosestItemIndexFromClientPoint(clientX, clientY) ?? null;
  if (nearestItemIndex === null) {
    return false;
  }

  setActiveItemIndex(nearestItemIndex);
  return true;
};

const toggleMobileOverlayFromSurface = (clientX: number, clientY: number): void => {
  const activatedNearestItem = tryActivateNearestItemFromSurfaceTap(clientX, clientY);
  if (!canShowMobileOverlay.value) return;

  if (activatedNearestItem && !mobileOverlayVisible.value) {
    mobileOverlayVisible.value = true;
  } else {
    mobileOverlayVisible.value = !mobileOverlayVisible.value;
  }

  lastSurfaceToggleTimestamp = performance.now();
};

const handlePointerDown = (event: PointerEvent): void => {
  if (!canHandleMobileOverlayGesture()) return;
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
  toggleMobileOverlayFromSurface(event.clientX, event.clientY);
};

const handlePointerCancel = (): void => {
  resetTapState();
};

const handleContainerClick = (event: MouseEvent): void => {
  if (!canHandleMobileOverlayGesture()) return;
  if (isTapIgnoredTarget(event.target)) return;

  const now = performance.now();
  if (now - lastSurfaceToggleTimestamp <= MOBILE_SURFACE_CLICK_DEDUPE_MS) {
    return;
  }

  toggleMobileOverlayFromSurface(event.clientX, event.clientY);
};

const handleProgress = (state: ScrollProgressState): void => {
  whiteOverlayOpacity.value = state.whiteMix;
  journeyProgress.value = state.progress;
  engine?.setLoopWhiteMix(state.whiteMix);
  engine?.setProgress(state.progress);
  setActiveItemIndex(engine?.getActiveArtworkIndex() ?? null);
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
  journeyProgress.value = Math.max(0, Math.min(1, props.initialProgress));

  engine = new GalleryEngine(containerRef.value, runtimeSceneConfig.value);
  await engine.init();
  engine.setProgress(props.initialProgress);
  setActiveItemIndex(engine.getActiveArtworkIndex());

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
    setActiveItemIndex(engine.getActiveArtworkIndex());
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
    @click="handleContainerClick"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <div class="white-overlay" :style="whiteOverlayStyle" />
    <div
      class="progress-bar-track"
      :class="progressBarPositionClass"
      :style="progressBarTrackStyle"
      aria-hidden="true"
    >
      <div class="progress-bar-fill" :style="progressBarFillStyle" />
    </div>
    <button
      v-if="canShowMobileOverlay"
      type="button"
      class="mobile-overlay-toggle"
      :class="mobileOverlayButtonPositionClass"
      @click.stop="toggleMobileOverlay"
      aria-label="Toggle artwork details"
    >
      Details
    </button>
    <div
      v-if="mobileOverlayVisible && canShowMobileOverlay"
      class="mobile-artwork-overlay"
      :class="[mobileOverlayModalPositionClass, { 'no-backdrop': !mobileOverlayHasBackdrop }]"
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
        <p v-if="overlaySubtitle" class="mobile-artwork-overlay-subtitle">
          {{ overlaySubtitle }}
        </p>
        <p v-if="overlayDescription" class="mobile-artwork-overlay-description">
          {{ overlayDescription }}
        </p>
        <ul v-if="overlayContactLines.length > 0" class="mobile-artwork-overlay-list">
          <li v-for="line in overlayContactLines" :key="line">{{ line }}</li>
        </ul>
        <ul v-if="overlaySocialLinks.length > 0" class="mobile-artwork-overlay-list">
          <li v-for="link in overlaySocialLinks" :key="`${link.label}:${link.url}`">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
          </li>
        </ul>
        <p v-if="overlayCta" class="mobile-artwork-overlay-cta">
          <a :href="overlayCta.url" target="_blank" rel="noopener noreferrer">{{ overlayCta.label }}</a>
        </p>
      </article>
    </div>
  </div>
</template>


