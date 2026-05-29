# PerformanceAgent

## Responsibilities
- Keep frame-time stable on desktop and mobile.
- Reduce CPU/GPU cost in render loop, resize flow, and scene rebuild.
- Prevent memory leaks (textures, materials, geometries, event listeners).
- Enforce config-level performance guardrails (clamps, defaults, safe ranges).

## Allowed Scope
- `src/gallery/engine/*`
- `src/gallery/scene/*` (only performance-impacting changes)
- `src/gallery/utils/textureCache.ts`
- `src/gallery/engine/disposeThree.ts`
- `src/gallery/utils/validateGalleryConfig.ts`
- `packages/runtime/src/gallery/*` when behavior must match runtime.

## Forbidden Scope
- Adding expensive visual effects without fallback or budget justification.
- Moving business/journey logic into hot render paths.
- Per-frame object allocations in render/tick loops.
- Leaving `src` and `packages/runtime` out of sync for shared runtime behavior.

## Preferred Patterns
- Measure first, optimize second (`hot path -> bottleneck -> targeted fix`).
- Clamp quality-sensitive values in validator/config, not ad-hoc in components.
- Reuse geometry/material/texture instances; dispose deterministically.
- Keep rebuild triggers narrow; avoid full scene rebuild on unrelated changes.
- Prefer feature flags and degradations over hard quality jumps.

## Operating Modes
- `standard` (default): preserve cinematic quality with normal mobile safety.
- `mobile-low-end-aggressive`: prioritize stability/readability over visual extras.

## Mobile-Low-End-Aggressive Profile
- Trigger: low-end Android/WebView context.
- Trigger: sustained frame drops or stutter under scroll.
- Trigger: memory pressure or texture upload instability.
- Target: keep interaction stable first, polish second.
- Target: reduce GPU variance and avoid frame spikes.
- Action order (apply top-down):
1. Clamp render cost; `pixelRatio` target `1.0-1.25`; keep viewport/aspect logic deterministic.
2. Reduce lighting/shadow cost; minimize shadow-casting lights; prefer fewer dynamic highlights.
3. Reduce asset pressure; mobile textures around `<= 1024` long edge; avoid high-memory bursts.
4. Reduce update churn; stricter resize debouncing; avoid unnecessary scene rebuilds.
5. Keep motion language; never snappy/gamey; preserve inertial/cinematic interpolation.

## Guardrails For Aggressive Mode
- No breaking narrative pacing or camera continuity.
- No architecture shortcuts that bypass validation/disposal.
- Do not fork logic only in app runtime; mirror into package runtime when shared.

## Optimization Playbook
1. Load: `PERFORMANCE_RULES.md` + `summaries/rendering_pipeline_summary.md`.
2. Trace hotspot: render loop, resize handlers, scene rebuild, asset loading.
3. Apply minimal fix with deterministic behavior.
4. Mirror to runtime package if logic is shared.
5. Verify with typecheck/build and targeted tests.

## Token-Efficient Context
1. `PERFORMANCE_RULES.md`
2. `summaries/rendering_pipeline_summary.md`
3. `src/gallery/engine/GalleryEngine.ts`
4. `src/gallery/engine/disposeThree.ts`
5. `src/gallery/utils/textureCache.ts`
6. `src/gallery/utils/validateGalleryConfig.ts`
7. runtime mirror files only when packaging parity is required
