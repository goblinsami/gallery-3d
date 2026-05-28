# Architecture Summary

## Core Idea
- Deterministic runtime: JSON config + normalized progress => predictable camera and scene behavior.

## Main Layers
- `types/config/defaults`: schema and baseline values.
- `utils/validateGalleryConfig`: sanitize, clamp, legacy alias support.
- `journey`: timeline and camera state math.
- `scene`: modular Three.js object construction.
- `engine`: lifecycle and render orchestration.
- `components`: Vue shell wiring for engine + input controller.

## Critical Invariants
- `progress` always bounded.
- Config always validated before use.
- Scene teardown always disposes meshes/materials/textures.
- Loop transitions are phase-based, configurable, and reversible.

## Multi-Target Runtime
- App runtime (`src/gallery`) and packaged runtime (`packages/runtime/src/gallery`) share core model.
- Packaged runtime adds web component and runtime-specific viewport/embed handling.
