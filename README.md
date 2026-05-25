# JSON-Driven 3D Art Gallery Runtime

Production-ready runtime engine built with Vue 3, TypeScript, Vite, Three.js, GSAP and Vitest.

## What This Project Is

A reusable runtime that consumes JSON and renders a deterministic cinematic 3D gallery experience.

- No editor
- No admin/CMS
- No CRUD
- No backend dependency

Core model:

- `progress in [0,1]` drives camera, lookAt, title opacity and focus state
- wheel input only updates progress
- same journey is reversible with backward scrolling

## Stack

- Vue 3
- TypeScript
- Vite
- Three.js
- GSAP (available for timeline/UX extensions)
- Vitest

## Architecture

```text
src/gallery/
  components/
    ArtGalleryRuntime.vue
  config/
    defaultGalleryConfig.ts
    galleryTokens.ts
  constants/
    cameraDefaults.ts
    galleryDefaults.ts
    lightingPresets.ts
  engine/
    GalleryEngine.ts
    createCamera.ts
    createRenderer.ts
    createScene.ts
    disposeThree.ts
  journey/
    buildJourneyTimeline.ts
    cameraKeyframes.ts
    getCameraStateAtProgress.ts
    scrollProgressController.ts
  scene/
    createArtwork.ts
    createArtworkFrame.ts
    createCorridor.ts
    createEnvironment.ts
    createLighting.ts
    createSceneTitle.ts
  types/
    galleryConfig.ts
    galleryRuntime.ts
  utils/
    clamp.ts
    math.ts
    textureCache.ts
    textureLoader.ts
    validateGalleryConfig.ts
  playground/
    PlaygroundPage.vue
    sampleGalleryConfig.ts
  tests/
    calculateArtworkLayout.test.ts
    cameraKeyframes.test.ts
    validateGalleryConfig.test.ts
    getCameraStateAtProgress.test.ts
    disposeThree.test.ts
```

## Runtime Pipeline

1. JSON config is validated and normalized via `validateGalleryConfig`.
2. `calculateArtworkLayout` maps artworks to deterministic wall positions/focus targets.
3. `buildCameraKeyframes` creates cinematic keyframes from layout + timings.
4. `getCameraStateAtProgress` interpolates camera state for current normalized progress.
5. `GalleryEngine` applies state and renders via Three.js.

## Configuration

Main schema is strongly typed in:

- `src/gallery/types/galleryConfig.ts`

Default production config:

- `src/gallery/config/defaultGalleryConfig.ts`

It includes:

- lighting mode (`contrast` or `day`)
- finite/infinite corridor mode
- `scrollStrength` for wheel force (forward/backward), using human scale (`1` normal, `2` faster, `4` strong) with wheel/trackpad adaptive normalization
- `artworkFocusFill` controls how much of the viewport the focused artwork occupies (`0.5` farther, `0.9` closer)
- `artworkTurnSmoothness` controls how soft the camera rotates toward artworks (`0` direct, `1` very smooth)
- `artworkTurnKeyframes` controls how many intermediate keyframes are generated during turn-to-artwork (`2` simple, `6` very smooth)
- camera params
- corridor dimensions/colors
- title style and fade
- artwork list
- journey timings

## Scene Behavior

- Intro title exists in 3D world space.
- Camera passes through title and title fades by progress.
- Corridor traversal is deterministic.
- Each artwork has travel -> focus-in -> hold -> return phases.
- Progress is reversible and clamped.

## Infinite Corridor

`infiniteCorridor: true` enables modular repeated corridor segments to simulate endless continuation without infinite geometry.
In this mode, scroll progress loops from end to start (and vice versa), so after the white end corridor you re-enter title + corridor again.

## Texture System

- Reusable cache (`textureCache`)
- Fallback handling (`textureLoader`)
- Aspect-ratio-aware artwork surface fit

## Performance and Cleanup

- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- shadow and tone mapping presets by lighting mode
- robust disposal for geometries/materials/textures/listeners
- resize debounced in runtime component

## Playground

`PlaygroundPage.vue` offers a dev environment for:

- previewing runtime
- switching lighting mode
- loading sample configs
- applying JSON config live

No persistence is implemented.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:ci
```

## Future Integration Readiness

The runtime is isolated and configuration-driven, so adapters can later expose:

- `<scrollix-gallery project-id="..." />`
- `<scrollix-gallery config-json="..." />`

No dependency on Scrollix Editor, Supabase or Framer APIs exists in this runtime.

