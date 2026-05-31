<script setup lang="ts">
import { computed, ref } from "vue";
import ArtGalleryRuntime from "../components/ArtGalleryRuntime.vue";
import { sampleGalleryConfigs } from "./sampleGalleryConfig";
import type { ArtGallerySceneConfig, DeepPartial } from "../types/galleryConfig";
import { validateGalleryConfig } from "../utils/validateGalleryConfig";
import { GALLERY_TOKENS } from "../config/galleryTokens";
import PlaygroundControlInput from "./components/PlaygroundControlInput.vue";
import {
  ASPECT_RATIO_PRESET_VALUES,
  DEFAULT_CAMERA_ASPECT_PRESET,
  DEFAULT_MOBILE_CAMERA_ASPECT_PRESET,
  PLAYGROUND_CONTROLS,
  resolveAspectPresetFromRatio,
  type AspectRatioPreset,
  type PlaygroundControlDefinition,
  type PlaygroundControlOption,
} from "./playgroundControlMap";
import { deepClone, getValueAtPath, setValueAtPath } from "./playgroundControlUtils";

interface ControlSection {
  title: string;
  controls: PlaygroundControlDefinition[];
}

const initialSample =
  sampleGalleryConfigs.find((sample) => sample.id === "portfolio-stations") ??
  sampleGalleryConfigs[0];
const activeSampleId = ref(initialSample.id);
const cameraAspectPreset = ref<AspectRatioPreset>(
  resolveAspectPresetFromRatio(initialSample.camera.targetAspectRatio, DEFAULT_CAMERA_ASPECT_PRESET),
);
const mobileCameraAspectPreset = ref<AspectRatioPreset>(
  resolveAspectPresetFromRatio(
    initialSample.camera.mobileTargetAspectRatio,
    DEFAULT_MOBILE_CAMERA_ASPECT_PRESET,
  ),
);
const isMobileMode = ref(false);
const rawConfig = ref<DeepPartial<ArtGallerySceneConfig>>(deepClone(initialSample));
const jsonDraft = ref(JSON.stringify(rawConfig.value, null, 2));
const parseError = ref("");
const progressLabel = ref("0.000");
const isToolbarVisible = ref(true);

const tokens = GALLERY_TOKENS;

const validationResult = computed(() => validateGalleryConfig(rawConfig.value));

const feedbackMessage = computed(() => {
  if (parseError.value) {
    return parseError.value;
  }

  if (validationResult.value.errors.length > 0) {
    return validationResult.value.errors.join(" | ");
  }

  if (validationResult.value.warnings.length > 0) {
    return validationResult.value.warnings.join(" | ");
  }

  return "Config ready.";
});

const hasFeedbackError = computed(
  () => Boolean(parseError.value) || validationResult.value.errors.length > 0,
);

const controlOptionsByKey = computed<Record<string, PlaygroundControlOption[]>>(() => ({
  samplePreset: sampleGalleryConfigs.map((sample) => ({
    label: sample.sceneTitle,
    value: sample.id,
  })),
}));

const selectedSampleTemplate = computed(
  () => sampleGalleryConfigs.find((entry) => entry.id === activeSampleId.value) ?? sampleGalleryConfigs[0],
);

const controlsBySection = computed<ControlSection[]>(() => {
  const grouped = new Map<string, PlaygroundControlDefinition[]>();

  for (const control of PLAYGROUND_CONTROLS) {
    const current = grouped.get(control.section);
    if (current) {
      current.push(control);
      continue;
    }
    grouped.set(control.section, [control]);
  }

  return Array.from(grouped.entries()).map(([title, controls]) => ({ title, controls }));
});

const syncJsonDraft = (): void => {
  jsonDraft.value = JSON.stringify(rawConfig.value, null, 2);
};

const sanitizeFileSegment = (value: string): string => {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "");
  return sanitized || "template";
};

const downloadJsonFile = (fileName: string, payload: unknown): void => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
};

const showActiveTemplateJson = (): void => {
  jsonDraft.value = JSON.stringify(selectedSampleTemplate.value, null, 2);
  parseError.value = "";
};

const downloadActiveTemplateJson = (): void => {
  const template = selectedSampleTemplate.value;
  downloadJsonFile(`template-${sanitizeFileSegment(template.id)}.json`, template);
};

const downloadAllTemplatesJson = (): void => {
  const payload = sampleGalleryConfigs.map((template) => ({
    id: template.id,
    sceneTitle: template.sceneTitle,
    config: template,
  }));
  downloadJsonFile("gallery-templates.json", payload);
};

const applyAspectRatioPresetsToConfig = (): void => {
  setValueAtPath(
    rawConfig.value as unknown as Record<string, unknown>,
    "camera.targetAspectRatio",
    ASPECT_RATIO_PRESET_VALUES[cameraAspectPreset.value],
  );
  setValueAtPath(
    rawConfig.value as unknown as Record<string, unknown>,
    "camera.mobileTargetAspectRatio",
    ASPECT_RATIO_PRESET_VALUES[mobileCameraAspectPreset.value],
  );
};

applyAspectRatioPresetsToConfig();
syncJsonDraft();

const resetFromSample = (sampleId: string): void => {
  const sample = sampleGalleryConfigs.find((entry) => entry.id === sampleId) ?? sampleGalleryConfigs[0];
  activeSampleId.value = sample.id;
  rawConfig.value = deepClone(sample);
  cameraAspectPreset.value = resolveAspectPresetFromRatio(
    sample.camera.targetAspectRatio,
    DEFAULT_CAMERA_ASPECT_PRESET,
  );
  mobileCameraAspectPreset.value = resolveAspectPresetFromRatio(
    sample.camera.mobileTargetAspectRatio,
    DEFAULT_MOBILE_CAMERA_ASPECT_PRESET,
  );
  applyAspectRatioPresetsToConfig();
  parseError.value = "";
  syncJsonDraft();
};

const resolveControlOptions = (control: PlaygroundControlDefinition): PlaygroundControlOption[] => {
  return controlOptionsByKey.value[control.key] ?? control.options ?? [];
};

const getControlValue = (control: PlaygroundControlDefinition): unknown => {
  switch (control.key) {
    case "samplePreset":
      return activeSampleId.value;
    case "mobileMode":
      return isMobileMode.value;
    case "cameraAspectPreset":
      return cameraAspectPreset.value;
    case "mobileCameraAspectPreset":
      return mobileCameraAspectPreset.value;
    default: {
      const fromPath = getValueAtPath(rawConfig.value, control.path);
      return fromPath ?? control.defaultValue;
    }
  }
};

const setControlValue = (control: PlaygroundControlDefinition, value: unknown): void => {
  parseError.value = "";

  switch (control.key) {
    case "samplePreset":
      resetFromSample(String(value));
      return;
    case "mobileMode":
      isMobileMode.value = Boolean(value);
      return;
    case "cameraAspectPreset":
      cameraAspectPreset.value = String(value) as AspectRatioPreset;
      applyAspectRatioPresetsToConfig();
      syncJsonDraft();
      return;
    case "mobileCameraAspectPreset":
      mobileCameraAspectPreset.value = String(value) as AspectRatioPreset;
      applyAspectRatioPresetsToConfig();
      syncJsonDraft();
      return;
    default:
      setValueAtPath(rawConfig.value as unknown as Record<string, unknown>, control.path, value);
      syncJsonDraft();
  }
};

const applyJsonDraft = (): void => {
  try {
    const parsed = JSON.parse(jsonDraft.value) as DeepPartial<ArtGallerySceneConfig>;
    rawConfig.value = parsed;
    cameraAspectPreset.value = resolveAspectPresetFromRatio(
      parsed.camera?.targetAspectRatio,
      DEFAULT_CAMERA_ASPECT_PRESET,
    );
    mobileCameraAspectPreset.value = resolveAspectPresetFromRatio(
      parsed.camera?.mobileTargetAspectRatio,
      DEFAULT_MOBILE_CAMERA_ASPECT_PRESET,
    );
    parseError.value = "";
    syncJsonDraft();
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : "Invalid JSON payload";
  }
};

const onRuntimeProgress = (progress: number): void => {
  progressLabel.value = progress.toFixed(3);
};
</script>

<template>
  <main
    class="playground"
    :class="{ 'toolbar-hidden': !isToolbarVisible }"
    :style="{
      '--token-bg': tokens.ui.htmlBackground,
      '--token-panel': tokens.ui.panelBackground,
      '--token-border': tokens.ui.panelBorder,
      '--token-text': tokens.ui.panelText,
      '--token-muted': tokens.ui.panelMutedText,
      '--token-accent': tokens.ui.accent,
      '--token-gradient-start': tokens.ui.bodyGradientStart,
      '--token-gradient-end': tokens.ui.bodyGradientEnd,
      '--token-toolbar-bg': tokens.ui.toolbarBackground,
      '--token-field-bg': tokens.ui.fieldBackground,
      '--token-button-end': tokens.ui.buttonAccentEnd,
      '--token-button-text': tokens.ui.buttonText,
      '--token-meta': tokens.ui.metaText,
      '--token-feedback-ok': tokens.ui.feedbackSuccess,
      '--token-feedback-error': tokens.ui.feedbackError,
    }"
  >
    <button type="button" class="toolbar-toggle" @click="isToolbarVisible = !isToolbarVisible">
      {{ isToolbarVisible ? "Hide Toolbar" : "Show Toolbar" }}
    </button>

    <aside v-show="isToolbarVisible" class="control-panel">
      <h1>Runtime-Exact Playground</h1>
      <p>Todos los controles salen de un mapa único y aplican sobre el runtime real.</p>

      <section v-for="section in controlsBySection" :key="section.title" class="control-section">
        <h2>{{ section.title }}</h2>
        <PlaygroundControlInput
          v-for="control in section.controls"
          :key="control.key"
          :control="control"
          :options="resolveControlOptions(control)"
          :model-value="getControlValue(control)"
          @update:model-value="setControlValue(control, $event)"
        />
      </section>

      <p class="meta">Current progress: {{ progressLabel }}</p>
      <p class="meta">Template activo: {{ selectedSampleTemplate.id }}</p>

      <div class="template-actions">
        <button type="button" class="secondary-button" @click="showActiveTemplateJson">
          Ver JSON real del template activo
        </button>
        <button type="button" class="secondary-button" @click="downloadActiveTemplateJson">
          Descargar template activo (.json)
        </button>
        <button type="button" class="secondary-button" @click="downloadAllTemplatesJson">
          Descargar todos los templates (.json)
        </button>
      </div>

      <label class="json-label">
        Runtime JSON Draft
        <textarea v-model="jsonDraft" spellcheck="false" />
      </label>

      <button type="button" @click="applyJsonDraft">Apply JSON</button>
      <p class="feedback" :class="{ error: hasFeedbackError }">
        {{ feedbackMessage }}
      </p>
    </aside>

    <section class="preview-panel">
      <div class="preview-viewport" :class="{ mobile: isMobileMode }">
        <ArtGalleryRuntime
          :config="rawConfig"
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
  background: radial-gradient(
    circle at 20% 10%,
    var(--token-gradient-start) 0%,
    var(--token-bg) 45%,
    var(--token-gradient-end) 100%
  );
  color: var(--token-text);
}

.playground {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 420px) 1fr;
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
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--token-border);
  border-radius: 14px;
  background: var(--token-panel);
  backdrop-filter: blur(10px);
  overflow: auto;
}

.control-panel h1 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.01em;
}

.control-panel p {
  margin: 0;
  color: var(--token-muted);
  line-height: 1.35;
}

.control-section {
  display: grid;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.control-section h2 {
  margin: 0;
  font-size: 0.88rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--token-meta);
}

textarea,
button {
  border-radius: 10px;
  border: 1px solid var(--token-border);
  background: var(--token-field-bg);
  color: var(--token-text);
  padding: 9px 10px;
  font: inherit;
  box-sizing: border-box;
}

textarea {
  min-height: 220px;
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

.template-actions {
  display: grid;
  gap: 8px;
}

.secondary-button {
  background: var(--token-field-bg);
  border-color: var(--token-border);
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
