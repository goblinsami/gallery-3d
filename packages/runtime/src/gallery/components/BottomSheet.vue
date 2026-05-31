<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { RenderedJourneyNodeContent } from "../utils/renderJourneyNodeContent";

type BottomSheetState = "collapsed" | "half" | "full";

interface Props {
  content: RenderedJourneyNodeContent | null;
  isMobile: boolean;
  desktopSide: "left" | "right";
  desktopWidth: 0.25 | 0.5;
  externalState?: BottomSheetState | null;
}

const DRAG_THRESHOLD_PX = 36;
const DRAG_TAP_EPSILON_PX = 10;
const HANDLE_CLICK_SUPPRESSION_MS = 260;

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "state-change", state: BottomSheetState): void;
}>();

const sheetRef = ref<HTMLElement | null>(null);
const sheetState = ref<BottomSheetState>("collapsed");
const dragPointerId = ref<number | null>(null);
const dragStartY = ref(0);
const suppressHandleClickUntil = ref(0);

const hasContent = computed(() => Boolean(props.content));
const isExpanded = computed(() => sheetState.value !== "collapsed");
const isFullExpanded = computed(() => sheetState.value === "full");
const stateClass = computed(() => `bottom-sheet--${sheetState.value}`);
const viewportClass = computed(() => (props.isMobile ? "bottom-sheet--mobile" : "bottom-sheet--desktop"));
const desktopSideClass = computed(() => `bottom-sheet--desktop-${props.desktopSide}`);
const desktopWidthClass = computed(() => `bottom-sheet--desktop-width-${props.desktopWidth === 0.5 ? "50" : "25"}`);
const desktopSplitClass = computed(
  () => (!props.isMobile && sheetState.value !== "collapsed" ? "bottom-sheet--desktop-split" : ""),
);

const setSheetState = async (nextState: BottomSheetState): Promise<void> => {
  if (sheetState.value === nextState) {
    return;
  }

  sheetState.value = nextState;
  emit("state-change", nextState);

  if (nextState !== "collapsed") {
    await nextTick();
    sheetRef.value?.focus();
  }
};

const expandOneLevel = (): void => {
  if (sheetState.value === "collapsed") {
    void setSheetState("half");
    return;
  }

  if (sheetState.value === "half") {
    void setSheetState("full");
  }
};

const collapseOneLevel = (): void => {
  if (sheetState.value === "full") {
    void setSheetState("half");
    return;
  }

  if (sheetState.value === "half") {
    void setSheetState("collapsed");
  }
};

const closeSheet = (): void => {
  void setSheetState("collapsed");
};

const handleHandleClick = (): void => {
  if (performance.now() < suppressHandleClickUntil.value) {
    return;
  }

  if (sheetState.value === "collapsed") {
    void setSheetState("half");
    return;
  }

  void setSheetState("collapsed");
};

const onSummaryClick = (): void => {
  if (sheetState.value === "collapsed") {
    void setSheetState("half");
    return;
  }

  if (sheetState.value === "half") {
    void setSheetState("full");
  }
};

const startHandleDrag = (event: PointerEvent): void => {
  if (!hasContent.value) {
    return;
  }

  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  dragPointerId.value = event.pointerId;
  dragStartY.value = event.clientY;

  if (event.currentTarget instanceof Element && typeof event.currentTarget.setPointerCapture === "function") {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // noop
    }
  }
};

const endHandleDrag = (event: PointerEvent): void => {
  if (dragPointerId.value !== event.pointerId) {
    return;
  }

  const deltaY = event.clientY - dragStartY.value;
  const absDeltaY = Math.abs(deltaY);
  dragPointerId.value = null;

  if (event.currentTarget instanceof Element && typeof event.currentTarget.releasePointerCapture === "function") {
    try {
      if (
        typeof event.currentTarget.hasPointerCapture === "function" &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // noop
    }
  }

  if (absDeltaY <= DRAG_TAP_EPSILON_PX) {
    return;
  }

  suppressHandleClickUntil.value = performance.now() + HANDLE_CLICK_SUPPRESSION_MS;
  if (deltaY <= -DRAG_THRESHOLD_PX) {
    expandOneLevel();
    return;
  }

  if (deltaY >= DRAG_THRESHOLD_PX) {
    collapseOneLevel();
  }
};

const cancelHandleDrag = (): void => {
  dragPointerId.value = null;
};

const onWindowKeyDown = (event: KeyboardEvent): void => {
  if (!hasContent.value) {
    return;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
  ) {
    return;
  }

  if (event.key === "Escape" && sheetState.value !== "collapsed") {
    event.preventDefault();
    closeSheet();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    expandOneLevel();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    collapseOneLevel();
  }
};

watch(
  () => props.content?.node.id,
  (nextId) => {
    if (!nextId) {
      closeSheet();
    }
  },
);

watch(
  () => props.externalState,
  (nextState) => {
    if (!nextState) {
      return;
    }
    void setSheetState(nextState);
  },
);

onMounted(() => {
  emit("state-change", sheetState.value);
  window.addEventListener("keydown", onWindowKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onWindowKeyDown);
});
</script>

<template>
  <section
    v-if="hasContent && content"
    ref="sheetRef"
    class="bottom-sheet"
    :class="[stateClass, viewportClass, desktopSplitClass, desktopSideClass, desktopWidthClass]"
    role="region"
    aria-label="Journey details panel"
    :aria-expanded="isExpanded"
    tabindex="-1"
  >
    <article class="bottom-sheet__surface">
      <header class="bottom-sheet__rail">
        <button
          type="button"
          class="bottom-sheet__handle"
          aria-label="Toggle details panel"
          :aria-expanded="isExpanded"
          @click="handleHandleClick"
          @pointerdown="startHandleDrag"
          @pointerup="endHandleDrag"
          @pointercancel="cancelHandleDrag"
        >
          <span class="bottom-sheet__grip" />
        </button>
        <button
          v-if="isExpanded"
          type="button"
          class="bottom-sheet__close"
          aria-label="Close details panel"
          @click="closeSheet"
        >
          &times;
        </button>
      </header>

      <button type="button" class="bottom-sheet__summary" @click="onSummaryClick">
        <img
          v-if="content.thumbnailUrl"
          class="bottom-sheet__thumb"
          :src="content.thumbnailUrl"
          :alt="`${content.title} thumbnail`"
          loading="lazy"
        />
        <div class="bottom-sheet__summary-copy">
          <p class="bottom-sheet__eyebrow">{{ content.eyebrow }}</p>
          <h3 class="bottom-sheet__title">{{ content.title }}</h3>
          <p v-if="content.subtitle" class="bottom-sheet__subtitle">{{ content.subtitle }}</p>
        </div>
        <p class="bottom-sheet__progress">{{ content.progressLabel }}</p>
      </button>

      <div v-if="!isExpanded" class="bottom-sheet__collapsed-bottom-zone" aria-hidden="true" />

      <div
        v-if="isExpanded"
        class="bottom-sheet__body"
        :class="{ 'bottom-sheet__body--full': isFullExpanded }"
        @wheel.stop
        @touchmove.stop
      >
        <p v-if="content.description" class="bottom-sheet__description">
          {{ content.description }}
        </p>

        <section
          v-for="section in content.sections"
          :key="section.id"
          class="bottom-sheet__section"
        >
          <h4 class="bottom-sheet__section-title">{{ section.title }}</h4>
          <ul class="bottom-sheet__list">
            <li v-for="line in section.lines" :key="line">{{ line }}</li>
          </ul>
        </section>

        <section v-if="content.socialLinks.length > 0" class="bottom-sheet__section">
          <h4 class="bottom-sheet__section-title">Links</h4>
          <ul class="bottom-sheet__list bottom-sheet__list--links">
            <li v-for="link in content.socialLinks" :key="`${link.label}:${link.url}`">
              <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
            </li>
          </ul>
        </section>

        <p v-if="content.cta" class="bottom-sheet__cta">
          <a :href="content.cta.url" target="_blank" rel="noopener noreferrer">
            {{ content.cta.label }}
          </a>
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.bottom-sheet {
  position: absolute;
  inset: 0;
  z-index: 9;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  pointer-events: none;
}

.bottom-sheet--desktop {
  --sheet-max-width: min(720px, calc(100% - 34px));
  --desktop-sheet-width: 50%;
  --sheet-collapsed-height: 88px;
  --collapsed-handle-zone: 20px;
  --sheet-half-height: min(50%, 440px);
  --sheet-full-height: min(100%, 760px);
}

.bottom-sheet--desktop-width-25 {
  --desktop-sheet-width: 25%;
}

.bottom-sheet--desktop-width-50 {
  --desktop-sheet-width: 50%;
}

.bottom-sheet--mobile {
  --sheet-max-width: 100%;
  --sheet-collapsed-height: 82px;
  --collapsed-handle-zone: 18px;
  --sheet-half-height: 58%;
  --sheet-full-height: 100%;
}

.bottom-sheet__surface {
  width: var(--sheet-max-width);
  height: var(--sheet-collapsed-height);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  border-radius: 20px;
  border: 1px solid rgba(244, 247, 255, 0.2);
  background: linear-gradient(
    145deg,
    rgba(10, 15, 26, 0.86) 0%,
    rgba(8, 12, 21, 0.94) 100%
  );
  backdrop-filter: blur(22px);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.46);
  transition:
    height 320ms cubic-bezier(0.24, 0.82, 0.21, 1),
    border-radius 320ms cubic-bezier(0.24, 0.82, 0.21, 1),
    background-color 320ms ease;
}

.bottom-sheet--half .bottom-sheet__surface {
  height: var(--sheet-half-height);
}

.bottom-sheet--full .bottom-sheet__surface {
  height: var(--sheet-full-height);
}

.bottom-sheet--desktop.bottom-sheet--full {
  padding-top: 10px;
}

.bottom-sheet--desktop-split {
  align-items: stretch;
  justify-content: flex-start;
  padding: 10px;
}

.bottom-sheet--desktop-split.bottom-sheet--desktop-right {
  justify-content: flex-end;
}

.bottom-sheet--desktop-split .bottom-sheet__surface {
  width: var(--desktop-sheet-width);
  height: 100%;
  max-height: calc(100% - 2px);
}

.bottom-sheet--desktop-split.bottom-sheet--half .bottom-sheet__surface,
.bottom-sheet--desktop-split.bottom-sheet--full .bottom-sheet__surface {
  height: 100%;
}

.bottom-sheet--mobile.bottom-sheet--full {
  padding: 0;
}

.bottom-sheet--mobile.bottom-sheet--full .bottom-sheet__surface {
  width: 100%;
  border-radius: 20px 20px 0 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
}

.bottom-sheet__rail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 8px 12px 2px;
}

.bottom-sheet--collapsed .bottom-sheet__rail {
  min-height: var(--collapsed-handle-zone);
  padding: 6px 10px 0;
}

.bottom-sheet__handle {
  width: 100%;
  display: flex;
  justify-content: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}

.bottom-sheet__handle:focus-visible,
.bottom-sheet__close:focus-visible,
.bottom-sheet__summary:focus-visible {
  outline: 2px solid rgba(137, 207, 255, 0.94);
  outline-offset: 2px;
}

.bottom-sheet__grip {
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: rgba(215, 228, 248, 0.8);
}

.bottom-sheet__close {
  position: absolute;
  right: 10px;
  top: 4px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.06));
  color: #f2f6ff;
  font-size: 1.35rem;
  line-height: 1;
  letter-spacing: 0;
  padding: 0;
  cursor: pointer;
}

.bottom-sheet__summary {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: calc(var(--sheet-collapsed-height) - 24px);
  padding: 8px 14px 14px;
  background: transparent;
  border: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.bottom-sheet--collapsed .bottom-sheet__summary {
  min-height: calc(var(--sheet-collapsed-height) - (var(--collapsed-handle-zone) * 2));
  padding: 2px 14px;
}

.bottom-sheet__collapsed-bottom-zone {
  min-height: var(--collapsed-handle-zone);
  flex-shrink: 0;
}

.bottom-sheet__thumb {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.bottom-sheet__summary-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.bottom-sheet__eyebrow {
  margin: 0;
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(188, 205, 233, 0.95);
}

.bottom-sheet__title {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.2;
  color: #f4f8ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom-sheet__subtitle {
  margin: 0;
  color: rgba(214, 227, 247, 0.94);
  font-size: 0.79rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom-sheet__progress {
  margin: 0 0 0 auto;
  flex-shrink: 0;
  font-size: 0.77rem;
  font-weight: 600;
  color: rgba(211, 225, 246, 0.96);
}

.bottom-sheet__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  color: #e9f1ff;
  scrollbar-width: thin;
  scrollbar-color: rgba(170, 194, 228, 0.55) transparent;
}

.bottom-sheet__body--full {
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.bottom-sheet__description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(232, 239, 250, 0.96);
  white-space: pre-wrap;
}

.bottom-sheet__section {
  margin-top: 14px;
}

.bottom-sheet__section-title {
  margin: 0 0 6px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(183, 202, 230, 0.92);
}

.bottom-sheet__list {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
  font-size: 0.84rem;
  line-height: 1.4;
  color: rgba(224, 234, 249, 0.94);
}

.bottom-sheet__list--links {
  padding-left: 0;
  list-style: none;
}

.bottom-sheet__list--links a,
.bottom-sheet__cta a {
  color: #d7ecff;
  text-decoration: none;
}

.bottom-sheet__list--links a:hover,
.bottom-sheet__cta a:hover {
  text-decoration: underline;
}

.bottom-sheet__cta {
  margin: 16px 0 0;
  font-size: 0.84rem;
  font-weight: 600;
}

@media (max-width: 900px) {
  .bottom-sheet--desktop {
    --sheet-max-width: min(100%, calc(100% - 20px));
    --sheet-half-height: 56%;
  }
}
</style>


