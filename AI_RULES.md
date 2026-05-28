# AI Implementation Rules

## Global Rules
- Use Composition API only in Vue files.
- Keep TypeScript strict; never introduce `any`.
- Do not bypass `validateGalleryConfig` for runtime inputs.
- Keep modules single-purpose and low-coupling.

## Vue Rules
- Prefer `ref`, `computed`, `watch` with explicit lifecycle cleanup.
- Avoid duplicate watchers for same dependency graph.
- Components orchestrate only; move reusable logic to composables/classes/helpers.
- No large template + engine logic in one file.

## Three.js Rules
- Scene construction stays in `scene/*` factory modules.
- Renderer/camera/RAF lifecycle stays in `engine/*`.
- Reuse constants/tokens; avoid hardcoded visual values unless local/internal.
- Dispose all geometries/materials/textures through `disposeThree`.
- Keep `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.

## GSAP Rules
- Use GSAP for ticker/time orchestration, not for hidden business state.
- Scroll progression logic belongs in `ScrollProgressController`.
- Animation phases must stay deterministic and reversible.
- Keep loop transition windows configurable from JSON.

## Journey And Progress Rules
- `progress` is normalized and clamped.
- Interpolation logic must remain pure and testable.
- Keep labels/segments stable when adding new keyframe behavior.
- If timeline semantics change, update tests first or in same patch.

## Config Rules
- Add new public knobs to:
  - `types/galleryConfig.ts`
  - `config/defaultGalleryConfig.ts`
  - `utils/validateGalleryConfig.ts` (clamp + fallback)
  - tests for clamp/merge behavior
- Prefer backward-compatible aliases when renaming existing config keys.

## Performance Rules
- No per-frame heavy allocations in render loop.
- Avoid full scene rebuild unless config changed.
- Cache loaded textures and clear intentionally on rebuild/dispose.
- Keep shadow/light complexity bounded for mobile-safe performance.

## Styling Rules
- Use tokenized colors from `galleryTokens.ts`.
- Keep runtime shell styles isolated/scoped.
- Runtime package visual shell belongs in `packages/runtime/src/styles/runtime.scss`.

## Forbidden
- No inline magic numbers for domain-level tuning.
- No business logic inside shader/material setup helpers.
- No mutable shared singleton state beyond explicit caches.
- No edits to `dist/` artifacts by hand.

## Multi-Package Safety
- If changing `src/gallery/*`, inspect `packages/runtime/src/gallery/*` for parity.
- Preserve runtime-specific differences (viewport handling, asset base URL resolution, web component bootstrap).
