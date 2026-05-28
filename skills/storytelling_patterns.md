# Skill: Storytelling Patterns

## Use When
- Adjusting cinematic sequence, focus phases, or narrative pacing.

## Preferred Moves
- express pacing through config timings and segment weights
- keep camera language in keyframes (`travel -> focus -> hold -> return`)
- align visual transitions (white loop/title fade) with progress phases
- keep forward/backward traversal reversible

## Avoid
- one-off timeline hacks not tied to config
- narrative state that cannot be derived from progress
- hidden phase transitions outside `journey/*`

## Fast Checklist
- deterministic sequence?
- reversible on backward scroll?
- labels/tests updated for new phase behavior?
