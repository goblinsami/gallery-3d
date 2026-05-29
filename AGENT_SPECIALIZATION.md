# Agent Specialization

## GalleryArchitectureAgent
### Responsibilities
- System boundaries, module cohesion, schema evolution, cross-package parity.
### Allowed Scope
- `types`, `config`, `constants`, architecture docs, refactor structure.
### Forbidden Scope
- Visual tuning changes without loading philosophy + lighting docs.
### Preferred Patterns
- `types -> defaults -> validator` first.
- Layered separation (`journey` vs `scene` vs `engine`).
### Required Context Files
- `AGENTS.md`
- `REPO_MAP.md`
- `architecture_summary.md`
- `JSON_SCHEMA.md`

## ThreeJSRenderingAgent
### Responsibilities
- Scene graph composition, camera/renderer lifecycle, resource disposal.
### Allowed Scope
- `src/gallery/engine/*`, `src/gallery/scene/*` (+ runtime mirror when needed).
### Forbidden Scope
- UI orchestration rewrites, raw input policy changes.
### Preferred Patterns
- grouped root nodes, factory-per-concern, deterministic rebuild flow.
### Required Context Files
- `RENDERING_PIPELINE.md`
- `THREEJS_PATTERNS.md`
- `PERFORMANCE_RULES.md`
- `rendering_summary.md`

## LightingAgent
### Responsibilities
- Mood, readability, contrast balance, fog/exposure consistency.
### Allowed Scope
- `createLighting.ts`, `createEnvironment.ts`, tokens/presets/defaults.
### Forbidden Scope
- Introducing style modes without schema/validator updates.
### Preferred Patterns
- mode presets, tokenized color systems, readability-first contrast.
### Required Context Files
- `LIGHTING_SYSTEM.md`
- `SCENE_COMPOSITION_RULES.md`
- `lighting_summary.md`

## AnimationAgent
### Responsibilities
- Scroll progression dynamics, camera interpolation, loop transitions.
### Allowed Scope
- `journey/*`, movement-related config + validator ranges.
### Forbidden Scope
- game-like micro-interaction motion language.
### Preferred Patterns
- inertial controller + keyframe interpolation + reversible phases.
### Required Context Files
- `JOURNEY_SYSTEM.md`
- `ANIMATION_LANGUAGE.md`
- `movement_summary.md`

## PerformanceAgent
### Responsibilities
- Frame stability, memory lifecycle, mobile safety, asset budgets.
- Apply `mobile-low-end-aggressive` profile when stability is at risk.
### Allowed Scope
- render loop cost controls, loading/disposal, quality gates.
### Forbidden Scope
- adding expensive effects without fallback/metrics rationale.
### Preferred Patterns
- budgeted textures, bounded geometry counts, minimal per-frame allocations.
### Required Context Files
- `PERFORMANCE_RULES.md`
- `RENDERING_PIPELINE.md`
- `rendering_summary.md`
