<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PlaygroundControlDefinition, PlaygroundControlOption } from "../playgroundControlMap";

interface Props {
  control: PlaygroundControlDefinition;
  modelValue: unknown;
  options?: PlaygroundControlOption[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "update:modelValue", value: unknown): void;
}>();

const localJson = ref("");
const jsonError = ref("");

const resolvedOptions = computed<PlaygroundControlOption[]>(() => props.options ?? props.control.options ?? []);

const defaultValueLabel = computed(() => {
  const value = props.control.defaultValue;
  if (typeof value === "object" && value !== null) {
    return "JSON";
  }
  return String(value);
});

const commitNumber = (raw: string): void => {
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    emit("update:modelValue", parsed);
  }
};

const commitBoolean = (value: boolean): void => {
  emit("update:modelValue", value);
};

const commitText = (value: string): void => {
  emit("update:modelValue", value);
};

const commitSelect = (value: string): void => {
  emit("update:modelValue", value);
};

const commitJson = (): void => {
  try {
    const nextValue = JSON.parse(localJson.value);
    jsonError.value = "";
    emit("update:modelValue", nextValue);
  } catch (error) {
    jsonError.value = error instanceof Error ? error.message : "Invalid JSON";
  }
};

watch(
  () => props.modelValue,
  (value) => {
    if (props.control.inputType !== "json") {
      return;
    }

    localJson.value = JSON.stringify(value ?? props.control.defaultValue, null, 2);
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <label class="control-input">
    <span class="control-title">{{ control.label }}</span>
    <span class="control-description">{{ control.description }}</span>

    <input
      v-if="control.inputType === 'text'"
      type="text"
      :value="String(modelValue ?? '')"
      @input="commitText(($event.target as HTMLInputElement).value)"
    />

    <input
      v-else-if="control.inputType === 'color'"
      type="text"
      :value="String(modelValue ?? '')"
      @input="commitText(($event.target as HTMLInputElement).value)"
    />

    <input
      v-else-if="control.inputType === 'number'"
      type="number"
      :value="typeof modelValue === 'number' ? modelValue : Number(control.defaultValue)"
      :min="control.min"
      :max="control.max"
      :step="control.step ?? 0.01"
      @input="commitNumber(($event.target as HTMLInputElement).value)"
    />

    <input
      v-else-if="control.inputType === 'boolean'"
      type="checkbox"
      class="checkbox"
      :checked="Boolean(modelValue)"
      @change="commitBoolean(($event.target as HTMLInputElement).checked)"
    />

    <select
      v-else-if="control.inputType === 'select'"
      :value="String(modelValue ?? control.defaultValue)"
      @change="commitSelect(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in resolvedOptions"
        :key="`${control.key}-${String(option.value)}`"
        :value="String(option.value)"
      >
        {{ option.label }}
      </option>
    </select>

    <div v-else-if="control.inputType === 'json'" class="json-control">
      <textarea
        :rows="control.rows ?? 6"
        :value="localJson"
        spellcheck="false"
        @input="localJson = ($event.target as HTMLTextAreaElement).value"
      />
      <div class="json-actions">
        <button type="button" @click="commitJson">Apply JSON Field</button>
        <span v-if="jsonError" class="json-error">{{ jsonError }}</span>
      </div>
    </div>

    <span class="control-meta">
      Type: {{ control.inputType }}
      <template v-if="control.min !== undefined"> | Min: {{ control.min }}</template>
      <template v-if="control.max !== undefined"> | Max: {{ control.max }}</template>
      <template v-if="control.step !== undefined"> | Step: {{ control.step }}</template>
      | Default: {{ defaultValueLabel }}
    </span>
  </label>
</template>

<style scoped>
.control-input {
  display: grid;
  gap: 8px;
  font-size: 0.88rem;
}

.control-title {
  font-weight: 700;
}

.control-description {
  font-size: 0.78rem;
  color: var(--token-muted);
  line-height: 1.35;
}

input,
select,
textarea,
button {
  border-radius: 10px;
  border: 1px solid var(--token-border);
  background: var(--token-field-bg);
  color: var(--token-text);
  padding: 8px 10px;
  font: inherit;
  box-sizing: border-box;
}

.checkbox {
  width: 18px;
  height: 18px;
  padding: 0;
}

.json-control {
  display: grid;
  gap: 8px;
}

textarea {
  resize: vertical;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.76rem;
  line-height: 1.35;
}

.json-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

button {
  cursor: pointer;
  font-weight: 600;
}

.json-error {
  color: var(--token-feedback-error);
  font-size: 0.74rem;
}

.control-meta {
  font-size: 0.73rem;
  color: var(--token-meta);
}
</style>

