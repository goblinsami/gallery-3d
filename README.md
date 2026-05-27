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
- all color values are centralized in `src/gallery/config/galleryTokens.ts`

It includes:

- lighting mode (`contrast` or `day`)
- finite/infinite corridor mode
- `scrollStrength` for wheel force (forward/backward), using human scale (`1` normal, `2` faster, `4` strong) with wheel/trackpad adaptive normalization
- `loopWhiteAfterEndWindow` controls how much scroll is needed after the end to reach/hold full white (`0.06` very fast, `0.2` cinematic)
- `loopWhiteStartsBeforeEndWindow` starts white invasion before `progress=1` while camera still advances (`0` off, `0.2` strong overlap)
- `loopWhiteFadeOutWindow` controls how much scroll is used to fade from full white back to the restarted scene
- `loopWhiteFadeOutRevealWindow` shapes how quickly that fade-out happens inside the fade-out window
- `loopProgressAdvanceDuringWhiteFadeOut` controls how much journey progress advances while white is still fading out (`0` static restart, `0.2` fluid restart)
- `artworkFocusFill` controls how much of the viewport the focused artwork occupies (`0.5` farther, `0.9` closer)
- `artworkTurnSmoothness` controls how soft the camera rotates toward artworks (`0` direct, `1` very smooth)
- `artworkTurnKeyframes` controls how many intermediate keyframes are generated during turn-to-artwork (`2` simple, `6` very smooth)
- `artworkTurnLeadIn` starts the turn before focus-in begins (`0` off, `0.35` early cinematic anticipation)
- `sceneTitleConfig.maxWidth` sets the max width of the 3D title before wrapping to a new line
- `sceneTitleConfig.lineHeight` sets vertical spacing between wrapped title lines
- `sceneTitleConfig.daylightContrastEnabled` toggles extra readability stroke for title in `day` mode
- `sceneTitleConfig.daylightContrastColor` sets the stroke/halo color used for that readability layer
- `sceneTitleConfig.daylightContrastStrength` controls how pronounced the title readability stroke is (`0` off, `1` strong)
- `artworks[].sideText.borderEnabled` enables/disables a luminous border around side text panels
- `artworks[].sideText.borderColor`, `borderIntensity`, `borderWidth` tune the border look
- `corridor.carpetEnabled` shows/hides the central carpet (`true` visible, `false` hidden)
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
In this mode, loop progression is phase-based and fully scroll-driven:
- phase 1: normal corridor journey (`progress 0 -> 1`)
- phase 1b (optional): white invasion begins before end while camera still advances (`loopWhiteStartsBeforeEndWindow`)
- phase 2: hold end corridor while scroll increases white to 100%
- phase 3: keep scrolling to diffuse white (overlay opacity down), reveal title, and advance early journey progress for a fluid re-entry
White transition behavior is JSON-configurable via `loopWhiteAfterEndWindow`, `loopWhiteStartsBeforeEndWindow`, `loopWhiteFadeOutRevealWindow`, `loopWhiteFadeOutWindow`, and `loopProgressAdvanceDuringWhiteFadeOut`.

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
npm run build:runtime
npm run build:all
npm run test
npm run test:ci
```

## Runtime Packaging

Independent packaging has been added inside this project:

- `packages/runtime`: standalone Web Component runtime bundle
- `packages/framer`: Framer Code Component wrapper (`ScrollixArtGallery.tsx`)

Runtime build output:

- `packages/runtime/dist/scrollix-art-gallery-runtime.js`
- `packages/runtime/dist/images/*`
- `packages/runtime/dist/fonts/*`

`npm run build:all` copies artifacts into root `dist/` using versioned runtime folders:

- `dist/runtime/<version>/scrollix-art-gallery-runtime.js`
- `dist/runtime/<version>/images/*`
- `dist/runtime/<version>/fonts/*`
- `dist/runtime/latest.json` (channel -> version mapping)

For compatibility, legacy root copies are still emitted:

- `dist/scrollix-art-gallery-runtime.js`
- `dist/images/*`
- `dist/fonts/*`

Optional release env vars for `npm run sync:runtime-assets`:

- `RUNTIME_VERSION` (forces folder/version name)
- `RUNTIME_CHANNEL` (default: `stable`)
- `RUNTIME_CHANNEL_ALIASES` (comma-separated extra channel names pointing to the same version)

## Netlify

Root deployment config is in [netlify.toml](/c:/WORKSPACE/showcase/gallery-3d/netlify.toml).

It includes:

- build command: `npm run build:all`
- publish dir: `dist`
- cache policy split between immutable versioned runtime assets and non-cached `runtime/latest.json`

## Future Integration Readiness

The runtime is isolated and configuration-driven, so adapters can later expose:

- `<scrollix-gallery project-id="..." />`
- `<scrollix-gallery config-json="..." />`

No dependency on Scrollix Editor or Supabase exists in this runtime.

