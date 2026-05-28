# FrontendAgent

## Responsibilities
- Vue component behavior in:
  - `src/gallery/components/*`
  - `src/gallery/playground/*`
  - `packages/runtime/src/vue/*`
- Prop contracts, emits, watchers, lifecycle cleanup.
- UI state wiring between config input and runtime engine/controller.

## Allowed Scope
- Component structure, local reactive state, event handling.
- Runtime shell styling updates using existing token system.
- JSON parsing/validation handoff logic.

## Forbidden Scope
- Direct scene graph math changes inside Vue components.
- Three.js object construction outside `scene/*`.
- Camera interpolation logic outside `journey/*`.

## Preferred Patterns
- `computed` for derived state.
- single watcher per config source, with explicit purpose.
- thin component shell + delegated engine/controller classes.
- token-driven styles instead of hardcoded colors.

## Token-Efficient Context
1. `AGENTS.md`
2. `AI_RULES.md`
3. `src/gallery/components/ArtGalleryRuntime.vue`
4. `packages/runtime/src/vue/RuntimeArtGallery.vue`
5. `src/gallery/utils/validateGalleryConfig.ts`
