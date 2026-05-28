# Skill: Shader Patterns

## Use When
- Adding custom shader materials or post effects.

## Preferred Moves
- Keep shader config isolated (single module per effect).
- Expose only typed uniforms that map to scene config tokens.
- Provide graceful fallback material path.
- Gate expensive shader effects behind config flags.

## Avoid
- Inline shader strings inside large components.
- per-frame uniform churn without bounds.
- introducing shader dependencies into unrelated journey logic.

## Fast Checklist
- fallback exists?
- uniforms typed and clamped?
- effect optional and removable?
