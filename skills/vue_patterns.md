# Skill: Vue Patterns

## Use When
- Editing runtime shell or playground UI behavior.

## Preferred Moves
- Keep components thin: orchestration only.
- Put heavy logic in classes/helpers (`GalleryEngine`, journey utilities).
- Use `computed` for normalized inputs and style maps.
- Use one focused `watch` per responsibility.
- Clean all side effects in `onBeforeUnmount`.

## Avoid
- Duplicated watcher chains.
- Scene/math logic inside `.vue` templates.
- Long reactive blocks with hidden side effects.

## Fast Checklist
- props typed?
- emits typed?
- side effects cleaned?
- logic location correct (component vs engine/journey)?
