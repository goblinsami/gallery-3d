<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GalleryEngine } from "../engine/GalleryEngine";
import type { ArtGallerySceneConfig, DeepPartial } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import { ScrollProgressController } from "../journey/scrollProgressController";
import { toWheelSensitivity } from "../utils/scrollStrength";

interface Props {
  config: ArtGallerySceneConfig | DeepPartial<ArtGallerySceneConfig>;
  initialProgress?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialProgress: 0,
});

const emit = defineEmits<{
  (event: "progress", progress: number): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
let engine: GalleryEngine | null = null;
let scrollController: ScrollProgressController | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeTimeout: number | null = null;

const resolvedConfig = computed(() => validateGalleryConfig(props.config).config);

const handleProgress = (progress: number): void => {
  engine?.setProgress(progress);
  emit("progress", progress);
};

onMounted(async () => {
  if (!containerRef.value) {
    return;
  }

  engine = new GalleryEngine(containerRef.value, resolvedConfig.value);
  await engine.init();
  engine.setProgress(props.initialProgress);

  scrollController = new ScrollProgressController({
    element: containerRef.value,
    initialProgress: props.initialProgress,
    sensitivity: toWheelSensitivity(resolvedConfig.value.scrollStrength),
    loop: resolvedConfig.value.infiniteCorridor,
    onProgress: handleProgress,
  });
  scrollController.start();

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimeout !== null) {
      window.clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      engine?.resize();
    }, 80);
  });

  resizeObserver.observe(containerRef.value);
});

watch(
  () => resolvedConfig.value,
  async (nextConfig) => {
    if (!engine) {
      return;
    }

    await engine.updateConfig(nextConfig);
    scrollController?.setSensitivity(toWheelSensitivity(nextConfig.scrollStrength));
    scrollController?.setLoop(nextConfig.infiniteCorridor);
  },
  { deep: true },
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

  engine?.dispose();
  engine = null;
});
</script>

<template>
  <div ref="containerRef" class="art-gallery-runtime" aria-label="3D Art Gallery Runtime"></div>
</template>

<style scoped>
.art-gallery-runtime {
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  border-radius: 14px;
}
</style>

