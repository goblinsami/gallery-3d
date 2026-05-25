<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ArtGalleryRuntime from "../components/ArtGalleryRuntime.vue";
import { sampleGalleryConfigs } from "./sampleGalleryConfig";
import type { ArtGallerySceneConfig } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";

const activeSampleId = ref(sampleGalleryConfigs[0].id);
const activeLightingMode = ref(sampleGalleryConfigs[0].lightingMode);
const runtimeConfig = ref<ArtGallerySceneConfig>(sampleGalleryConfigs[0]);
const jsonDraft = ref(JSON.stringify(runtimeConfig.value, null, 2));
const parseError = ref("");
const progressLabel = ref("0.000");
const isToolbarVisible = ref(true);

const sampleOptions = computed(() =>
  sampleGalleryConfigs.map((sample) => ({
    id: sample.id,
    label: sample.sceneTitle,
  })),
);

const tokens = GALLERY_TOKENS;

watch([activeSampleId, activeLightingMode], ([sampleId, lightingMode]) => {
  const selected = sampleGalleryConfigs.find((sample) => sample.id === sampleId) ?? sampleGalleryConfigs[0];
  runtimeConfig.value = {
    ...selected,
    lightingMode,
  };
  jsonDraft.value = JSON.stringify(runtimeConfig.value, null, 2);
  parseError.value = "";
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
  <main class="playground" :class="{ 'toolbar-hidden': !isToolbarVisible }" :style="{ '--token-bg': tokens.htmlBackground, '--token-panel': tokens.panelBackground, '--token-border': tokens.panelBorder, '--token-text': tokens.panelText, '--token-muted': tokens.panelMutedText, '--token-accent': tokens.accent }">
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
      <ArtGalleryRuntime :config="runtimeConfig" @progress="onRuntimeProgress" />
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
  background: radial-gradient(circle at 20% 10%, #182235 0%, var(--token-bg) 45%, #06070b 100%);
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
  background: rgba(8, 13, 22, 0.82);
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
button {
  border-radius: 10px;
  border: 1px solid var(--token-border);
  background: rgba(3, 7, 14, 0.5);
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
  background: linear-gradient(130deg, var(--token-accent), #5f87d9);
  border-color: transparent;
  color: #041227;
  font-weight: 600;
}

.toolbar-toggle {
  background: rgba(8, 13, 22, 0.82);
  border-color: var(--token-border);
  color: var(--token-text);
}

.preview-panel {
  min-width: 0;
  min-height: 0;
}

.toolbar-hidden .preview-panel {
  grid-column: 1 / -1;
}

.meta {
  color: #ccd8ef;
  font-size: 0.84rem;
}

.feedback {
  font-size: 0.82rem;
  color: #9fefc8;
}

.feedback.error {
  color: #ffb5b5;
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

