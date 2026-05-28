# Pattern: Hover Interaction Systems

## Use
- Highlighting artwork metadata or side panels on pointer focus.

## Recommended Structure
- pointer events captured at component boundary
- derive hover state as lightweight index/id
- map hover state to:
  - material/emissive intensity tweaks
  - UI overlays outside render loop when possible
- keep hover effects optional and reversible

## Anti-Patterns
- heavy raycasting every frame without throttle
- mixing hover logic with scroll progression controller
- direct DOM manipulation from scene factory modules
