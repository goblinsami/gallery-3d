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
  forceMobileMode?: boolean;
}

const DEFAULT_MOBILE_BREAKPOINT = 820;
const MOBILE_TAP_MOVE_THRESHOLD_PX = 18;
const MOBILE_TAP_TIME_THRESHOLD_MS = 450;
const MOBILE_SURFACE_CLICK_DEDUPE_MS = 420;
const MOBILE_POINTER_TO_CLICK_GUARD_MS = 1100;
const MOBILE_STALE_POINTER_RESET_MS = 1600;
const MOBILE_TAP_DEBUG_WINDOW_FLAG = "__SCROLLIX_MOBILE_TAP_DEBUG__";

const props = withDefaults(defineProps<Props>(), {
  initialProgress: 0,
  forceMobileMode: false,
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
let lastPointerTapToggleTimestamp = Number.NEGATIVE_INFINITY;

const isTapDebugEnabled = (): boolean => {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return (
    (window as Window & { __SCROLLIX_MOBILE_TAP_DEBUG__?: boolean })[
      MOBILE_TAP_DEBUG_WINDOW_FLAG
    ] === true
  );
};

const debugTap = (stage: string, details: Record<string, unknown> = {}): void => {
  if (!isTapDebugEnabled()) return;
  console.info(`[Scrollix][MobileTap] ${stage}`, details);
};

const describeEventTarget = (target: EventTarget | null): string => {
  if (!(target instanceof Element)) return "non-element";
  const idPart = target.id ? `#${target.id}` : "";
  const classPart =
    target.classList.length > 0
      ? `.${Array.from(target.classList)
          .slice(0, 2)
          .join(".")}`
      : "";
  return `${target.tagName.toLowerCase()}${idPart}${classPart}`;
};

const updateContainerMetrics = (): void => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  containerWidth.value = Math.max(1, Math.round(rect.width));
  containerHeight.value = Math.max(1, Math.round(rect.height));
};

const resolveMobileBreakpoint = (config: ArtGallerySceneConfig): number =>
  Math.max(320, Math.min(1600, config.camera.mobileBreakpointWidth ?? DEFAULT_MOBILE_BREAKPOINT));

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

const resolvedConfig = computed(() => validateGalleryConfig(props.config).config);
const isMobileLayout = computed(() => {
  if (props.forceMobileMode) return true;
  const config = resolvedConfig.value;
  const breakpoint = resolveMobileBreakpoint(config);
  const width = containerWidth.value || (typeof window !== "undefined" ? window.innerWidth : 0);
  return width <= breakpoint;
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
    background: `linear-gradient(${direction}, rgba(0, 0, 0, ${(0.7 * intensity).toFixed(3)}) 0%, rgba(0, 0, 0, ${(0.08 * intensity).toFixed(3)}) ${midStop}%, rgba(0, 0, 0, ${(0.03 * intensity).toFixed(3)}) ${endStop}%, transparent 100%)`,
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
  debugTap("nearest-item:query", {
    clientX,
    clientY,
    nearestItemIndex,
    activeArtworkIndex: activeArtworkIndex.value,
    lastKnownArtworkIndex: lastKnownArtworkIndex.value,
  });
  if (nearestItemIndex === null) {
    return false;
  }

  setActiveItemIndex(nearestItemIndex);
  return true;
};

const toggleMobileOverlayFromSurface = (clientX: number, clientY: number): boolean => {
  const activatedNearestItem = tryActivateNearestItemFromSurfaceTap(clientX, clientY);
  if (!canShowMobileOverlay.value) {
    debugTap("surface-toggle:blocked", {
      reason: "canShowMobileOverlay=false",
      activatedNearestItem,
      activeArtworkIndex: activeArtworkIndex.value,
      lastKnownArtworkIndex: lastKnownArtworkIndex.value,
    });
    return false;
  }

  if (activatedNearestItem) {
    mobileOverlayVisible.value = true;
  } else {
    debugTap("surface-tap:no-nearest-noop", {
      clientX,
      clientY,
      overlayVisible: mobileOverlayVisible.value,
    });
    return false;
  }

  lastSurfaceToggleTimestamp = performance.now();
  debugTap("surface-toggle:done", {
    clientX,
    clientY,
    activatedNearestItem,
    overlayVisible: mobileOverlayVisible.value,
    activeArtworkIndex: activeArtworkIndex.value,
    lastKnownArtworkIndex: lastKnownArtworkIndex.value,
  });
  return true;
};

const handlePointerDown = (event: PointerEvent): void => {
  if (!canHandleMobileOverlayGesture()) {
    debugTap("pointerdown:ignored", {
      reason: "gesture-disabled",
      isMobileLayout: isMobileLayout.value,
      mobileDetailsOverlayEnabled: resolvedConfig.value.mobileDetailsOverlayEnabled,
    });
    return;
  }
  if (isTapIgnoredTarget(event.target)) {
    debugTap("pointerdown:ignored", {
      reason: "target-ignored",
      target: describeEventTarget(event.target),
    });
    return;
  }
  if (event.isPrimary === false) {
    debugTap("pointerdown:ignored", {
      reason: "non-primary-pointer",
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: event.isPrimary,
    });
    return;
  }
  if (tapPointerId.value !== null) {
    const trackedDurationMs = Math.max(0, event.timeStamp - tapStartTime.value);
    if (trackedDurationMs > MOBILE_STALE_POINTER_RESET_MS) {
      debugTap("pointerdown:reset-stale-tracked-pointer", {
        trackedPointerId: tapPointerId.value,
        incomingPointerId: event.pointerId,
        trackedDurationMs,
        staleThresholdMs: MOBILE_STALE_POINTER_RESET_MS,
      });
      resetTapState();
    } else {
      debugTap("pointerdown:ignored", {
        reason: "pointer-already-tracked",
        trackedPointerId: tapPointerId.value,
        incomingPointerId: event.pointerId,
        trackedDurationMs,
      });
      return;
    }
  }
  tapPointerId.value = event.pointerId;
  tapStartX.value = event.clientX;
  tapStartY.value = event.clientY;
  tapStartTime.value = event.timeStamp;
  tapMoved.value = false;
  debugTap("pointerdown", {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    ts: event.timeStamp,
    target: describeEventTarget(event.target),
  });
  if (
    event.pointerType === "mouse" &&
    event.currentTarget instanceof Element &&
    typeof event.currentTarget.setPointerCapture === "function"
  ) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // noop: some browsers reject pointer capture for touch gestures.
    }
  }
};

const handlePointerMove = (event: PointerEvent): void => {
  if (tapPointerId.value !== event.pointerId) return;
  if (tapMoved.value) return;
  const dx = event.clientX - tapStartX.value;
  const dy = event.clientY - tapStartY.value;
  if (Math.hypot(dx, dy) > MOBILE_TAP_MOVE_THRESHOLD_PX) {
    tapMoved.value = true;
    debugTap("pointermove:tap-cancelled-by-move", {
      pointerId: event.pointerId,
      dx,
      dy,
      distance: Math.hypot(dx, dy),
      threshold: MOBILE_TAP_MOVE_THRESHOLD_PX,
    });
  }
};

const resetTapState = (): void => {
  const pointerId = tapPointerId.value;
  if (
    pointerId !== null &&
    containerRef.value &&
    typeof containerRef.value.releasePointerCapture === "function"
  ) {
    try {
      const hasPointerCapture =
        typeof containerRef.value.hasPointerCapture === "function"
          ? containerRef.value.hasPointerCapture(pointerId)
          : true;
      if (hasPointerCapture) {
        containerRef.value.releasePointerCapture(pointerId);
      }
    } catch {
      // noop
    }
  }
  tapPointerId.value = null;
  tapMoved.value = false;
  tapStartTime.value = 0;
};

const handlePointerUp = (event: PointerEvent): void => {
  if (tapPointerId.value !== event.pointerId) {
    debugTap("pointerup:ignored", {
      reason: "pointer-id-mismatch",
      pointerId: event.pointerId,
      trackedPointerId: tapPointerId.value,
    });
    return;
  }
  if (isTapIgnoredTarget(event.target)) {
    debugTap("pointerup:ignored", {
      reason: "target-ignored",
      target: describeEventTarget(event.target),
    });
    resetTapState();
    return;
  }
  const elapsed = event.timeStamp - tapStartTime.value;
  const shouldToggle = !tapMoved.value && elapsed <= MOBILE_TAP_TIME_THRESHOLD_MS;
  debugTap("pointerup:evaluated", {
    pointerId: event.pointerId,
    elapsed,
    tapMoved: tapMoved.value,
    shouldToggle,
    thresholdMs: MOBILE_TAP_TIME_THRESHOLD_MS,
    x: event.clientX,
    y: event.clientY,
  });
  resetTapState();
  if (!shouldToggle) return;
  const didToggle = toggleMobileOverlayFromSurface(event.clientX, event.clientY);
  if (didToggle) {
    lastPointerTapToggleTimestamp = performance.now();
  }
};

const handlePointerCancel = (): void => {
  debugTap("pointercancel", {
    trackedPointerId: tapPointerId.value,
  });
  resetTapState();
};

const handleContainerClick = (event: MouseEvent): void => {
  if (!canHandleMobileOverlayGesture()) {
    debugTap("click:ignored", {
      reason: "gesture-disabled",
      isMobileLayout: isMobileLayout.value,
      mobileDetailsOverlayEnabled: resolvedConfig.value.mobileDetailsOverlayEnabled,
    });
    return;
  }
  if (isTapIgnoredTarget(event.target)) {
    debugTap("click:ignored", {
      reason: "target-ignored",
      target: describeEventTarget(event.target),
    });
    return;
  }

  const now = performance.now();
  if (now - lastPointerTapToggleTimestamp <= MOBILE_POINTER_TO_CLICK_GUARD_MS) {
    debugTap("click:guarded-after-pointerup", {
      now,
      lastPointerTapToggleTimestamp,
      guardWindowMs: MOBILE_POINTER_TO_CLICK_GUARD_MS,
      deltaMs: now - lastPointerTapToggleTimestamp,
    });
    return;
  }

  if (now - lastSurfaceToggleTimestamp <= MOBILE_SURFACE_CLICK_DEDUPE_MS) {
    debugTap("click:deduped", {
      now,
      lastSurfaceToggleTimestamp,
      dedupeWindowMs: MOBILE_SURFACE_CLICK_DEDUPE_MS,
      deltaMs: now - lastSurfaceToggleTimestamp,
    });
    return;
  }

  debugTap("click:accepted", {
    x: event.clientX,
    y: event.clientY,
    target: describeEventTarget(event.target),
  });
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

<style scoped>
.art-gallery-runtime {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  border-radius: 14px;
  touch-action: none;
}

.white-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  transition: opacity 80ms linear;
}

.progress-bar-track {
  position: absolute;
  left: var(--progress-bar-horizontal-padding, 14px);
  right: var(--progress-bar-horizontal-padding, 14px);
  height: 3px;
  border-radius: 999px;
  overflow: hidden;
  opacity: var(--progress-bar-opacity, 0.82);
  z-index: 6;
  pointer-events: none;
  transform: translateY(var(--progress-bar-y-offset, 0px));
  background: rgba(255, 255, 255, 0.18);
}

.progress-bar-track--top {
  top: 14px;
}

.progress-bar-track--bottom {
  bottom: 14px;
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition: transform 80ms linear;
  background: var(--progress-bar-color, #dce9ff);
}

.mobile-overlay-toggle {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 7;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(8, 14, 24, 0.76);
  color: #f4f7ff;
  font-size: 0.77rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 8px 12px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  cursor: pointer;
}

.mobile-overlay-toggle--top-left {
  top: 14px;
  right: auto;
  bottom: auto;
  left: 14px;
}

.mobile-overlay-toggle--top-right {
  top: 14px;
  right: 14px;
  bottom: auto;
  left: auto;
}

.mobile-overlay-toggle--bottom-left {
  top: auto;
  right: auto;
  bottom: 14px;
  left: 14px;
}

.mobile-overlay-toggle--bottom-right {
  top: auto;
  right: 14px;
  bottom: 14px;
  left: auto;
}

.mobile-overlay-toggle:focus-visible {
  outline: 2px solid rgba(151, 212, 255, 0.9);
  outline-offset: 2px;
}

.mobile-artwork-overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 14px;
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 12%, rgba(0, 0, 0, 0.08) 58%, transparent 100%);
}

.mobile-artwork-overlay--top {
  align-items: flex-start;
}

.mobile-artwork-overlay--bottom {
  align-items: flex-end;
}

.mobile-artwork-overlay.no-backdrop {
  background: transparent;
}

.mobile-artwork-overlay-card {
  width: min(100%, 430px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(9, 14, 22, 0.88);
  color: #f1f5ff;
  padding: 14px;
  box-sizing: border-box;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.44);
}

.mobile-artwork-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.mobile-artwork-overlay-eyebrow {
  margin: 0;
  font-size: 0.69rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #b7c6e2;
}

.mobile-artwork-overlay-close {
  border: 1px solid rgba(255, 255, 255, 0.21);
  background: rgba(255, 255, 255, 0.06);
  color: #f5f8ff;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.mobile-artwork-overlay-close:focus-visible {
  outline: 2px solid rgba(151, 212, 255, 0.9);
  outline-offset: 2px;
}

.mobile-artwork-overlay-title {
  margin: 0 0 8px 0;
  font-size: 1.05rem;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.mobile-artwork-overlay-description {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.38;
  color: rgba(232, 238, 250, 0.9);
}

.mobile-artwork-overlay-subtitle {
  margin: 0 0 8px 0;
  font-size: 0.84rem;
  letter-spacing: 0.03em;
  color: rgba(185, 204, 233, 0.9);
}

.mobile-artwork-overlay-list {
  margin: 10px 0 0 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(216, 229, 247, 0.92);
}

.mobile-artwork-overlay-list a {
  color: inherit;
  text-decoration: none;
}

.mobile-artwork-overlay-list a:hover {
  text-decoration: underline;
}

.mobile-artwork-overlay-cta {
  margin: 10px 0 0 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.mobile-artwork-overlay-cta a {
  color: #d6ecff;
  text-decoration: none;
}

.mobile-artwork-overlay-cta a:hover {
  text-decoration: underline;
}
</style>

