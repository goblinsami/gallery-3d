<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ArtGalleryRuntime from "../components/ArtGalleryRuntime.vue";
import { sampleGalleryConfigs } from "./sampleGalleryConfig";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";

const ASPECT_RATIO_PRESETS = {
  auto: undefined,
  "9:20": 9 / 20,
  "20:9": 20 / 9,
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "3:4": 3 / 4,
} as const;

const activeSampleId = ref(sampleGalleryConfigs[0].id);
const activeLightingMode = ref(sampleGalleryConfigs[0].lightingMode);
const activeAspectRatioPreset = ref<keyof typeof ASPECT_RATIO_PRESETS>("auto");
const activeMobileAspectRatioPreset = ref<keyof typeof ASPECT_RATIO_PRESETS>("3:4");
const mobileBreakpointWidth = ref(820);
const runtimeConfig = ref<ArtGallerySceneConfig>(sampleGalleryConfigs[0]);
const jsonDraft = ref(JSON.stringify(runtimeConfig.value, null, 2));
const parseError = ref("");
const progressLabel = ref("0.000");
const isToolbarVisible = ref(true);
const isMobileMode = ref(false);

const sampleOptions = computed(() =>
  sampleGalleryConfigs.map((sample) => ({
    id: sample.id,
    label: sample.sceneTitle,
  })),
);

const tokens = GALLERY_TOKENS;

const updateConfigWithAspectRatios = (): void => {
  runtimeConfig.value = {
    ...runtimeConfig.value,
    camera: {
      ...runtimeConfig.value.camera,
      targetAspectRatio: ASPECT_RATIO_PRESETS[activeAspectRatioPreset.value],
      mobileTargetAspectRatio: ASPECT_RATIO_PRESETS[activeMobileAspectRatioPreset.value],
      mobileBreakpointWidth: mobileBreakpointWidth.value,
    },
  };
  jsonDraft.value = JSON.stringify(runtimeConfig.value, null, 2);
};

watch([activeSampleId, activeLightingMode], ([sampleId, lightingMode]) => {
  const selected = sampleGalleryConfigs.find((sample) => sample.id === sampleId) ?? sampleGalleryConfigs[0];
  runtimeConfig.value = {
    ...selected,
    lightingMode,
    camera: {
      ...selected.camera,
      targetAspectRatio: ASPECT_RATIO_PRESETS[activeAspectRatioPreset.value],
      mobileTargetAspectRatio: ASPECT_RATIO_PRESETS[activeMobileAspectRatioPreset.value],
      mobileBreakpointWidth: mobileBreakpointWidth.value,
    },
  };
  jsonDraft.value = JSON.stringify(runtimeConfig.value, null, 2);
  parseError.value = "";
});

watch([activeAspectRatioPreset, activeMobileAspectRatioPreset, mobileBreakpointWidth], () => {
  updateConfigWithAspectRatios();
});

const applyJsonDraft = (): void => {
  try {
    const parsed = JSON.parse(jsonDraft.value) as Partial<ArtGallerySceneConfig>;
    const validation = validateGalleryConfig(parsed);

    if (validation.errors.length > 0) {
      parseError.value = validation.errors.join(" | ");
      return;
    }

    runtimeConfig.value = validation.config;
    activeLightingMode.value = validation.config.lightingMode;
    activeSampleId.value = validation.config.id;
    parseError.value = validation.warnings.join(" | ");
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : "Invalid JSON payload";
  }
};

const onRuntimeProgress = (progress: number): void => {
  progressLabel.value = progress.toFixed(3);
};
</script>

<template>
  <main class="playground" :class="{ 'toolbar-hidden': !isToolbarVisible }" :style="{ '--token-bg': tokens.ui.htmlBackground, '--token-panel': tokens.ui.panelBackground, '--token-border': tokens.ui.panelBorder, '--token-text': tokens.ui.panelText, '--token-muted': tokens.ui.panelMutedText, '--token-accent': tokens.ui.accent, '--token-gradient-start': tokens.ui.bodyGradientStart, '--token-gradient-end': tokens.ui.bodyGradientEnd, '--token-toolbar-bg': tokens.ui.toolbarBackground, '--token-field-bg': tokens.ui.fieldBackground, '--token-button-end': tokens.ui.buttonAccentEnd, '--token-button-text': tokens.ui.buttonText, '--token-meta': tokens.ui.metaText, '--token-feedback-ok': tokens.ui.feedbackSuccess, '--token-feedback-error': tokens.ui.feedbackError }">
    <button type="button" class="toolbar-toggle" @click="isToolbarVisible = !isToolbarVisible">
      {{ isToolbarVisible ? "Hide Toolbar" : "Show Toolbar" }}
    </button>

    <aside v-show="isToolbarVisible" class="control-panel">
      <h1>JSON-Driven 3D Gallery</h1>
      <p>
        Scroll sobre el viewport para avanzar o retroceder el recorrido cinematográfico.
      </p>

      <label>
        Sample Scene
        <select v-model="activeSampleId">
          <option
            v-for="option in sampleOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        Lighting Mode
        <select v-model="activeLightingMode">
          <option value="contrast">contrast</option>
          <option value="day">day</option>
        </select>
      </label>

      <label>
        Aspect Ratio
        <select v-model="activeAspectRatioPreset">
          <option value="auto">auto</option>
          <option value="9:20">9:20</option>
          <option value="20:9">20:9</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
          <option value="3:4">3:4</option>
        </select>
      </label>

      <label>
        Mobile Aspect Ratio
        <select v-model="activeMobileAspectRatioPreset">
          <option value="auto">auto</option>
          <option value="9:20">9:20</option>
          <option value="20:9">20:9</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
          <option value="3:4">3:4</option>
        </select>
      </label>

      <label>
        Mobile Breakpoint (px)
        <input v-model.number="mobileBreakpointWidth" type="number" min="320" max="1600" step="10" />
      </label>

      <button type="button" class="mode-toggle" @click="isMobileMode = !isMobileMode">
        {{ isMobileMode ? "Mobile Mode: ON" : "Mobile Mode: OFF" }}
      </button>

      <p class="meta">Current progress: {{ progressLabel }}</p>

      <label class="json-label">
        Runtime JSON
        <textarea v-model="jsonDraft" spellcheck="false" />
      </label>

      <button type="button" @click="applyJsonDraft">Apply JSON</button>
      <p class="feedback" :class="{ error: Boolean(parseError) }">
        {{ parseError || "Config ready." }}
      </p>
    </aside>

    <section class="preview-panel">
      <div class="preview-viewport" :class="{ mobile: isMobileMode }">
        <ArtGalleryRuntime
          :config="runtimeConfig"
          :force-mobile-mode="isMobileMode"
          @progress="onRuntimeProgress"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  margin: 0;
  width: 100%;
  height: 100%;
}

:global(body) {
  font-family: "Space Grotesk", "Manrope", "Segoe UI", sans-serif;
  background: radial-gradient(circle at 20% 10%, var(--token-gradient-start) 0%, var(--token-bg) 45%, var(--token-gradient-end) 100%);
  color: var(--token-text);
}

.playground {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 380px) 1fr;
  gap: 18px;
  padding: 18px;
  box-sizing: border-box;
  position: relative;
}

.playground.toolbar-hidden {
  grid-template-columns: 1fr;
}

.toolbar-toggle {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 8;
  border-radius: 999px;
  border: 1px solid var(--token-border);
  background: var(--token-toolbar-bg);
  color: var(--token-text);
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.control-panel {
  display: grid;
  grid-auto-rows: min-content;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--token-border);
  border-radius: 14px;
  background: var(--token-panel);
  backdrop-filter: blur(10px);
}

.control-panel h1 {
  margin: 0;
  font-size: 1.3rem;
  letter-spacing: 0.01em;
}

.control-panel p {
  margin: 0;
  color: var(--token-muted);
  line-height: 1.35;
}

label {
  display: grid;
  gap: 8px;
  font-size: 0.9rem;
}

select,
textarea,
input,
button {
  border-radius: 10px;
  border: 1px solid var(--token-border);
  background: var(--token-field-bg);
  color: var(--token-text);
  padding: 9px 10px;
  font: inherit;
}

textarea {
  min-height: 230px;
  resize: vertical;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.78rem;
  line-height: 1.35;
}

button {
  cursor: pointer;
  background: linear-gradient(130deg, var(--token-accent), var(--token-button-end));
  border-color: transparent;
  color: var(--token-button-text);
  font-weight: 600;
}

.toolbar-toggle {
  background: var(--token-toolbar-bg);
  border-color: var(--token-border);
  color: var(--token-text);
}

.preview-panel {
  display: grid;
  align-items: center;
  min-width: 0;
  min-height: 0;
}

.preview-viewport {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.preview-viewport.mobile {
  width: min(100%, 430px);
  height: min(100%, 780px);
  max-height: 82vh;
  margin: 0 auto;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 8px;
  box-sizing: border-box;
  background: linear-gradient(155deg, rgba(24, 30, 43, 0.9), rgba(9, 13, 20, 0.95));
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45);
}

.toolbar-hidden .preview-panel {
  grid-column: 1 / -1;
}

.meta {
  color: var(--token-meta);
  font-size: 0.84rem;
}

.feedback {
  font-size: 0.82rem;
  color: var(--token-feedback-ok);
}

.feedback.error {
  color: var(--token-feedback-error);
}

.mode-toggle {
  background: transparent;
  border: 1px solid var(--token-border);
  color: var(--token-text);
}

@media (max-width: 960px) {
  .playground {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(440px, 1fr);
  }

  .toolbar-toggle {
    top: 14px;
    left: 14px;
  }
}
</style>
