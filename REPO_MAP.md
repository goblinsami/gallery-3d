# Repository Map

## High Priority Folders
- `src/gallery/`
  - Main app-side gallery runtime implementation.
- `packages/runtime/src/`
  - Packaged web component runtime and bootstrap.
- `packages/framer/`
  - Framer adapter; large integration surface.
- `scripts/`
  - Runtime artifact/version copy pipeline.

## Responsibilities By Layer
- `config/` + `constants/`: design tokens, defaults, bounded configuration values.
- `utils/validateGalleryConfig.ts`: normalize and clamp all external config.
- `journey/`: timeline segmentation, camera keyframe generation, interpolation, scroll phase logic.
- `scene/`: deterministic Three.js object/material/light factories.
- `engine/`: assemble scene graph, apply camera state, render loop, disposal.
- `components/ArtGalleryRuntime.vue`: Vue shell that wires config + controller + engine.

## Data Flow
1. Raw config enters runtime component.
2. `validateGalleryConfig` returns normalized config.
3. `calculateArtworkLayout` derives deterministic artwork positions/focus targets.
4. `buildCameraKeyframes` generates progress-indexed camera states.
5. Scroll/touch updates progress via `ScrollProgressController`.
6. `GalleryEngine.applyState` maps progress to camera/light/title/atmosphere updates.

## Rendering Flow
1. `createScene`, `createCamera`, `createRenderer`.
2. `rebuildScene` creates corridor, environment, lighting, artworks, title.
3. Render loop calls `renderer.render(scene, camera)` each frame.
4. On config updates: clear scene graph, rebuild, re-apply current state.
5. On dispose: cancel RAF, dispose graph/materials/textures, remove canvas.

## State Flow
- UI reactive state: Vue refs/computed/watchers in runtime/playground components.
- Runtime imperative state: engine/controller classes.
- Domain state key: `progress`, `whiteMix`, `activeArtworkIndex`.
- Config state is treated as immutable input after validation.

## Animation Flow
- Input wheel/touch delta -> normalized delta -> velocity/damping.
- GSAP ticker updates smoothed progress target.
- Loop mode introduces white-in / white-out phases.
- Journey interpolation resolves camera position/lookAt and title opacity.
- Spotlight intensities react to active artwork index.

## Cross-Package Flow
- App dev surface: `src/*`.
- Runtime distribution surface: `packages/runtime/*`.
- `npm run build:all` builds app + runtime and writes versioned assets into `dist/runtime/*`.
