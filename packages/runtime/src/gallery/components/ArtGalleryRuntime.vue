<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import BottomSheet from "./BottomSheet.vue";
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
import { renderJourneyNodeContent } from "../utils/renderJourneyNodeContent";

type BottomSheetState = "collapsed" | "half" | "full";

interface Props {
  config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;
  initialProgress?: number;
}

const DEFAULT_MOBILE_BREAKPOINT = 820;

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
const activeItemIndex = ref<number | null>(null);
const lastKnownItemIndex = ref<number | null>(null);
const bottomSheetState = ref<BottomSheetState>("collapsed");

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
  return width <= breakpoint;
});
const runtimeSceneConfig = computed<ArtGallerySceneConfig>(() => {
  const config = resolvedConfig.value;
  if (!isMobileLayout.value) {
    return config;
  }

  const mobileItems = getGalleryItems(config).map((item) =>
    isArtworkItem(item)
      ? item
      : {
          ...item,
          mobileColumnLayout: true,
        },
  );

  return {
    ...config,
    items: mobileItems,
  };
});
const whiteOverlayStyle = computed(() => ({
  opacity: whiteOverlayOpacity.value,
  background: GALLERY_TOKENS.scene.white,
}));
const galleryItems = computed<GalleryItem[]>(() => getGalleryItems(runtimeSceneConfig.value));
const activeJourneyContent = computed(() => {
  const index = activeItemIndex.value ?? lastKnownItemIndex.value;
  if (index === null || index < 0 || index >= galleryItems.value.length) {
    return null;
  }

  return renderJourneyNodeContent(galleryItems.value[index], index, galleryItems.value.length);
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
const blurLayerAUrl = ref<string | null>(null);
const blurLayerBUrl = ref<string | null>(null);
const blurLayerAOpacity = ref(0);
const blurLayerBOpacity = ref(0);
const blurLayerActive = ref<"a" | "b">("a");
const artworkGapFillStyleA = computed<Record<string, string>>(() => ({
  opacity: String(blurLayerAOpacity.value),
  backgroundImage: blurLayerAUrl.value ? `url("${blurLayerAUrl.value}")` : "none",
}));
const artworkGapFillStyleB = computed<Record<string, string>>(() => ({
  opacity: String(blurLayerBOpacity.value),
  backgroundImage: blurLayerBUrl.value ? `url("${blurLayerBUrl.value}")` : "none",
}));
const desktopSheetSide = computed(() => resolvedConfig.value.desktopDetailsPanelSide);
const desktopSheetWidth = computed(() => resolvedConfig.value.desktopDetailsPanelWidth);

const setActiveItemIndex = (index: number | null): void => {
  activeItemIndex.value = index;
  if (index !== null) {
    lastKnownItemIndex.value = index;
  }
};

const syncScrollOwnership = (): void => {
  scrollController?.setInteractionEnabled(bottomSheetState.value === "collapsed");
};

const handleBottomSheetStateChange = (state: BottomSheetState): void => {
  bottomSheetState.value = state;
  syncScrollOwnership();
};

const handleSceneClick = (event: MouseEvent): void => {
  if (!engine || !containerRef.value) {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  const target = event.target;
  if (target instanceof Element && target.closest(".bottom-sheet__surface")) {
    return;
  }

  const nextIndex = engine.getClosestItemIndexFromClientPoint(event.clientX, event.clientY);
  if (nextIndex === null) {
    if (bottomSheetState.value !== "collapsed") {
      bottomSheetState.value = "collapsed";
      syncScrollOwnership();
      syncBottomSheetCameraFocus();
    }
    return;
  }

  setActiveItemIndex(nextIndex);
  if (bottomSheetState.value === "collapsed") {
    bottomSheetState.value = "half";
    syncScrollOwnership();
  }
  syncBottomSheetCameraFocus();
};

const syncBottomSheetCameraFocus = (): void => {
  const currentItemIndex = activeItemIndex.value ?? lastKnownItemIndex.value;
  const enabled = bottomSheetState.value !== "collapsed" && currentItemIndex !== null;
  engine?.setBottomSheetFocus(
    currentItemIndex,
    enabled,
    isMobileLayout.value,
    bottomSheetState.value,
    desktopSheetSide.value,
    desktopSheetWidth.value,
  );
};

const setArtworkGapBlur = (imageUrl: string | undefined): void => {
  if (!imageUrl) {
    blurLayerAOpacity.value = 0;
    blurLayerBOpacity.value = 0;
    return;
  }

  const activeUrl = blurLayerActive.value === "a" ? blurLayerAUrl.value : blurLayerBUrl.value;
  if (activeUrl === imageUrl) {
    if (blurLayerActive.value === "a") {
      blurLayerAOpacity.value = 1;
      blurLayerBOpacity.value = 0;
    } else {
      blurLayerAOpacity.value = 0;
      blurLayerBOpacity.value = 1;
    }
    return;
  }

  const nextLayer = blurLayerActive.value === "a" ? "b" : "a";
  if (nextLayer === "a") {
    blurLayerAUrl.value = imageUrl;
    blurLayerAOpacity.value = 0;
  } else {
    blurLayerBUrl.value = imageUrl;
    blurLayerBOpacity.value = 0;
  }

  requestAnimationFrame(() => {
    if (nextLayer === "a") {
      blurLayerAOpacity.value = 1;
      blurLayerBOpacity.value = 0;
    } else {
      blurLayerAOpacity.value = 0;
      blurLayerBOpacity.value = 1;
    }
    blurLayerActive.value = nextLayer;
  });
};

const handleProgress = (state: ScrollProgressState): void => {
  whiteOverlayOpacity.value = state.whiteMix;
  journeyProgress.value = state.progress;
  engine?.setLoopWhiteMix(state.whiteMix);
  engine?.setProgress(state.progress);
  setActiveItemIndex(engine?.getActiveItemIndex() ?? engine?.getActiveArtworkIndex() ?? null);
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
  setActiveItemIndex(engine.getActiveItemIndex() ?? engine.getActiveArtworkIndex());
  syncBottomSheetCameraFocus();

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
  syncScrollOwnership();

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
    setActiveItemIndex(engine.getActiveItemIndex() ?? engine.getActiveArtworkIndex());
    syncScrollOwnership();
    syncBottomSheetCameraFocus();
  },
  { deep: true },
);

watch(
  () => [bottomSheetState.value, activeItemIndex.value, lastKnownItemIndex.value, isMobileLayout.value],
  () => {
    syncBottomSheetCameraFocus();
  },
);

watch(
  () => activeJourneyContent.value,
  (content) => {
    if (content) {
      return;
    }

    bottomSheetState.value = "collapsed";
    syncScrollOwnership();
    syncBottomSheetCameraFocus();
  },
);

watch(
  () => activeJourneyContent.value?.thumbnailUrl,
  (nextImageUrl) => {
    setArtworkGapBlur(nextImageUrl);
  },
  { immediate: true },
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
    @click="handleSceneClick"
  >
    <div class="artwork-gap-fill artwork-gap-fill--a" :style="artworkGapFillStyleA" aria-hidden="true" />
    <div class="artwork-gap-fill artwork-gap-fill--b" :style="artworkGapFillStyleB" aria-hidden="true" />
    <div class="white-overlay" :style="whiteOverlayStyle" />
    <div
      class="progress-bar-track"
      :class="progressBarPositionClass"
      :style="progressBarTrackStyle"
      aria-hidden="true"
    >
      <div class="progress-bar-fill" :style="progressBarFillStyle" />
    </div>
    <BottomSheet
      :content="activeJourneyContent"
      :is-mobile="isMobileLayout"
      :desktop-side="desktopSheetSide"
      :desktop-width="desktopSheetWidth"
      :external-state="bottomSheetState"
      @state-change="handleBottomSheetStateChange"
    />
  </div>
</template>
