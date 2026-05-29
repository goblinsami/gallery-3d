# AI Retrieval Guide (Codex)

## Primary Goal
- Minimize tokens while preserving cinematic + architectural consistency.

## Always Load First (Order)
1. `AGENTS.md`
2. `AI_RULES.md`
3. `GALLERY_PHILOSOPHY.md`
4. `architecture_summary.md`
5. `REPO_MAP.md`

## High-Priority Source Files
- Runtime core:
  - `src/gallery/engine/GalleryEngine.ts`
  - `src/gallery/journey/scrollProgressController.ts`
  - `src/gallery/journey/cameraKeyframes.ts`
  - `src/gallery/journey/getCameraStateAtProgress.ts`
  - `src/gallery/utils/validateGalleryConfig.ts`
  - `src/gallery/types/galleryConfig.ts`
  - `src/gallery/config/defaultGalleryConfig.ts`
- Scene mood:
  - `src/gallery/scene/createLighting.ts`
  - `src/gallery/scene/createEnvironment.ts`
  - `src/gallery/config/galleryTokens.ts`
  - `src/gallery/constants/lightingPresets.ts`

## Summary Files That Replace Large Context
- `gallery_summary.md`
- `movement_summary.md`
- `lighting_summary.md`
- `rendering_summary.md`

Use summaries first; open full sources only when editing that domain.

## Rarely Load
- `packages/framer/ScrollixArtGallery.tsx` (very large; adapter-specific)
- `dist/*`
- static assets (`public/images/*`, `public/fonts/*`)
- unrelated tests outside changed domain

## Conditional Loading Rules
- If task touches web component behavior:
  - load `packages/runtime/src/vue/RuntimeArtGallery.vue`
  - load `packages/runtime/src/elements/scrollix-art-gallery.element.ts`
- If task touches core gallery logic:
  - verify mirror in `packages/runtime/src/gallery/*` before finalizing

## Dependency Chain (Fast Mental Map)
- `types -> defaults -> validator -> journey -> engine -> component`
- config changes must flow through this chain in order.

## Token-Minimization Workflow
1. Read one summary file for task domain.
2. Read only 2-4 high-priority source files.
3. Edit in smallest responsible layer.
4. Load tests only for touched logic.
5. Avoid opening large adapter files unless required.
