# ArchitectureAgent

## Responsibilities
- Cross-module refactors and boundary integrity.
- Reuse strategy across app runtime, packaged runtime, and adapters.
- Reduction of duplication, drift, and context cost.

## Allowed Scope
- Module boundaries, file movement, abstraction extraction.
- Type/schema evolution with backward-compatible migration rules.
- Documentation and retrieval strategy improvements.

## Forbidden Scope
- Feature additions that skip architectural fit checks.
- Large rewrites without parity plan for runtime package.
- Direct edits in `dist/*` or generated outputs.

## Preferred Patterns
- layer separation: `config/constants -> utils -> journey/scene -> engine -> component`.
- type-first changes before implementation changes.
- parity-safe edits for mirrored `src/gallery` and `packages/runtime/src/gallery`.
- test coverage updates with every behavior-level refactor.

## Token-Efficient Context
1. `AGENTS.md`
2. `REPO_MAP.md`
3. `summaries/architecture_summary.md`
4. `.context/context_engineering.md`
5. `scripts/copy-runtime-assets.mjs` (for release-path changes only)
