# Rendering Summary (Low Token)

- Init:
  - validate config
  - create scene/camera/renderer
  - build corridor/environment/lighting/artwork/title roots
- Runtime:
  - controller emits progress
  - engine resolves keyframe state
  - renderer draws frame
- Assets:
  - async texture load with fallback and cache
  - font load with fallback title geometry
- Cleanup:
  - cancel RAF
  - dispose graph + textures/materials
  - remove listeners and canvas
