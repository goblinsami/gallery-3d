# AI Entrypoint

## Repository Snapshot
- Purpose: JSON-driven cinematic 3D art gallery runtime (no backend/editor/CMS).
- Primary runtime flow: `config -> validate -> layout -> keyframes -> progress interpolation -> Three render`.
- Core abstraction: normalized `progress` in `[0..1]` controls camera, title fade, and artwork focus.

## Stack
- Vue 3 (`<script setup>`, Composition API)
- TypeScript (`strict`)
- Vite
- Three.js
- GSAP (`gsap.ticker` for scroll progression loop)
- Vitest (logic-heavy unit tests)

## Architecture Philosophy
- Deterministic rendering from config and progress.
- Scene building is modular (`scene/*`, `engine/*`, `journey/*`).
- Visual tokens/defaults are centralized (`config/galleryTokens.ts`, `constants/*`).
- Business progression math is separated from rendering primitives.

## Source Of Truth
- App playground runtime: `src/gallery/*`.
- Packaged web component runtime: `packages/runtime/src/*`.
- Important: `src/gallery/*` and `packages/runtime/src/gallery/*` are near-mirrors with runtime-specific viewport/bootstrap differences.
- Rule: if gallery logic changes, mirror equivalent changes to runtime package unless change is explicitly app-only.

## Coding Rules
- TypeScript strict only. No `any`.
- Reuse existing types in `types/*`; extend types before adding ad-hoc shapes.
- Keep config sanitation in `utils/validateGalleryConfig.ts`; never bypass validation.
- Keep animation/progression math in `journey/*`; keep scene object creation in `scene/*`.
- Put reusable constants in `constants/*` or `config/galleryTokens.ts`, not inline.

## Naming Conventions
- Files: `camelCase.ts` for utilities/factories, `PascalCase.vue` for components/classes.
- Scene factories: `createX.ts`.
- Journey math: verb-first (`build...`, `get...`, `calculate...`).
- Types: noun-based interfaces in `types/*`.

## Folder Conventions
- `src/gallery/components`: Vue runtime shell only.
- `src/gallery/engine`: lifecycle, renderer/camera/scene orchestration.
- `src/gallery/scene`: Three node/material/light construction.
- `src/gallery/journey`: timeline, keyframes, interpolation, scroll progression.
- `src/gallery/utils`: pure helpers, validation, texture handling.
- `src/gallery/config|constants`: tokens/defaults/presets.
- `packages/runtime/src`: web component wrapper + runtime packaging.
- `packages/framer`: external adapter (large, control-heavy, load only when needed).

## Forbidden Patterns
- No giant mixed-responsibility components/classes.
- No duplicated watcher logic for same reactive source.
- No inline magic numbers when value is domain-level.
- No side effects inside pure interpolation helpers.
- No direct config object mutation in render loop paths.

## Performance Constraints
- Keep render loop lightweight; avoid allocations in per-frame hot paths.
- Keep `pixelRatio <= 2`.
- Dispose geometries/materials/textures via `disposeThree`.
- Use texture cache for repeated assets.
- Avoid rebuilding full scene unless config actually changes.

## Animation Philosophy
- Scroll drives normalized progress.
- GSAP orchestrates controller ticking, not scene authoring logic.
- Camera turns and focus are keyframe-driven and reversible.
- White-loop transition is phase-based and config-controlled.

## Component Philosophy
- Vue components are orchestration shells.
- Three/WebGL state lives in engine classes, not template logic.
- Keep lifecycle cleanup explicit (`onBeforeUnmount`).

## State Management Philosophy
- Use local reactive state (`ref/computed/watch`) for UI shell only.
- Use class encapsulation for imperative runtime state (`GalleryEngine`, `ScrollProgressController`).
- Keep one directional flow: input events -> progress state -> engine apply.

## Styling Conventions
- Use scoped styles for local component surfaces.
- Use tokens from `galleryTokens.ts` for theme consistency.
- Runtime package styles live in `packages/runtime/src/styles/runtime.scss`.

## Safe Work Protocol
1. Load in order: `AGENTS.md -> AI_RULES.md -> REPO_MAP.md -> summaries/architecture_summary.md`.
2. If feature touches runtime behavior, inspect both `src/gallery/*` and `packages/runtime/src/gallery/*`.
3. Run targeted tests for touched journey/validation/disposal modules.
4. Do not edit `dist/` manually.
