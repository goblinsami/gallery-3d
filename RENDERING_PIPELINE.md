# Rendering Pipeline

## Architecture Split
- Component shell:
  - `ArtGalleryRuntime.vue` (config + controller + engine wiring)
- Engine orchestration:
  - `GalleryEngine.ts` (scene lifecycle, state application, render loop)
- Scene factories:
  - `scene/create*.ts` (corridor, lighting, environment, title, artworks)
- Journey math:
  - `journey/*` (layout, keyframes, interpolation, progress controller)
- Validation + defaults:
  - `utils/validateGalleryConfig.ts`, `config/defaultGalleryConfig.ts`

## Initialization Flow
1. Validate/normalize config.
2. Create `Scene`, `Camera`, `Renderer`.
3. Build scene graph roots:
   - corridor
   - environment
   - artwork group
   - lighting group
   - title group
4. Compute layout + keyframes.
5. Start render loop and input controller.

## Asset Loading Flow
- Artwork textures load asynchronously via `textureLoader`.
- Cache lookup first (`textureCache`).
- Fallback chain:
  - `imageUrl`
  - `fallbackImageUrl`
  - generated canvas fallback texture
- Title font loads via `FontLoader`; fallback geometry if load fails.

## Texture Handling
- Color space normalized (`SRGBColorSpace`).
- Filtering normalized (`LinearFilter`).
- Cache cleared on scene rebuild/dispose.
- Material/texture disposal performed by `disposeThree`.

## Animation Lifecycle
- Input -> controller velocity -> smoothed progress.
- Progress resolves camera state from keyframes.
- Engine applies:
  - camera position/lookAt
  - title opacity
  - spotlight emphasis
  - atmosphere blend (background/fog/white loop)

## Render Loop Philosophy
- Keep per-frame operations predictable and lightweight.
- Avoid scene reconstruction during normal playback.
- Keep aesthetic updates state-driven, not ad-hoc.

## Responsibilities Separation Rules
- Do not build Three objects in Vue templates.
- Do not place journey interpolation inside scene factories.
- Do not store raw input deltas as direct camera transforms.
- Rebuild scene only from config-level changes.

## Runtime Packaging Path
- Packaged runtime mirrors gallery core in `packages/runtime/src/gallery/*`.
- Web component wrapper resolves runtime asset base URLs.
- Build copy script versions runtime artifacts into `dist/runtime/<version>/`.
