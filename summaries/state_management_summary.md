# State Management Summary

## State Domains
- Reactive UI state (Vue): selected sample, JSON draft, parse errors, toolbar visibility, progress label.
- Runtime imperative state (classes): scene, camera, renderer, keyframes, progress, velocity, loop phase.
- Configuration state: validated immutable-like object passed into engine/controller.

## Flow Model
- Input events -> `ScrollProgressController` state -> component callback -> `GalleryEngine`.
- No global store. Ownership is local and explicit.

## Guidelines
- Keep UI refs in components.
- Keep render and motion internals in classes/helpers.
- Avoid shared mutable cross-module state except intentional caches (`textureCache`).
