# Movement Summary (Low Token)

- Input is normalized to velocity, not direct transform.
- Progress is smoothed/damped and clamped.
- Camera state is keyframe-derived and interpolated.
- Movement phases:
  - intro -> travel -> focus -> hold -> return -> outro
- Infinite loop adds white transition phases with bounded windows.
- Required feel:
  - heavy
  - smooth
  - cinematic
  - physical
- Forbidden feel:
  - arcade
  - twitchy
  - bouncy
