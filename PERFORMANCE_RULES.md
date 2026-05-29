# Performance Rules

## Performance Objective
- Preserve smooth cinematic motion on desktop and mobile while retaining mood depth.

## Hard Engine Constraints (Current)
- Clamp device pixel ratio: `<= 2`.
- Render loop must stay allocation-light.
- Dispose all Three resources on rebuild/unmount.
- Scene rebuild only on config changes.

## Texture Rules
- Prefer compressed/optimized source assets.
- Policy targets:
  - hero artwork: <= 2048px long edge (desktop), <= 1024px (mobile-heavy scenes)
  - avoid runtime loading of oversized originals (>4K)
- Always provide fallback image path for remote assets.
- Use cache for repeated textures; clear intentionally on teardown.

## Geometry Rules
- Corridor is procedural but bounded; keep segment counts conservative.
- Reuse geometries/materials where visually acceptable.
- Do not generate high-segment geometry in per-frame paths.
- Keep bevel/text geometry complexity controlled for title meshes.

## Lighting / Shadow Rules
- Keep shadow-casting lights minimal.
- Preserve mode-specific shadow softness from presets.
- Avoid large shadow map escalation without profiling.
- Do not enable expensive shadow stacks for decorative lights.

## Batching / Instancing Guidance
- For repeated decorative elements (future expansion), prefer instancing.
- Batch static meshes by material class when possible.
- Avoid unique material clones per repeated element unless visually required.

## Lazy Loading Rules
- Defer optional integrations and heavy adapters.
- Keep runtime bootstrap minimal.
- Avoid loading large editor/control surfaces in core runtime path.

## Culling / Visibility Guidance
- Use corridor depth limits and modular segmentation.
- Avoid adding off-camera dynamic systems without distance gating.
- Prefer deterministic module counts over unbounded generation.

## Memory Safety
- All teardown paths must call disposal utilities.
- Remove DOM event listeners and GSAP ticker bindings on unmount.
- Avoid lingering references to old scene nodes after rebuild.

## Shader Constraints (If Added)
- Keep uniform count and branching conservative.
- No high-cost full-screen passes by default.
- All shader features must have disable path.

## Forbidden Expensive Operations
- Creating geometries/materials/textures inside RAF loop.
- Revalidating/parsing full config every frame.
- Rebuilding entire scene for minor transient UI state.
- Unbounded post-processing chains.
- High-frequency canvas text regeneration without change detection.

## Anti-Patterns
- Effect-first upgrades that reduce artwork readability.
- Performance tradeoffs hidden behind aesthetic changes.
- Mobile ignored in lighting/shadow decisions.
