# Animation Language

## Style Signature
- cinematic
- smooth
- elegant
- premium
- restrained

## Easing Philosophy
- Default interpolation uses smoothstep-style continuity.
- Turn-alignment sections can use more linear blending for stable gaze shifts.
- No elastic/bouncy easing in core journey.

## Pacing Philosophy
- Long-form corridor drift, not rapid cuts.
- Focus moments should feel deliberate and weighted.
- Transition windows are configurational and should remain readable.

## Scroll Interpolation Rules
- Scroll input modifies velocity, not immediate position.
- Progress smoothing + damping produce inertial feel.
- Movement continuity must survive fast wheel bursts and trackpad granularity.

## Camera Motion Principles
- Camera is guided, not player-driven.
- Maintain corridor axis legibility between focus beats.
- Focus approach distance should be framing-driven.
- Avoid abrupt lookAt snaps or oscillatory corrections.

## Transition Behavior
- White-loop phases are atmospheric bridges, not flash effects.
- Title fade and atmosphere blend should support narrative pacing.
- Backward traversal must preserve coherence.

## Hover / Interaction Motion (When Added)
- Keep micro-motion subtle and low amplitude.
- Emphasis should support artwork reading, not distract.
- Prefer opacity/emissive/scale micro-adjustments over elastic transforms.

## UI Motion Principles
- UI transitions should be short, quiet, and secondary to scene motion.
- No aggressive overshoot or playful bounce in runtime shell.

## Avoid
- elastic motion
- exaggerated bounce
- hyper-fast transitions
- jitter from competing animation systems
