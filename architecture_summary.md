# Architecture Summary (Low Token)

- Engine type: JSON-driven cinematic 3D gallery runtime.
- Core flow: `config -> validate -> layout -> keyframes -> progress -> render`.
- Main layers:
  - `types/config/constants`
  - `utils/validateGalleryConfig`
  - `journey` (motion math)
  - `scene` (Three factories)
  - `engine` (runtime orchestration)
  - `components` (Vue shell)
- Primary invariant: progression is deterministic and reversible.
- Runtime parity note: `src/gallery/*` and `packages/runtime/src/gallery/*` are near-mirror cores.
