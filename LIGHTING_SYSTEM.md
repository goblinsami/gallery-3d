# Lighting System

## Mode Support (Current)
- Implemented modes:
  - `day`
  - `contrast`
- Not implemented as first-class enums:
  - `liminal`
  - `neon`

If adding `liminal`/`neon`, extend:
- `types/galleryConfig.ts` (`LightingMode`)
- `constants/lightingPresets.ts`
- validator + defaults + tests

## Day Mode Philosophy
- Bright but soft, readable, gallery-clean.
- Higher ambient and directional contribution.
- Gentler fog density for depth without heaviness.
- Preserve artwork legibility with minimal glare.

## Contrast Mode Philosophy
- Cinematic tension, lower ambient base.
- Stronger atmosphere through denser fog.
- Focus lighting should isolate artworks and deepen corridor rhythm.
- Avoid crushed blacks that hide corridor geometry.

## Liminal Direction (Style Target)
- Transitional, ambiguous, calm unease.
- Cooler neutral fog with restrained emissive accents.
- Moderate contrast; preserve silhouette readability.

## Neon Direction (Future, If Added)
- Accent-driven, not full-scene saturation.
- Emissive highlights should support wayfinding and mood.
- Strict cap on bloom/exposure to avoid artwork washout.

## Fog Philosophy
- Fog is a depth and mood operator, not a visibility gimmick.
- Use `FogExp2` density per mode.
- White-loop transition may increase perceived fog (engine fog boost).
- Keep artwork surfaces readable at focus distance.

## Spotlight Philosophy
- Artwork spotlight is narrative emphasis.
- Active artwork intensity lift is subtle, not stage-show.
- Ceiling spots are optional atmospheric rhythm markers.
- Spotlights should guide gaze without flattening local contrast.

## Exposure / Tone Mapping
- ACES filmic tone mapping is baseline.
- Exposure is mode-dependent (`contrast` slightly hotter than `day`).
- Never use exposure to fake contrast that should come from light design.

## Bloom Philosophy
- No bloom pipeline currently.
- If introduced:
  - keep low threshold/low intensity
  - isolate to emissive accents
  - never soften artwork texture detail

## Shadow Softness And Contrast Guidance
- Use mode-specific softness:
  - `contrast`: tighter, crisper
  - `day`: softer edges
- Preserve midtone separation on corridor walls/floor.
- Avoid flat lighting and avoid overexposure.

## Atmosphere Goals
- Mood first, readability second, novelty last.
- Artworks remain hero subjects in all modes.
