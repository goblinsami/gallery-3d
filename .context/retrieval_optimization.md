# Retrieval Optimization

## Always Load First
- `AGENTS.md`
- `AI_RULES.md`
- `summaries/architecture_summary.md`
- `REPO_MAP.md`

## High-Priority Runtime Files
- `src/gallery/components/ArtGalleryRuntime.vue`
- `src/gallery/engine/GalleryEngine.ts`
- `src/gallery/journey/scrollProgressController.ts`
- `src/gallery/journey/cameraKeyframes.ts`
- `src/gallery/utils/validateGalleryConfig.ts`
- `src/gallery/config/defaultGalleryConfig.ts`
- `src/gallery/types/galleryConfig.ts`

## Conditional Loads
- Scene look/material changes:
  - `src/gallery/scene/*`
  - `src/gallery/config/galleryTokens.ts`
  - `src/gallery/constants/lightingPresets.ts`
- Runtime package behavior:
  - `packages/runtime/src/vue/RuntimeArtGallery.vue`
  - `packages/runtime/src/elements/scrollix-art-gallery.element.ts`
  - runtime mirror under `packages/runtime/src/gallery/*`
- Distribution/release:
  - `scripts/copy-runtime-assets.mjs`
  - `packages/runtime/vite.config.ts`
  - `netlify.toml`

## Rarely Load (High Token Cost)
- `packages/framer/ScrollixArtGallery.tsx` (~3233 lines)
- large adapter/control files unless task is Framer-specific
- `dist/*`, `node_modules/*`

## Retrieval Sequence By Task
- Bug in motion/camera:
  - `AI_RULES.md` -> `summaries/animation_system_summary.md` -> `journey/*` -> `engine/GalleryEngine.ts`
- Bug in visual scene:
  - `REPO_MAP.md` -> `scene/*` -> `config/galleryTokens.ts` -> `constants/lightingPresets.ts`
- Config schema change:
  - `types/galleryConfig.ts` -> `defaultGalleryConfig.ts` -> `validateGalleryConfig.ts` -> tests
- Runtime embed bug:
  - `packages/runtime/src/vue/RuntimeArtGallery.vue` -> `packages/runtime/src/elements/*` -> mirrored gallery files
