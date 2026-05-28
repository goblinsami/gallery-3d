# Pattern: Tooltip Systems

## Use
- Showing artwork metadata details outside the 3D scene.

## Recommended Structure
- data source: active artwork index from camera state/progress
- tooltip presenter in Vue layer (not Three mesh text unless required)
- content from validated `artworks[].metadata` and `sideText`
- debounce position updates if pointer-follow behavior is added

## Anti-Patterns
- tooltip logic embedded in `GalleryEngine`
- large canvas text redraw loops for every minor state change
- mismatched schema fields not validated in config pipeline
