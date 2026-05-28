# Rendering Pipeline Summary

## Build Phase
1. Validate config (`validateGalleryConfig`).
2. Compute artwork layout (`calculateArtworkLayout`).
3. Build camera keyframes (`buildCameraKeyframes`).
4. Build scene graph via `createCorridor`, `createEnvironment`, `createLighting`, `createArtwork`, `createSceneTitle`.

## Runtime Phase
1. Scroll/touch input updates controller velocity.
2. Controller emits `{ progress, whiteMix }`.
3. Engine resolves camera state from keyframes.
4. Engine applies camera/lookAt/title/spotlight/atmosphere.
5. Renderer draws frame in RAF loop.

## Rebuild Triggers
- Config changes via watcher -> `engine.updateConfig` -> clear + rebuild scene graph.
- Resize events -> `engine.resize` updates camera projection and renderer viewport.

## Teardown
- stop RAF
- remove listeners/tickers
- dispose three resources
- clear texture cache
