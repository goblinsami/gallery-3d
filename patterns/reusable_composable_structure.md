# Pattern: Reusable Composable Structure

## Use
- Repeated UI/runtime shell logic across Vue components.

## Recommended Structure
- file: `src/gallery/composables/useX.ts`
- inputs: typed args/refs
- internals: minimal refs/computed/watch
- outputs: readonly state + explicit actions + `dispose` when needed

## Anti-Patterns
- scene graph mutation in composable
- hidden globals and side effects
- returning untyped mutable bags
