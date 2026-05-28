# Animation System Summary

## Motion Backbone
- `ScrollProgressController` converts wheel/touch input into smoothed normalized progression.
- GSAP ticker drives controller updates with damping and smoothing.

## Journey Model
- Timeline segments: intro -> repeated artwork travel/focus/return -> outro.
- Keyframes are generated from config and layout, not hand-authored per frame.
- Camera interpolation includes smoothstep and targeted linear blends for turn alignment.

## Loop Transition Model
- Infinite mode adds white transition phases after end-of-journey.
- White in/out and restart progression are controlled by config windows:
  - `loopWhiteAfterEndWindow`
  - `loopWhiteStartsBeforeEndWindow`
  - `loopWhiteFadeOutRevealWindow`
  - `loopWhiteFadeOutWindow`
  - `loopProgressAdvanceDuringWhiteFadeOut`

## Lighting Feedback
- Active artwork focus influences spotlight intensity for emphasis.
