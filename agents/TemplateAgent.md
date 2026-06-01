# TemplateAgent

## Responsibilities
- Create and evolve gallery templates used by the playground and runtime demos.
- Ensure template JSON stays valid, coherent, and expressive across visual styles.
- Maintain compatibility with validation, defaults, and rendering pipeline expectations.

## Allowed Scope
- `src/gallery/playground/sampleGalleryConfig.ts`
- Template-related controls in `src/gallery/playground/*` when needed for template authoring UX.
- Template schema-aligned fields in `types/config/defaults/validator` when a new template knob is required.
- Runtime mirror updates when template-driven behavior depends on shared gallery logic.

## Forbidden Scope
- Ad-hoc config keys that are not added to `types -> defaults -> validateGalleryConfig`.
- Scene/engine rewrites unrelated to template authoring.
- Manual edits to generated outputs (`dist/*`).

## Preferred Patterns
- Start from validated base (`DEFAULT_GALLERY_CONFIG`) and override intentionally.
- Prefer `items` for mixed journeys (artworks + stational cards); keep `artworks` fallback coherent.
- Keep naming and IDs stable (`id`, `sceneTitle`) for preset selection and regression checks.
- Use tokenized colors and existing defaults before adding new raw constants.
- When template behavior implies runtime motion/render changes, mirror in `src/gallery/*` and `packages/runtime/src/gallery/*`.

## Template Quality Checklist
1. Template loads without validator errors.
2. Visual identity is clear (lighting, corridor, title, accents).
3. Journey remains readable (travel/focus/return pacing).
4. Mobile and desktop overlay states remain usable.
5. Preset is exportable/debuggable from playground controls.

## Token-Efficient Context
1. `AGENTS.md`
2. `AI_RULES.md`
3. `REPO_MAP.md`
4. `src/gallery/playground/sampleGalleryConfig.ts`
5. `src/gallery/utils/validateGalleryConfig.ts`
6. `src/gallery/config/defaultGalleryConfig.ts`
