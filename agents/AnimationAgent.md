# AnimationAgent

## Responsibilities
- Scroll progression and damping behavior.
- Keyframe generation/interpolation and transition feel.
- White-loop transitions and artwork focus choreography.

## Allowed Scope
- `src/gallery/journey/*`
- config-driven motion knobs in:
  - `src/gallery/types/galleryConfig.ts`
  - `src/gallery/config/defaultGalleryConfig.ts`
  - `src/gallery/utils/validateGalleryConfig.ts`

## Forbidden Scope
- Hardcoding animation timings in component templates.
- Mixing timeline logic directly into scene object factories.
- Non-deterministic motion based on frame timing side effects.

## Preferred Patterns
- progress-first architecture (`progress` drives all motion).
- pure interpolation helpers.
- phase labeling for keyframe clarity and testability.
- clamp all motion inputs and loop windows.

## Token-Efficient Context
1. `summaries/animation_system_summary.md`
2. `src/gallery/journey/scrollProgressController.ts`
3. `src/gallery/journey/cameraKeyframes.ts`
4. `src/gallery/journey/getCameraStateAtProgress.ts`
5. `src/gallery/tests/scrollProgressController.test.ts`
