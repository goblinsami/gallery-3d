# Skill: GSAP Patterns

## Use When
- You need tick-based progression updates or timing orchestration.

## Preferred Moves
- Use `gsap.ticker` as scheduler only.
- Keep motion state in explicit controller fields (`progress`, `targetProgress`, `velocity`).
- Apply damping/smoothing with bounded clamps.
- Emit normalized state objects to consumers.

## Avoid
- Embedding business rules directly in GSAP timelines.
- Multiple tickers for the same runtime element.
- frame-dependent non-deterministic math.

## Fast Checklist
- single ticker owner?
- deterministic input/output?
- dispose removes ticker and listeners?
