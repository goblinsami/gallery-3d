# Pattern: Scene Setup

## Use
- Building deterministic 3D scene from config.

## Recommended Structure
1. `createScene` + `createCamera` + `createRenderer`
2. compute layout/keyframes
3. create modular roots:
   - corridor
   - environment
   - artwork
   - lighting
   - title
4. add roots once, track references in `sceneGraph`
5. dispose via grouped teardown

## Anti-Patterns
- creating lights/meshes inside render loop
- mixing scene construction with input handling
- no centralized teardown path
