export type LightingMode = 'contrast' | 'day'
export type ArtworkSide = 'left' | 'right'
export type Vec3 = [number, number, number]

export interface ArtworkMetadata {
  artist?: string
  year?: string
  medium?: string
  tags?: string[]
}

export type ArtworkSideTextAlign = 'before' | 'after'

export interface ArtworkSideTextConfig {
  eyebrow?: string
  title?: string
  description?: string
  width?: number
  height?: number
  gap?: number
  offsetY?: number
  offsetZ?: number
  align?: ArtworkSideTextAlign
  backgroundColor?: string
  textColor?: string
  borderEnabled?: boolean
  borderColor?: string
  borderIntensity?: number
  borderWidth?: number
}

export interface ArtworkConfig {
  id: string
  title: string
  description?: string
  imageUrl: string
  fallbackImageUrl?: string
  side?: ArtworkSide
  width?: number
  height?: number
  frameEnabled?: boolean
  frameColor?: string
  frameThickness?: number
  frameDepth?: number
  spotlightIntensity?: number
  sideText?: ArtworkSideTextConfig
  metadata?: ArtworkMetadata
}

export interface SceneTitleConfig {
  fontUrl: string
  size: number
  depth: number
  maxWidth: number
  lineHeight: number
  color: string
  daylightContrastEnabled: boolean
  daylightContrastColor: string
  daylightContrastStrength: number
  position: Vec3
  maxOpacity: number
  fadeStartProgress: number
  fadeEndProgress: number
}

export interface GalleryCameraConfig {
  fov: number
  startPosition: Vec3
  height: number
  movementSmoothing: number
  near: number
  far: number
}

export interface GalleryCorridorConfig {
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

export interface GalleryTimingsConfig {
  introDuration: number
  travelDuration: number
  focusDuration: number
  returnDuration: number
}

export interface ArtGallerySceneConfig {
  id: string
  sceneTitle: string
  lightingMode: LightingMode
  infiniteCorridor: boolean
  sceneBackgroundColor: string
  sceneFogColor: string
  ceilingSpotsEnabled: boolean
  ceilingSpotsColor: string
  ceilingSpotsIntensity: number
  artworkBacklightEnabled: boolean
  artworkBacklightColor: string
  artworkBacklightIntensity: number
  scrollStrength: number
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
  artworks: ArtworkConfig[]
  timings: GalleryTimingsConfig
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export const DAYLIGHT_GALLERY_SAMPLE: ArtGallerySceneConfig = {
  id: 'daylight-galery',
  sceneTitle: 'DayLight galery',
  lightingMode: 'day',
  infiniteCorridor: true,
  sceneBackgroundColor: '#e6ebf3',
  sceneFogColor: '#e7ecf3',
  ceilingSpotsEnabled: false,
  ceilingSpotsColor: '#91ff00',
  ceilingSpotsIntensity: 0.9,
  artworkBacklightEnabled: false,
  artworkBacklightColor: '#ffb36b',
  artworkBacklightIntensity: 1.1,
  scrollStrength: 1,
  loopWhiteAfterEndWindow: 0.14,
  loopWhiteStartsBeforeEndWindow: 0.05,
  loopWhiteFadeOutRevealWindow: 0.12,
  loopWhiteFadeOutWindow: 0.22,
  loopProgressAdvanceDuringWhiteFadeOut: 0.18,
  artworkFocusFill: 0.78,
  artworkTurnSmoothness: 0.65,
  artworkTurnKeyframes: 4,
  artworkTurnLeadIn: 0.2,
  camera: {
    fov: 52,
    startPosition: [0, 1.7, 10],
    height: 1.7,
    movementSmoothing: 0.14,
    near: 0.1,
    far: 400
  },
  corridor: {
    width: 8,
    height: 4.2,
    segmentLength: 12,
    wallColor: '#d8d9dd',
    floorColor: '#656b74',
    ceilingColor: '#eceff4',
    carpetEnabled: true,
    carpetWidth: 0.72,
    carpetColor: '#8f1319',
    artworkSpacing: 14,
    wallThickness: 0.24,
    artworkInset: 0.02
  },
  sceneTitleConfig: {
    fontUrl: '/fonts/helvetiker_regular.typeface.json',
    size: 0.1,
    depth: 0.3,
    maxWidth: 7.2,
    lineHeight: 1.18,
    color: '#ffffff',
    daylightContrastEnabled: true,
    daylightContrastColor: '#c6c6c6',
    daylightContrastStrength: 0.3,
    position: [0, 1.75, 3.25],
    maxOpacity: 1,
    fadeStartProgress: 0.1,
    fadeEndProgress: 0.22
  },
  timings: {
    introDuration: 1.1,
    travelDuration: 1,
    focusDuration: 0.9,
    returnDuration: 0.75
  },
  artworks: [
    {
      id: 'w-01',
      title: 'Echoes of Atrium',
      description: 'A suspended fragment of stillness.',
      imageUrl: '/images/work1.jpg',
      sideText: {
        eyebrow: 'Gallery Note',
        title: 'Echoes of Atrium',
        description: 'A suspended fragment of stillness in atmospheric low-contrast tones.'
      },
      metadata: { artist: 'A. Mercer', year: '2026', medium: 'Archival Pigment' }
    },
    {
      id: 'w-02',
      title: 'Soft Geometry',
      description: 'Planes, silence, and reflected light.',
      imageUrl: '/images/work2.jpg',
      sideText: {
        eyebrow: 'Collection',
        title: 'Soft Geometry',
        description: 'Planes, silence and reflected light arranged in a restrained composition.',
        align: 'before'
      },
      metadata: { artist: 'I. Rowan', year: '2025', medium: 'Digital C-Print' }
    },
    {
      id: 'w-03',
      title: 'Threshold #4',
      description: 'A corridor inside another corridor.',
      imageUrl: '/images/work3.jpg',
      metadata: { artist: 'Noa Lane', year: '2026', medium: 'Mixed Media' }
    },
    {
      id: 'w-04',
      title: 'Monochrome Drift',
      description: 'A cloud-like structure in muted tones.',
      imageUrl: '/images/work4.jpg',
      metadata: { artist: 'R. Chen', year: '2024', medium: 'Photography' }
    }
  ]
}

export const MISTERY_MUSEUM_SAMPLE: ArtGallerySceneConfig = {
  ...DAYLIGHT_GALLERY_SAMPLE,
  id: 'mistery-museum',
  sceneTitle: 'Mistery Museum',
  lightingMode: 'contrast',
  infiniteCorridor: true,
  sceneBackgroundColor: '#000000',
  sceneFogColor: '#050505',
  ceilingSpotsEnabled: true,
  ceilingSpotsColor: '#ff9a3d',
  ceilingSpotsIntensity: 4,
  artworkBacklightEnabled: true,
  artworkBacklightColor: '#ff7a1f',
  artworkBacklightIntensity: 4,
  loopWhiteAfterEndWindow: 0.08,
  loopWhiteStartsBeforeEndWindow: 0.07,
  loopWhiteFadeOutRevealWindow: 0.12,
  loopWhiteFadeOutWindow: 0.24,
  loopProgressAdvanceDuringWhiteFadeOut: 0.22,
  corridor: {
    ...DAYLIGHT_GALLERY_SAMPLE.corridor,
    wallColor: '#2b2723',
    floorColor: '#1f1a16',
    ceilingColor: '#211d1a',
    carpetColor: '#af141b',
    carpetWidth: 0.68,
    artworkSpacing: 12
  },
  sceneTitleConfig: {
    ...DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig,
    color: '#d8e3f8'
  },
  artworks: DAYLIGHT_GALLERY_SAMPLE.artworks.map((artwork, index) => ({
    ...artwork,
    id: `m-${index + 1}`,
    side: index % 2 === 0 ? 'right' : 'left',
    frameColor: '#242b37',
    spotlightIntensity: 1.35,
    sideText: artwork.sideText
      ? {
          ...artwork.sideText,
          borderEnabled: true,
          borderColor: '#ff8d36',
          borderIntensity: 2.2,
          borderWidth: 0.04
        }
      : artwork.sideText
  }))
}

export const SAMPLE_CONFIGS = {
  daylight: DAYLIGHT_GALLERY_SAMPLE,
  mistery: MISTERY_MUSEUM_SAMPLE
} as const

export type SamplePreset = keyof typeof SAMPLE_CONFIGS

