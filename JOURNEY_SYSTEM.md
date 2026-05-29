# Journey System

## Core Model
- Single source of motion truth: `progress` in `[0,1]`.
- Input (`wheel/touch`) updates controller velocity, not camera directly.
- Camera state is derived from keyframes, then interpolated.

## Runtime Flow
1. `ScrollProgressController` normalizes input deltas.
2. Velocity is damped (`damping` default `0.86`) and smoothed (`smoothing` default `0.18`).
3. Controller emits `{ progress, whiteMix }`.
4. `GalleryEngine` resolves camera state via `getCameraStateAtProgress`.
5. Engine applies camera/lookAt/title/atmosphere.

## Progression Structure
- Intro
- Repeated artwork blocks:
  - travel
  - focus-in
  - focus-hold
  - return
- Outro
- Optional loop-white phases for infinite corridor.

## Forward / Backward Behavior
- Fully reversible progression.
- Backward scroll must preserve cinematic continuity.
- No one-way hidden states in camera logic.

## Infinite Corridor Logic
- Enabled by `infiniteCorridor: true`.
- Loop cycle length: `1 + loopWhiteAfterEndWindow + loopWhiteFadeOutWindow`.
- Phases:
  - pre-end lead-in white (optional)
  - end hold + white increase
  - white fade-out + restart progress advance

## Camera Interpolation Rules
- Interpolation baseline: `smoothstep`.
- Turn-alignment segments intentionally use more linear blending for stable rotation.
- Look target smoothing in engine uses `artworkTurnSmoothness`-derived factor.
- `progress` is always clamped before interpolation.

## Movement Constraints (Current Engine Ranges)
- `scrollStrength`: `0.25..8`
- `artworkFocusFill`: `0.35..0.95`
- `artworkTurnSmoothness`: `0..1`
- `artworkTurnKeyframes`: `1..12`
- `artworkTurnLeadIn`: `0..0.85`
- `loopWhiteAfterEndWindow`: `0.02..0.45`
- `loopWhiteStartsBeforeEndWindow`: `0..0.45`
- `loopWhiteFadeOutRevealWindow`: `0.03..0.45`
- `loopWhiteFadeOutWindow`: `0.05..0.6`
- `loopProgressAdvanceDuringWhiteFadeOut`: `0..0.45`

## Camera Rules
- Never move camera from raw delta directly.
- Preserve centered corridor travel readability between focus events.
- Keep focus distance derived from framing needs, not arbitrary offsets.
- Avoid FOV shocks; use config and validator bounds (`35..90`).

## Transition Rules
- Transition readability > novelty.
- Phase boundaries must remain testable and label-driven.
- No abrupt jump cuts except explicit design decision + config flag.
- White-loop transitions should feel atmospheric, not flash effects.

## Motion Quality Guardrail
- Required feel: smooth, heavy, cinematic, physical.
- Forbidden feel: arcade, twitchy, elastic-bouncy, hyper-fast.
