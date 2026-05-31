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
  forceMobileMode?: boolean;
}

const DEFAULT_MOBILE_BREAKPOINT = 820;

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

const syncBottomSheetCameraFocus = (): void => {
  const currentItemIndex = activeItemIndex.value ?? lastKnownItemIndex.value;
  const enabled = bottomSheetState.value !== "collapsed" && currentItemIndex !== null;
  engine?.setBottomSheetFocus(currentItemIndex, enabled, isMobileLayout.value, bottomSheetState.value);
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
    <BottomSheet
      :content="activeJourneyContent"
      :is-mobile="isMobileLayout"
      @state-change="handleBottomSheetStateChange"
    />
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
  touch-action: pan-y;
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
</style>
