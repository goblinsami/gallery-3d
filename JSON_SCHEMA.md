# JSON Schema (Runtime Contract)

## Schema Intent
- External JSON drives full gallery experience.
- Runtime always validates/sanitizes via `validateGalleryConfig`.

## Top-Level Shape
```ts
interface ArtGallerySceneConfig {
  id: string
  sceneTitle: string
  lightingMode: "contrast" | "day"
  infiniteCorridor: boolean
  sceneBackgroundColor: string
  sceneFogColor: string
  ceilingSpotsEnabled: boolean
  ceilingSpotsColor: string
  ceilingSpotsIntensity: number
  artworkBacklightEnabled: boolean
  artworkBacklightColor: string
  artworkBacklightIntensity: number
  enhanceNightReadibility: boolean
  scrollStrength: number
  mobileDetailsOverlayEnabled: boolean
  mobileDetailsBackdropEnabled: boolean
  mobileDetailsBackdropIntensity: number
  mobileDetailsBackdropHeight: number
  loopWhiteAfterEndWindow: number
  loopWhiteStartsBeforeEndWindow: number
  loopWhiteFadeOutRevealWindow: number
  loopWhiteFadeOutWindow: number
  loopProgressAdvanceDuringWhiteFadeOut: number
  artworkFocusFill: number
  artworkTurnSmoothness: number
  artworkTurnKeyframes: number
  artworkTurnLeadIn: number
  camera: GalleryCameraConfig
  corridor: GalleryCorridorConfig
  sceneTitleConfig: SceneTitleConfig
  items?: GalleryItem[]
  artworks: ArtworkConfig[]
  timings: GalleryTimingsConfig
}
```

```ts
type GalleryItem = ArtworkConfig | StationalCardConfig

interface StationalCardConfig {
  id: string
  type: "stational-card"
  variant?: "about" | "contact" | "manifesto" | "services" | "awards" | "testimonial" | "cta" | "custom"
  title: string
  subtitle?: string
  description?: string
  image?: string
  layout?: "text" | "image-left" | "image-right"
  socialLinks?: { label: string; url: string; icon?: string }[]
  contact?: { email?: string; phone?: string; location?: string }
  cta?: { label: string; url: string }
  width?: number
  height?: number
  depth?: number
  backgroundColor?: string
  borderColor?: string
  glowColor?: string
  spotlightIntensity?: number
}
```

## Config Blocks (Targeted Retrieval)
```ts
interface GalleryCameraConfig {
  fov: number
  startPosition: [number, number, number]
  height: number
  movementSmoothing: number
  near: number
  far: number
}

interface GalleryCorridorConfig {
  width: number
  height: number
  segmentLength: number
  wallColor: string
  floorColor: string
  ceilingColor: string
  carpetEnabled: boolean
  carpetWidth: number
  carpetColor: string
  artworkSpacing: number
  wallThickness: number
  artworkInset: number
}

interface SceneTitleConfig {
  fontUrl: string
  size: number
  depth: number
  maxWidth: number
  lineHeight: number
  color: string
  daylightContrastEnabled: boolean
  daylightContrastColor: string
  daylightContrastStrength: number
  position: [number, number, number]
  maxOpacity: number
  fadeStartProgress: number
  fadeEndProgress: number
}

interface GalleryTimingsConfig {
  introDuration: number
  travelDuration: number
  focusDuration: number
  returnDuration: number
}
```

## Lighting / Environment / Animation Keys
- Lighting:
  - `lightingMode`, `ceilingSpotsEnabled`, `ceilingSpotsColor`, `ceilingSpotsIntensity`
  - `artworkBacklightEnabled`, `artworkBacklightColor`, `artworkBacklightIntensity`
  - `enhanceNightReadibility` (boosts main spotlight + soft backlight in dark scenes)
- Content:
  - Legacy: `artworks[]`
  - Preferred mixed flow: `items[]` (supports `artwork` + `stational-card`)
- Environment:
  - `sceneBackgroundColor`, `sceneFogColor`
  - `corridor.*` colors and geometry proportions
- Animation and journey feel:
  - `scrollStrength`
  - `timings.*`
  - `artworkFocusFill`, `artworkTurnSmoothness`, `artworkTurnKeyframes`, `artworkTurnLeadIn`
  - loop transition windows

## Artwork Structure
```ts
interface ArtworkConfig {
  id: string
  title: string
  imageUrl: string
  description?: string
  fallbackImageUrl?: string
  side?: "left" | "right"
  width?: number
  height?: number
  frameEnabled?: boolean
  frameColor?: string
  frameThickness?: number
  frameDepth?: number
  spotlightIntensity?: number
  sideText?: {
    eyebrow?: string
    title?: string
    description?: string
    width?: number
    height?: number
    gap?: number
    offsetY?: number
    offsetZ?: number
    align?: "before" | "after"
    backgroundColor?: string
    textColor?: string
    borderEnabled?: boolean
    borderColor?: string
    borderIntensity?: number
    borderWidth?: number
  }
  metadata?: {
    artist?: string
    year?: string
    medium?: string
    tags?: string[]
  }
}
```

## Validation / Clamp Highlights
- `scrollStrength`: `0.25..8`
- `camera.fov`: `35..90`
- `camera.near`: `0.01..2`
- `camera.far`: `50..1000`
- `corridor.width`: `4..20`
- `corridor.height`: `2.8..12`
- `corridor.artworkSpacing`: `4..30`
- `artworkTurnKeyframes`: `1..12` (rounded)
- loop windows: bounded to safe cinematic ranges

## Legacy Aliases Supported
- `infiniteGallery` -> `infiniteCorridor`
- `loopWhiteTransitionWindow` -> `loopWhiteAfterEndWindow`
- `loopWhiteLeadWindow` -> `loopWhiteStartsBeforeEndWindow`
- `loopTitleRevealWindow` -> `loopWhiteFadeOutRevealWindow`
- `loopTitleReadableWindow` -> `loopWhiteFadeOutWindow`
- `loopRestartProgressWindow` -> `loopProgressAdvanceDuringWhiteFadeOut`

## Minimal Valid Example
```json
{
  "id": "scene-01",
  "sceneTitle": "DayLight galery",
  "lightingMode": "day",
  "infiniteCorridor": true,
  "artworks": [
    { "id": "w-01", "title": "Work 1", "imageUrl": "/images/work1.jpg" }
  ],
  "camera": { "fov": 52, "startPosition": [0, 1.7, 10], "height": 1.7, "movementSmoothing": 0.14, "near": 0.1, "far": 400 },
  "corridor": { "width": 8, "height": 4.2, "segmentLength": 12, "wallColor": "#d8d9dd", "floorColor": "#656b74", "ceilingColor": "#eceff4", "carpetEnabled": true, "carpetWidth": 0.72, "carpetColor": "#8f1319", "artworkSpacing": 14, "wallThickness": 0.24, "artworkInset": 0.02 },
  "sceneTitleConfig": { "fontUrl": "/fonts/helvetiker_regular.typeface.json", "size": 0.1, "depth": 0.3, "maxWidth": 7.2, "lineHeight": 1.18, "color": "#ffffff", "daylightContrastEnabled": true, "daylightContrastColor": "#c6c6c6", "daylightContrastStrength": 0.3, "position": [0, 1.75, 3.25], "maxOpacity": 1, "fadeStartProgress": 0.1, "fadeEndProgress": 0.22 },
  "timings": { "introDuration": 1.1, "travelDuration": 1, "focusDuration": 0.9, "returnDuration": 0.75 },
  "items": [
    { "id": "w-01", "type": "artwork", "title": "Work 1", "imageUrl": "/images/work1.jpg" },
    { "id": "about", "type": "stational-card", "variant": "about", "title": "About Me", "layout": "text", "description": "Creative direction and immersive storytelling." }
  ],
  "sceneBackgroundColor": "#e6ebf3",
  "sceneFogColor": "#e7ecf3",
  "ceilingSpotsEnabled": false,
  "ceilingSpotsColor": "#91ff00",
  "ceilingSpotsIntensity": 0.9,
  "artworkBacklightEnabled": false,
  "artworkBacklightColor": "#ffb36b",
  "artworkBacklightIntensity": 1.1,
  "enhanceNightReadibility": false,
  "scrollStrength": 1,
  "loopWhiteAfterEndWindow": 0.14,
  "loopWhiteStartsBeforeEndWindow": 0.05,
  "loopWhiteFadeOutRevealWindow": 0.12,
  "loopWhiteFadeOutWindow": 0.22,
  "loopProgressAdvanceDuringWhiteFadeOut": 0.18,
  "artworkFocusFill": 0.78,
  "artworkTurnSmoothness": 0.65,
  "artworkTurnKeyframes": 4,
  "artworkTurnLeadIn": 0.2
}
```

## Low-Token Retrieval Notes
- For schema edits load only:
  1. `src/gallery/types/galleryConfig.ts`
  2. `src/gallery/config/defaultGalleryConfig.ts`
  3. `src/gallery/utils/validateGalleryConfig.ts`
  4. matching runtime mirror files if packaging behavior is affected
