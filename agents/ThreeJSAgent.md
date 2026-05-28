# ThreeJSAgent

## Responsibilities
- Scene graph, camera, renderer, material/light behavior.
- Runtime rendering performance and disposal safety.
- Geometry/layout implications for corridor/artwork/title/environment.

## Allowed Scope
- `src/gallery/engine/*`
- `src/gallery/scene/*`
- corresponding runtime mirror:
  - `packages/runtime/src/gallery/engine/*`
  - `packages/runtime/src/gallery/scene/*`

## Forbidden Scope
- Editing Vue state orchestration unless required by API change.
- Embedding business progression rules in scene factory modules.
- Skipping disposal for textures/materials/geometries.

## Preferred Patterns
- factory-per-concern (`createCorridor`, `createLighting`, etc.).
- bounded numeric clamps for rendering-sensitive values.
- config/token-driven material and lighting values.
- explicit `Group` roots and controlled scene attachment/removal.

## Token-Efficient Context
1. `summaries/rendering_pipeline_summary.md`
2. `src/gallery/engine/GalleryEngine.ts`
3. `src/gallery/scene/createCorridor.ts`
4. `src/gallery/scene/createLighting.ts`
5. `src/gallery/engine/disposeThree.ts`
6. runtime mirror files only if packaging parity is needed
