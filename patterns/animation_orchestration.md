# Pattern: Animation Orchestration

## Use
- Scroll/touch driven cinematic progression.

## Recommended Structure
- input normalization + velocity (`ScrollProgressController`)
- damped target progression (`gsap.ticker`)
- phase resolver (`resolveProgressState`)
- keyframe interpolation (`getCameraStateAtProgress`)
- render application (`GalleryEngine.applyState`)

## Anti-Patterns
- GSAP timeline storing business state
- duplicated progression logic in component and controller
- non-reversible phase transitions
