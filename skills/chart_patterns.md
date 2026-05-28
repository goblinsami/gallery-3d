# Skill: Chart Patterns

## Use When
- Adding data-visual overlays, diagnostics panels, or analytics UI.

## Current Repo Fit
- No chart subsystem exists yet.
- Keep chart logic out of `scene/*` and `journey/*` unless chart is 3D scene content by design.

## Preferred Moves
- isolate chart state in dedicated UI layer/composable
- use pre-aggregated data shapes, not raw runtime internals
- lazy-load chart modules when not always visible

## Avoid
- coupling chart rendering to core camera progression loop
- pulling large chart libs into runtime package by default

## Fast Checklist
- optional load path?
- no render-loop coupling?
- clear boundaries with runtime engine?
