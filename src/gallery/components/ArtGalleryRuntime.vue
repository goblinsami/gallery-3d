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
const MOBILE_TAP_MOVE_THRESHOLD_PX = 14;
const MOBILE_TAP_TIME_THRESHOLD_MS = 320;

const props = withDefaults(defineProps<Props>(), {
  initialProgress: 0,
  forceMobileMode: false,
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
  const width = containerWidth.value || (typeof window !== "undefined" ? window.innerWidth : 0);
  const height = containerHeight.value || (typeof window !== "undefined" ? window.innerHeight : 0);
  return Math.min(width, height) <= DEFAULT_MOBILE_BREAKPOINT;
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
  const index = activeArtworkIndex.value;
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
const mobileOverlayBackdropStyle = computed(() => {
  if (!mobileOverlayHasBackdrop.value) {
    return { background: "transparent" };
  }

  const intensity = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropIntensity));
  const height = Math.max(0, Math.min(1, resolvedConfig.value.mobileDetailsBackdropHeight));
  const midStop = Math.round(height * 42);
  const endStop = Math.round(height * 100);

  return {
    background: `linear-gradient(to top, rgba(0, 0, 0, ${(0.7 * intensity).toFixed(3)}) 0%, rgba(0, 0, 0, ${(0.08 * intensity).toFixed(3)}) ${midStop}%, rgba(0, 0, 0, ${(0.03 * intensity).toFixed(3)}) ${endStop}%, transparent 100%)`,
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

.mobile-overlay-toggle {
  position: absolute;
  right: 14px;
  bottom: 14px;
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

.mobile-overlay-toggle:focus-visible {
  outline: 2px solid rgba(151, 212, 255, 0.9);
  outline-offset: 2px;
}

.mobile-artwork-overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 14px;
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 12%, rgba(0, 0, 0, 0.08) 58%, transparent 100%);
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

