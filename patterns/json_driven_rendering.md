# Pattern: JSON-Driven Rendering

## Use
- Runtime should accept external JSON with predictable output.

## Recommended Structure
- schema/types in `types/galleryConfig.ts`
- defaults in `config/defaultGalleryConfig.ts`
- sanitizer/clamps in `utils/validateGalleryConfig.ts`
- rendering modules consume validated config only
- expose warnings/errors for migration and bad payloads

## Anti-Patterns
- direct use of raw JSON in scene/engine
- unbounded numeric config values
- schema updates without validator and tests
