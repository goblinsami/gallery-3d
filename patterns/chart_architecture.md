# Pattern: Chart Architecture

## Use
- Optional diagnostics or analytics UI.

## Recommended Structure
- separate chart adapter layer (`src/gallery/ui/charts/*` if introduced)
- data transformer from runtime state -> chart points
- lazy loaded chart renderer
- read-only subscription to runtime progress/events

## Anti-Patterns
- chart rendering inside Three render loop
- coupling chart lib into runtime web component bundle by default
- direct mutation of engine internals from chart UI
