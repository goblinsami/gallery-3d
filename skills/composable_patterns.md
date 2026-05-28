# Skill: Composable Patterns

## Use When
- Same Vue logic is repeated across 2+ components.

## Preferred Structure
- `src/gallery/composables/useX.ts`
- input: typed params and refs
- output: readonly refs + small action API
- keep Three.js object creation outside composables unless explicitly UI-bound

## Preferred Contents
- event subscription wrappers
- debounced resize/screen hooks
- parse/validation orchestration wrappers

## Avoid
- hidden global mutable state
- composables that rebuild scene graph directly
- returning large mutable objects with unclear ownership

## Fast Checklist
- pure API?
- cleanup hook included?
- no overlap with existing class responsibilities?
