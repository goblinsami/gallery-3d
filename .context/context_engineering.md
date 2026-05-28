# Context Engineering

## Core Mental Models
- Model 1: `config` is untrusted input, always normalized.
- Model 2: `progress` is the only runtime navigation signal.
- Model 3: `journey` decides camera intent; `engine` applies intent.
- Model 4: `scene` modules are pure-ish factories from config/layout.
- Model 5: runtime package is a delivery wrapper around the same core gallery logic.

## Dependency Relationships
- `types/galleryConfig.ts` -> `defaultGalleryConfig.ts` -> `validateGalleryConfig.ts`.
- `validateGalleryConfig.ts` -> `ArtGalleryRuntime.vue` + `GalleryEngine`.
- `cameraKeyframes.ts` + `getCameraStateAtProgress.ts` -> `GalleryEngine.applyState`.
- `ScrollProgressController` -> `ArtGalleryRuntime` -> `GalleryEngine.setProgress/setLoopWhiteMix`.

## Global Context Policy
- Always global:
  - `AGENTS.md`, `AI_RULES.md`, `summaries/architecture_summary.md`.
- Conditional global:
  - Add one summary from `summaries/*` that matches current task domain.
- Never global:
  - `packages/framer/ScrollixArtGallery.tsx`
  - test files not related to touched behavior
  - build artifacts and static assets

## Low-Token Hints
- Start from summaries, not raw source, then drill to 2-4 concrete files.
- Prefer `types -> defaults -> validator` path before editing runtime behavior.
- For parity-sensitive edits, diff app/runtime mirror files early.
- Keep context window clean by avoiding unrelated `scene/*` and adapter files.

## Safe Edit Checklist
1. Confirm layer: `scene`, `journey`, `engine`, `component`, `adapter`.
2. Update constants/types before implementation.
3. Preserve deterministic progress behavior.
4. Mirror runtime package changes when required.
5. Run targeted tests for touched logic.
