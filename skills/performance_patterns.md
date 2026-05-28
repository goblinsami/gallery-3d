# Skill: Performance Patterns

## Use When
- Any change touches render loop, scene rebuild, or input handling.

## Preferred Moves
- keep render loop allocation-free
- cache textures/material variants where reuse exists
- debounce resize-triggered heavy updates
- rebuild scene only on validated config changes
- dispose aggressively on teardown

## Avoid
- hidden object creation in per-frame calls
- unnecessary deep clones in hot paths
- unbounded light/shadow quality settings

## Fast Checklist
- hot path allocations checked?
- rebuild frequency controlled?
- disposal path tested?
