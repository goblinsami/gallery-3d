# Pattern: Async Asset Loading

## Use
- Images, fonts, and runtime-hosted assets.

## Recommended Structure
- async loader with fallback (`textureLoader`)
- cache successful loads (`textureCache`)
- preserve source URL metadata for diagnostics
- resolve runtime-relative asset URLs in package wrapper

## Anti-Patterns
- throwing hard on single asset failure
- no fallback texture for missing image
- leaking textures by skipping cache clear/disposal
