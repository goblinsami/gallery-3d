# Skill: Three.js Patterns

## Use When
- Building or modifying scene, camera, lighting, or material behavior.

## Preferred Moves
- One factory per scene concern (`createX` modules).
- Use `Group` roots per subsystem for easy detach/dispose.
- Keep renderer setup centralized (`createRenderer`).
- Use tokenized color/material defaults, not arbitrary literals.
- Keep pixel ratio and shadow map settings bounded.

## Avoid
- Scattered renderer/camera setup across files.
- orphaned materials/textures without disposal.
- scene mutation from unrelated modules.

## Fast Checklist
- factory boundary respected?
- disposability preserved?
- performance cost estimated (lights/shadows/material count)?
