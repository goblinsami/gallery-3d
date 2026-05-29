# Three.js Patterns (Project-Specific)

## 1) Scene Setup Pattern
- Build once per config state:
  - `createScene` -> `createCamera` -> `createRenderer` -> `rebuildScene`
- Keep roots grouped by concern (`corridor`, `environment`, `artwork`, `lighting`, `title`).
- Use explicit teardown via `disposeThree`.

## 2) Lighting Setup Pattern
- Use mode presets (`day`, `contrast`) for intensities/fog/shadow softness.
- Keep ambient + hemi + directional as baseline stack.
- Add atmospheric accents conditionally (ceiling spots, rim/bounce).
- Keep artwork readability as non-negotiable constraint.

## 3) Environment Setup Pattern
- Environment is mood layer, not gameplay object.
- Procedural repeated fixtures/strips should be bounded.
- Fog updates live in engine atmosphere application, not random modules.

## 4) Procedural Gallery Pattern
- `calculateArtworkLayout(config)` derives:
  - wall side
  - world position
  - focus target
  - focus camera position
- Layout must remain deterministic from config input.

## 5) Repeating Corridor Pattern
- Segment length and count derive from artwork count + spacing.
- Infinite mode increases prebuilt depth to preserve continuity illusion.
- Avoid unbounded runtime segment spawning.

## 6) Infinite Loop Pattern
- Loop progression managed in controller phases, not scene topology resets.
- White transition bridges end-of-journey to restarted progress.
- Keep phase windows configurable and clamped.

## 7) Texture Optimization Pattern
- Load with fallback chain and cache.
- Normalize texture color space/filtering.
- Clear cache on rebuild/dispose to prevent leaks.

## 8) Shader Organization Pattern
- Keep shader code in dedicated modules.
- Expose typed uniforms only.
- Add fallback material path for unsupported/disabled effects.

## 9) Camera Rig Pattern
- Camera state comes from keyframes + interpolation.
- LookAt smoothing is state-based, not ad-hoc dampers per object.
- Keep rig behavior independent from input device specifics.

## 10) Interaction Pattern
- Input system produces normalized progression intent.
- Engine consumes intent and renders deterministic outcome.
- Avoid direct scene mutations from raw event handlers.
