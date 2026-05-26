import * as React from 'react'
import { addPropertyControls, ControlType } from 'framer'

type LightingMode = 'contrast' | 'day'
type ArtworkSide = 'left' | 'right'
type Vec3 = [number, number, number]
type TitleFontPreset = 'helvetiker' | 'droidSerif' | 'optimer' | 'gentilis' | 'custom'
type ArtworkImageSourceMode = 'upload' | 'url' | 'runtimePath' | 'sample'

interface ArtworkMetadata {
  artist?: string
  year?: string
  medium?: string
  tags?: string[]
}

type ArtworkSideTextAlign = 'before' | 'after'

interface ArtworkSideTextConfig {
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

interface ArtworkConfig {
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
  position: Vec3
  maxOpacity: number
  fadeStartProgress: number
  fadeEndProgress: number
}

interface GalleryCameraConfig {
  fov: number
  startPosition: Vec3
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

interface GalleryTimingsConfig {
  introDuration: number
  travelDuration: number
  focusDuration: number
  returnDuration: number
}

interface ArtGallerySceneConfig {
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

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

const DAYLIGHT_GALLERY_SAMPLE: ArtGallerySceneConfig = {
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

const MISTERY_MUSEUM_SAMPLE: ArtGallerySceneConfig = {
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

const SAMPLE_CONFIGS = {
  daylight: DAYLIGHT_GALLERY_SAMPLE,
  mistery: MISTERY_MUSEUM_SAMPLE
} as const

type SamplePreset = keyof typeof SAMPLE_CONFIGS
type SampleConfigMap = Record<SamplePreset, ArtGallerySceneConfig>

const TITLE_FONT_PRESET_URLS: Record<Exclude<TitleFontPreset, 'custom'>, string> = {
  helvetiker: '/fonts/helvetiker_regular.typeface.json',
  droidSerif: '/fonts/droid_serif_regular.typeface.json',
  optimer: '/fonts/optimer_regular.typeface.json',
  gentilis: '/fonts/gentilis_regular.typeface.json'
}

const resolveTitleFontUrl = (preset: TitleFontPreset, customUrl: string): string => {
  if (preset === 'custom') {
    const trimmed = customUrl.trim()
    return trimmed || TITLE_FONT_PRESET_URLS.helvetiker
  }
  return TITLE_FONT_PRESET_URLS[preset]
}

const TEMPLATE_PATHS: Record<SamplePreset, string> = {
  daylight: './templates/daylight-gallery.json',
  mistery: './templates/mistery-museum.json'
}

const isValidSceneConfig = (value: unknown): value is ArtGallerySceneConfig => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Partial<ArtGallerySceneConfig>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.sceneTitle === 'string' &&
    candidate.camera !== undefined &&
    candidate.corridor !== undefined &&
    Array.isArray(candidate.artworks)
  )
}

const resolveTemplateUrl = (relativePath: string): string | null => {
  try {
    return new URL(relativePath, import.meta.url).toString()
  } catch (_error) {
    return null
  }
}

const loadTemplateConfigFromPath = async (
  preset: SamplePreset,
  fallback: ArtGallerySceneConfig
): Promise<ArtGallerySceneConfig> => {
  const templateUrl = resolveTemplateUrl(TEMPLATE_PATHS[preset])
  if (!templateUrl) {
    return fallback
  }

  try {
    const response = await fetch(templateUrl, { cache: 'no-store' })
    if (!response.ok) {
      return fallback
    }

    const parsed = (await response.json()) as unknown
    return isValidSceneConfig(parsed) ? parsed : fallback
  } catch (_error) {
    return fallback
  }
}

const loadTemplateConfigs = async (fallbackConfigs: SampleConfigMap): Promise<SampleConfigMap> => {
  const [daylight, mistery] = await Promise.all([
    loadTemplateConfigFromPath('daylight', fallbackConfigs.daylight),
    loadTemplateConfigFromPath('mistery', fallbackConfigs.mistery)
  ])

  return {
    daylight,
    mistery
  }
}

const cloneSampleConfigs = (): SampleConfigMap => ({
  daylight: cloneConfig(SAMPLE_CONFIGS.daylight),
  mistery: cloneConfig(SAMPLE_CONFIGS.mistery)
})


const RUNTIME_SCRIPT_ATTR = 'data-scrollix-runtime-url'
const DEFAULT_REGISTRATION_TIMEOUT_MS = 7000

interface RuntimeHookState {
  ready: boolean
  loading: boolean
  error: string | null
}

const runtimeScriptPromiseByUrl = new Map<string, Promise<void>>()

const getRuntimeScriptElement = (runtimeUrl: string) => {
  const normalizedRuntimeUrl = new URL(runtimeUrl, window.location.href).href
  const scripts = Array.from(document.querySelectorAll('script'))

  return scripts.find((script) => {
    if (!(script instanceof HTMLScriptElement)) return false
    const taggedUrl = script.getAttribute(RUNTIME_SCRIPT_ATTR)
    if (taggedUrl === runtimeUrl) return true
    if (!script.src) return false

    try {
      return new URL(script.src, window.location.href).href === normalizedRuntimeUrl
    } catch (_error) {
      return false
    }
  }) as HTMLScriptElement | undefined
}

const waitForScriptLoad = (script: HTMLScriptElement, runtimeUrl: string) =>
  new Promise<void>((resolve, reject) => {
    if (script.getAttribute('data-scrollix-loaded') === 'true') {
      resolve()
      return
    }

    const readyState = (script as HTMLScriptElement & { readyState?: string }).readyState
    if (readyState === 'loaded' || readyState === 'complete') {
      script.setAttribute('data-scrollix-loaded', 'true')
      resolve()
      return
    }

    const handleLoad = () => {
      script.setAttribute('data-scrollix-loaded', 'true')
      resolve()
    }

    const handleError = () => {
      reject(
        new Error(
          `[Scrollix] Failed to load runtime module: ${runtimeUrl}. ` +
            `Verify 200 status, JS MIME type, and CORS header Access-Control-Allow-Origin:*`
        )
      )
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
  })

const waitForRegistration = async (tagName: string, timeoutMs: number) => {
  if (window.customElements.get(tagName)) return

  await Promise.race([
    window.customElements.whenDefined(tagName),
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`[Scrollix] Timed out waiting for ${tagName} registration.`))
      }, timeoutMs)
    })
  ])

  if (!window.customElements.get(tagName)) {
    throw new Error(`[Scrollix] ${tagName} is still not registered after module load.`)
  }
}

const loadRuntimeModule = async (runtimeUrl: string, tagName: string) => {
  const normalizedUrl = runtimeUrl.trim()
  if (!normalizedUrl) return

  if (window.customElements.get(tagName)) return

  const key = `${normalizedUrl}::${tagName}`
  const existingPromise = runtimeScriptPromiseByUrl.get(key)
  if (existingPromise) {
    await existingPromise
    await waitForRegistration(tagName, DEFAULT_REGISTRATION_TIMEOUT_MS)
    return
  }

  const pendingLoad = (async () => {
    const existingScript = getRuntimeScriptElement(normalizedUrl)

    if (existingScript) {
      await waitForScriptLoad(existingScript, normalizedUrl)
    } else {
      const script = document.createElement('script')
      script.type = 'module'
      script.async = true
      script.src = normalizedUrl
      script.setAttribute(RUNTIME_SCRIPT_ATTR, normalizedUrl)

      const loadPromise = waitForScriptLoad(script, normalizedUrl)
      document.head.appendChild(script)
      await loadPromise
    }

    await waitForRegistration(tagName, DEFAULT_REGISTRATION_TIMEOUT_MS)
  })()

  runtimeScriptPromiseByUrl.set(key, pendingLoad)

  try {
    await pendingLoad
  } finally {
    runtimeScriptPromiseByUrl.delete(key)
  }
}

const stripRuntimeVersionParam = (runtimeUrl: string) => {
  try {
    const url = new URL(runtimeUrl, window.location.href)
    url.searchParams.delete('v')
    return url.toString()
  } catch (_error) {
    return runtimeUrl
      .replace(/([?&])v=[^&]*(&|$)/, (_match, lead: string, tail: string) => {
        if (lead === '?' && tail) return '?'
        if (lead === '&' && tail) return '&'
        return ''
      })
      .replace(/[?&]$/, '')
  }
}

const useScrollixArtGalleryRuntime = (
  runtimeUrl: string,
  tagName: string
): RuntimeHookState => {
  const [state, setState] = React.useState<RuntimeHookState>({
    ready: false,
    loading: false,
    error: null
  })

  React.useEffect(() => {
    let cancelled = false

    const normalizedUrl = runtimeUrl.trim()
    if (!normalizedUrl) {
      setState({
        ready: false,
        loading: false,
        error: '[Scrollix] runtimeScriptUrl is required.'
      })
      return
    }

    setState({ ready: false, loading: true, error: null })

    const fallbackUrl = stripRuntimeVersionParam(normalizedUrl)
    const canRetryWithoutVersion = fallbackUrl !== normalizedUrl

    const loadWithFallback = async () => {
      try {
        await loadRuntimeModule(normalizedUrl, tagName)
      } catch (primaryError) {
        if (!canRetryWithoutVersion) throw primaryError
        await loadRuntimeModule(fallbackUrl, tagName)
      }
    }

    void loadWithFallback()
      .then(() => {
        if (cancelled) return
        setState({ ready: true, loading: false, error: null })
      })
      .catch((error) => {
        if (cancelled) return
        setState({
          ready: false,
          loading: false,
          error: error instanceof Error ? error.message : '[Scrollix] runtime load failed.'
        })
      })

    return () => {
      cancelled = true
    }
  }, [runtimeUrl, tagName])

  return state
}

type ArtworkSource = 'sample' | 'manual'
type ArtworkSideControl = 'auto' | ArtworkSide
type FramerImageValue = string | { src?: string; srcSet?: string }
type ArtworkImageOverrideValue = FramerImageValue | ArtworkImageOverrideInput

interface ArtworkImageOverrideInput {
  image?: FramerImageValue
  artworkTitle?: string
  artworkDescription?: string
  sideTextEnabled?: boolean
  sideTextEyebrow?: string
  sideTextTitle?: string
  sideTextDescription?: string
}

interface FramerArtworkInput {
  id: string
  title: string
  description: string
  imageSourceMode?: ArtworkImageSourceMode
  imageUpload?: FramerImageValue
  imageExternalUrl?: string
  imageRuntimePath?: string
  // Backward compatibility with older Framer projects.
  imageUrl?: FramerImageValue
  fallbackImageUrl?: FramerImageValue
  side: ArtworkSideControl
  width: number
  height: number
  frameEnabled: boolean
  frameColor: string
  frameThickness: number
  frameDepth: number
  spotlightIntensity: number
  sideTextEnabled: boolean
  sideTextEyebrow: string
  sideTextTitle: string
  sideTextDescription: string
  sideTextAlign: ArtworkSideTextAlign
  sideTextWidth: number
  sideTextHeight: number
  sideTextGap: number
  sideTextOffsetY: number
  sideTextOffsetZ: number
  sideTextBackgroundColor: string
  sideTextTextColor: string
  sideTextBorderEnabled: boolean
  sideTextBorderColor: string
  sideTextBorderIntensity: number
  sideTextBorderWidth: number
}

interface GeometryColorsControls {
  backgroundColor: string
  fogColor: string
  floorColor: string
}

interface CarpetControls {
  enabled: boolean
  color: string
  width: number
}

interface TitleControls {
  text: string
  fontPreset: TitleFontPreset
  customFontUrl: string
  size: number
  depth: number
  maxWidth: number
  lineHeight: number
  color: string
  daylightContrastEnabled: boolean
  daylightContrastColor: string
  daylightContrastStrength: number
  positionX: number
  positionY: number
  positionZ: number
  maxOpacity: number
  fadeStartProgress: number
  fadeEndProgress: number
}

interface DurationControls {
  intro: number
  travel: number
  focus: number
  return: number
}

interface ScrollixArtGalleryProps {
  style?: React.CSSProperties
  runtimeScriptUrl: string
  runtimeVersion: string
  samplePreset: SamplePreset
  artworkSource: ArtworkSource
  artworkImageOverrides: ArtworkImageOverrideValue[]
  geometryColors: GeometryColorsControls
  carpet: CarpetControls
  title: TitleControls
  durations: DurationControls
  jsonOverrideFile: string
  customConfigJson: string
  sceneId: string
  sceneTitle: string
  lightingMode: LightingMode
  infiniteCorridor: boolean
  scrollStrength: number
  sceneBackgroundColor: string
  sceneFogColor: string
  ceilingSpotsEnabled: boolean
  ceilingSpotsColor: string
  ceilingSpotsIntensity: number
  artworkBacklightEnabled: boolean
  artworkBacklightColor: string
  artworkBacklightIntensity: number
  loopWhiteAfterEndWindow: number
  loopWhiteStartsBeforeEndWindow: number
  loopWhiteFadeOutRevealWindow: number
  loopWhiteFadeOutWindow: number
  loopProgressAdvanceDuringWhiteFadeOut: number
  artworkFocusFill: number
  artworkTurnSmoothness: number
  artworkTurnKeyframes: number
  artworkTurnLeadIn: number
  cameraFov: number
  cameraStartX: number
  cameraStartY: number
  cameraStartZ: number
  cameraHeight: number
  cameraMovementSmoothing: number
  cameraNear: number
  cameraFar: number
  corridorWidth: number
  corridorHeight: number
  corridorSegmentLength: number
  corridorArtworkSpacing: number
  corridorWallThickness: number
  corridorArtworkInset: number
  corridorWallColor: string
  corridorFloorColor: string
  corridorCeilingColor: string
  corridorCarpetEnabled: boolean
  corridorCarpetWidth: number
  corridorCarpetColor: string
  titleFontPreset: TitleFontPreset
  titleFontUrl: string
  titleSize: number
  titleDepth: number
  titleMaxWidth: number
  titleLineHeight: number
  titleColor: string
  titleDaylightContrastEnabled: boolean
  titleDaylightContrastColor: string
  titleDaylightContrastStrength: number
  titlePositionX: number
  titlePositionY: number
  titlePositionZ: number
  titleMaxOpacity: number
  titleFadeStartProgress: number
  titleFadeEndProgress: number
  timingIntroDuration: number
  timingTravelDuration: number
  timingFocusDuration: number
  timingReturnDuration: number
  artworks: FramerArtworkInput[]
}

interface BuildConfigResult {
  config: ArtGallerySceneConfig
  parseError: string | null
}

interface OverrideParseResult {
  parsed: DeepPartial<ArtGallerySceneConfig> | null
  error: string | null
}

interface ScrollixArtGalleryRuntimeApi {
  init?: (options?: Record<string, unknown>) => unknown
  registerWebComponents?: () => unknown
}

declare global {
  interface Window {
    ScrollixArtGalleryRuntime?: ScrollixArtGalleryRuntimeApi
    __SCROLLIX_ART_GALLERY_RUNTIME_AUTO_VERSION__?: string
  }

  namespace JSX {
    interface ScrollixArtGalleryIntrinsicProps
      extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
      'config-json'?: string
    }

    interface IntrinsicElements {
      'scrollix-art-gallery': ScrollixArtGalleryIntrinsicProps
    }
  }
}

const SCROLLIX_ART_GALLERY_TAG = 'scrollix-art-gallery'
const DEFAULT_RUNTIME_SCRIPT_URL = 'https://celadon-lily-f8f07b.netlify.app/scrollix-art-gallery-runtime.js'
const DEFAULT_RUNTIME_VERSION = 'auto'
const RUNTIME_VERSION_AUTO = 'auto'
const FRAMER_PREVIEW_HOST_TOKENS = ['framercanvas.com']
const FRAMER_PREVIEW_PATH_TOKENS = ['canvas-sandbox.html', 'preview-module.html']

const runtimePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '220px',
  display: 'grid',
  placeItems: 'center',
  padding: '12px',
  background: '#060914',
  color: '#e7eeff',
  fontSize: '12px',
  lineHeight: 1.4,
  textAlign: 'center'
}

const normalizeFramerImageValue = (image: FramerImageValue | undefined): string | undefined => {
  if (typeof image === 'string') {
    const trimmed = image.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (image && typeof image === 'object' && typeof image.src === 'string') {
    const trimmed = image.src.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return undefined
}

interface ParsedArtworkImageOverride {
  imageUrl?: string
  artworkTitle?: string
  artworkDescription?: string
  sideTextEnabled?: boolean
  sideTextEyebrow?: string
  sideTextTitle?: string
  sideTextDescription?: string
}

const normalizeArtworkImageOverride = (
  override: ArtworkImageOverrideValue
): ParsedArtworkImageOverride => {
  if (typeof override === 'string') {
    return {
      imageUrl: normalizeFramerImageValue(override)
    }
  }

  if (!override || typeof override !== 'object') {
    return {}
  }

  // Legacy array format: item is directly a Framer image object { src, srcSet }.
  if ('src' in override || 'srcSet' in override) {
    return {
      imageUrl: normalizeFramerImageValue(override as FramerImageValue)
    }
  }

  const objectOverride = override as ArtworkImageOverrideInput
  const artworkTitle = objectOverride.artworkTitle?.trim()
  const artworkDescription = objectOverride.artworkDescription?.trim()
  const sideTextEyebrow = objectOverride.sideTextEyebrow?.trim()
  const sideTextTitle = objectOverride.sideTextTitle?.trim()
  const sideTextDescription = objectOverride.sideTextDescription?.trim()

  return {
    imageUrl: normalizeFramerImageValue(objectOverride.image),
    artworkTitle: artworkTitle && artworkTitle.length > 0 ? artworkTitle : undefined,
    artworkDescription:
      artworkDescription && artworkDescription.length > 0 ? artworkDescription : undefined,
    sideTextEnabled:
      typeof objectOverride.sideTextEnabled === 'boolean' ? objectOverride.sideTextEnabled : undefined,
    sideTextEyebrow: sideTextEyebrow && sideTextEyebrow.length > 0 ? sideTextEyebrow : undefined,
    sideTextTitle: sideTextTitle && sideTextTitle.length > 0 ? sideTextTitle : undefined,
    sideTextDescription:
      sideTextDescription && sideTextDescription.length > 0 ? sideTextDescription : undefined
  }
}

const getArtworkImageOverrideSignature = (overrides: ArtworkImageOverrideValue[]): string =>
  JSON.stringify(
    overrides.map((item) => {
      const normalized = normalizeArtworkImageOverride(item)
      return {
        imageUrl: normalized.imageUrl ?? '',
        artworkTitle: normalized.artworkTitle ?? '',
        artworkDescription: normalized.artworkDescription ?? '',
        sideTextEnabled:
          typeof normalized.sideTextEnabled === 'boolean' ? normalized.sideTextEnabled : null,
        sideTextEyebrow: normalized.sideTextEyebrow ?? '',
        sideTextTitle: normalized.sideTextTitle ?? '',
        sideTextDescription: normalized.sideTextDescription ?? ''
      }
    })
  )

const normalizeExternalUrl = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : undefined
}

const normalizeRuntimePath = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return undefined
  if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    return trimmed
  }
  return `/images/${trimmed.replace(/^\.?\//, '')}`
}

const cloneConfig = (config: ArtGallerySceneConfig): ArtGallerySceneConfig =>
  JSON.parse(JSON.stringify(config)) as ArtGallerySceneConfig

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const deepMerge = <T extends Record<string, unknown>>(base: T, override: unknown): T => {
  if (!isPlainObject(override)) return base

  const output: Record<string, unknown> = { ...base }

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = output[key]
    if (Array.isArray(overrideValue)) {
      output[key] = overrideValue
      continue
    }
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      output[key] = deepMerge(baseValue, overrideValue)
      continue
    }
    output[key] = overrideValue
  }

  return output as T
}

const isFramerPreviewRuntime = () => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  const path = window.location.pathname.toLowerCase()
  return (
    FRAMER_PREVIEW_HOST_TOKENS.some((token) => host.includes(token)) ||
    FRAMER_PREVIEW_PATH_TOKENS.some((token) => path.includes(token))
  )
}

const getAutoRuntimeVersion = () => {
  if (!isFramerPreviewRuntime()) return ''
  if (!window.__SCROLLIX_ART_GALLERY_RUNTIME_AUTO_VERSION__) {
    window.__SCROLLIX_ART_GALLERY_RUNTIME_AUTO_VERSION__ = `auto-${Date.now().toString(36)}`
  }
  return window.__SCROLLIX_ART_GALLERY_RUNTIME_AUTO_VERSION__
}

const resolveRuntimeUrl = (runtimeScriptUrl: string, runtimeVersion: string, autoRuntimeVersion: string) => {
  const trimmedUrl = runtimeScriptUrl.trim()
  if (!trimmedUrl) return ''

  const trimmedVersion = runtimeVersion.trim()
  const resolvedVersion =
    !trimmedVersion || trimmedVersion.toLowerCase() === RUNTIME_VERSION_AUTO
      ? autoRuntimeVersion
      : trimmedVersion
  if (!resolvedVersion) return trimmedUrl

  try {
    const url = new URL(trimmedUrl, window.location.href)
    url.searchParams.set('v', resolvedVersion)
    return url.toString()
  } catch (_error) {
    const separator = trimmedUrl.includes('?') ? '&' : '?'
    return `${trimmedUrl}${separator}v=${encodeURIComponent(resolvedVersion)}`
  }
}

const createArtworkInputFromConfig = (artwork: ArtworkConfig, index: number): FramerArtworkInput => {
  return {
    id: artwork.id || `art-${index + 1}`,
    title: artwork.title || `Artwork ${index + 1}`,
    description: artwork.description ?? '',
    imageSourceMode: 'upload',
    imageUpload: artwork.imageUrl,
    imageExternalUrl: '',
    imageRuntimePath: '',
    imageUrl: artwork.imageUrl,
    fallbackImageUrl: artwork.fallbackImageUrl,
    side: artwork.side ?? 'auto',
    width: artwork.width ?? 2.4,
    height: artwork.height ?? 1.6,
    frameEnabled: artwork.frameEnabled ?? false,
    frameColor: artwork.frameColor ?? '#151515',
    frameThickness: artwork.frameThickness ?? 0.14,
    frameDepth: artwork.frameDepth ?? 0.06,
    spotlightIntensity: artwork.spotlightIntensity ?? 1.15,
    sideTextEnabled: Boolean(artwork.sideText?.eyebrow || artwork.sideText?.title || artwork.sideText?.description),
    sideTextEyebrow: artwork.sideText?.eyebrow ?? '',
    sideTextTitle: artwork.sideText?.title ?? '',
    sideTextDescription: artwork.sideText?.description ?? '',
    sideTextAlign: artwork.sideText?.align ?? 'after',
    sideTextWidth: artwork.sideText?.width ?? 1.55,
    sideTextHeight: artwork.sideText?.height ?? 1.1,
    sideTextGap: artwork.sideText?.gap ?? 0.5,
    sideTextOffsetY: artwork.sideText?.offsetY ?? 0,
    sideTextOffsetZ: artwork.sideText?.offsetZ ?? 0,
    sideTextBackgroundColor: artwork.sideText?.backgroundColor ?? '#0e1422',
    sideTextTextColor: artwork.sideText?.textColor ?? '#f3f6fb',
    sideTextBorderEnabled: artwork.sideText?.borderEnabled ?? false,
    sideTextBorderColor: artwork.sideText?.borderColor ?? '#ff9e4b',
    sideTextBorderIntensity: artwork.sideText?.borderIntensity ?? 1.2,
    sideTextBorderWidth: artwork.sideText?.borderWidth ?? 0.035
  }
}

const DEFAULT_MANUAL_ARTWORKS: FramerArtworkInput[] = DAYLIGHT_GALLERY_SAMPLE.artworks.map(
  createArtworkInputFromConfig
)
const DEFAULT_ARTWORK_IMAGE_OVERRIDES: ArtworkImageOverrideInput[] = DAYLIGHT_GALLERY_SAMPLE.artworks.map(
  (artwork) => ({
    image: artwork.imageUrl,
    artworkTitle: artwork.title,
    artworkDescription: artwork.description ?? '',
    sideTextEnabled: Boolean(
      artwork.sideText?.eyebrow || artwork.sideText?.title || artwork.sideText?.description
    ),
    sideTextEyebrow: artwork.sideText?.eyebrow ?? '',
    sideTextTitle: artwork.sideText?.title ?? '',
    sideTextDescription: artwork.sideText?.description ?? ''
  })
)
const DEFAULT_ARTWORK_IMAGE_OVERRIDES_SIGNATURE = getArtworkImageOverrideSignature(
  DEFAULT_ARTWORK_IMAGE_OVERRIDES
)

const getArtworkSignature = (artwork: FramerArtworkInput) => ({
  id: artwork.id.trim(),
  title: artwork.title.trim(),
  description: artwork.description.trim(),
  imageUpload: normalizeFramerImageValue(artwork.imageUpload) ?? '',
  imageUrl: normalizeFramerImageValue(artwork.imageUrl) ?? '',
  fallbackImageUrl: normalizeFramerImageValue(artwork.fallbackImageUrl) ?? '',
  side: artwork.side,
  width: artwork.width,
  height: artwork.height,
  frameEnabled: artwork.frameEnabled,
  frameColor: artwork.frameColor,
  frameThickness: artwork.frameThickness,
  frameDepth: artwork.frameDepth,
  spotlightIntensity: artwork.spotlightIntensity,
  sideTextEnabled: artwork.sideTextEnabled,
  sideTextEyebrow: artwork.sideTextEyebrow.trim(),
  sideTextTitle: artwork.sideTextTitle.trim(),
  sideTextDescription: artwork.sideTextDescription.trim(),
  sideTextAlign: artwork.sideTextAlign,
  sideTextWidth: artwork.sideTextWidth,
  sideTextHeight: artwork.sideTextHeight,
  sideTextGap: artwork.sideTextGap,
  sideTextOffsetY: artwork.sideTextOffsetY,
  sideTextOffsetZ: artwork.sideTextOffsetZ,
  sideTextBackgroundColor: artwork.sideTextBackgroundColor,
  sideTextTextColor: artwork.sideTextTextColor,
  sideTextBorderEnabled: artwork.sideTextBorderEnabled,
  sideTextBorderColor: artwork.sideTextBorderColor,
  sideTextBorderIntensity: artwork.sideTextBorderIntensity,
  sideTextBorderWidth: artwork.sideTextBorderWidth
})

const getArtworksSignature = (artworks: FramerArtworkInput[]): string =>
  JSON.stringify(artworks.map(getArtworkSignature))

const DEFAULT_MANUAL_ARTWORKS_SIGNATURE = getArtworksSignature(DEFAULT_MANUAL_ARTWORKS)

const resolveArtworkImageUrl = (
  artwork: FramerArtworkInput,
  sampleArtwork: ArtworkConfig | undefined
): string | undefined => {
  const legacyImage = normalizeFramerImageValue(artwork.imageUrl)
  const uploadImage = normalizeFramerImageValue(artwork.imageUpload)
  const externalImage = normalizeExternalUrl(artwork.imageExternalUrl)
  const runtimeImage = normalizeRuntimePath(artwork.imageRuntimePath)
  const sampleImage = sampleArtwork?.imageUrl?.trim() || undefined
  const sourceMode = artwork.imageSourceMode ?? 'upload'

  if (sourceMode === 'sample') {
    return sampleImage ?? uploadImage ?? externalImage ?? runtimeImage ?? legacyImage
  }
  if (sourceMode === 'url') {
    return externalImage ?? uploadImage ?? runtimeImage ?? legacyImage ?? sampleImage
  }
  if (sourceMode === 'runtimePath') {
    return runtimeImage ?? uploadImage ?? externalImage ?? legacyImage ?? sampleImage
  }
  return uploadImage ?? legacyImage ?? externalImage ?? runtimeImage ?? sampleImage
}

const hasSideTextContent = (sideText: ArtworkSideTextConfig | undefined): boolean =>
  Boolean(sideText?.eyebrow || sideText?.title || sideText?.description)

const toArtworkConfig = (
  artwork: FramerArtworkInput,
  index: number,
  sampleArtwork: ArtworkConfig | undefined
): ArtworkConfig | null => {
  const normalizedId = artwork.id.trim() || `framer-art-${index + 1}`
  const normalizedTitle = artwork.title.trim() || sampleArtwork?.title || `Artwork ${index + 1}`
  const imageUrl = resolveArtworkImageUrl(artwork, sampleArtwork) ?? sampleArtwork?.imageUrl?.trim()
  const fallbackImageUrl =
    normalizeFramerImageValue(artwork.fallbackImageUrl) ?? sampleArtwork?.fallbackImageUrl

  if (!imageUrl) {
    return null
  }

  const side =
    artwork.side === 'left' || artwork.side === 'right'
      ? artwork.side
      : sampleArtwork?.side

  const sideTextFromControls: ArtworkSideTextConfig | undefined = artwork.sideTextEnabled
    ? {
        eyebrow: artwork.sideTextEyebrow.trim() || sampleArtwork?.sideText?.eyebrow,
        title: artwork.sideTextTitle.trim() || sampleArtwork?.sideText?.title,
        description: artwork.sideTextDescription.trim() || sampleArtwork?.sideText?.description,
        align: artwork.sideTextAlign,
        width: artwork.sideTextWidth,
        height: artwork.sideTextHeight,
        gap: artwork.sideTextGap,
        offsetY: artwork.sideTextOffsetY,
        offsetZ: artwork.sideTextOffsetZ,
        backgroundColor: artwork.sideTextBackgroundColor,
        textColor: artwork.sideTextTextColor,
        borderEnabled: artwork.sideTextBorderEnabled,
        borderColor: artwork.sideTextBorderColor,
        borderIntensity: artwork.sideTextBorderIntensity,
        borderWidth: artwork.sideTextBorderWidth
      }
    : undefined

  return {
    id: normalizedId,
    title: normalizedTitle,
    description: artwork.description.trim() || sampleArtwork?.description || undefined,
    imageUrl,
    fallbackImageUrl,
    side,
    width: artwork.width,
    height: artwork.height,
    frameEnabled: artwork.frameEnabled,
    frameColor: artwork.frameColor,
    frameThickness: artwork.frameThickness,
    frameDepth: artwork.frameDepth,
    spotlightIntensity: artwork.spotlightIntensity,
    sideText: hasSideTextContent(sideTextFromControls) ? sideTextFromControls : undefined
  }
}

const resolveArtworks = (
  artworkSource: ArtworkSource,
  artworks: FramerArtworkInput[],
  sampleConfig: ArtGallerySceneConfig
) => {
  if (artworkSource === 'sample') {
    const hasAnyArrayEdit = getArtworksSignature(artworks) !== DEFAULT_MANUAL_ARTWORKS_SIGNATURE
    if (!hasAnyArrayEdit) {
      return sampleConfig.artworks
    }

    const merged: ArtworkConfig[] = []
    const maxLength = Math.max(sampleConfig.artworks.length, artworks.length)
    for (let index = 0; index < maxLength; index += 1) {
      const sampleArtwork = sampleConfig.artworks[index]
      const manualArtwork = artworks[index]

      if (!manualArtwork) {
        if (sampleArtwork) merged.push(sampleArtwork)
        continue
      }

      const baselineManualArtwork = DEFAULT_MANUAL_ARTWORKS[index]
      const isEditedFromBaseline =
        !baselineManualArtwork ||
        JSON.stringify(getArtworkSignature(manualArtwork)) !==
          JSON.stringify(getArtworkSignature(baselineManualArtwork))

      if (!isEditedFromBaseline) {
        if (sampleArtwork) merged.push(sampleArtwork)
        continue
      }

      const editedArtwork = toArtworkConfig(manualArtwork, index, sampleArtwork)
      if (editedArtwork) {
        merged.push(editedArtwork)
      } else if (sampleArtwork) {
        merged.push(sampleArtwork)
      }
    }

    return merged.length > 0 ? merged : sampleConfig.artworks
  }

  const manual = artworks
    .map((artwork, index) => toArtworkConfig(artwork, index, sampleConfig.artworks[index]))
    .filter((item): item is ArtworkConfig => Boolean(item))

  return manual.length > 0 ? manual : sampleConfig.artworks
}

const applyArtworkImageOverrides = (
  config: ArtGallerySceneConfig,
  imageOverrides: ArtworkImageOverrideValue[],
  samplePreset: SamplePreset
): ArtGallerySceneConfig => {
  if (!Array.isArray(imageOverrides) || imageOverrides.length === 0) {
    return config
  }

  const normalizedOverrides = imageOverrides.map((item) => normalizeArtworkImageOverride(item))
  const hasAnyOverride = normalizedOverrides.some((item) => {
    return Boolean(
      item.imageUrl ||
      item.artworkTitle ||
      item.artworkDescription ||
      item.sideTextEnabled !== undefined ||
      item.sideTextEyebrow ||
      item.sideTextTitle ||
      item.sideTextDescription
    )
  })
  if (!hasAnyOverride) {
    return config
  }

  const normalizedOverrideUrls = normalizedOverrides.map((item) => item.imageUrl ?? '')
  const currentImages = config.artworks.map((artwork) => artwork.imageUrl)
  const alreadyMatchesCurrent = normalizedOverrideUrls.every(
    (overrideUrl, index) => !overrideUrl || overrideUrl === currentImages[index]
  )

  const hasTextOverrides = normalizedOverrides.some((item) => {
    return Boolean(
      item.artworkTitle ||
      item.artworkDescription ||
      item.sideTextEnabled !== undefined ||
      item.sideTextEyebrow ||
      item.sideTextTitle ||
      item.sideTextDescription
    )
  })

  if (alreadyMatchesCurrent && !hasTextOverrides) {
    return config
  }

  // Framer keeps defaultProps values from the initial sample preset.
  // If sample changes from daylight to mistery and this list is still the
  // untouched daylight default, we should not force those old images.
  if (
    samplePreset !== 'daylight' &&
    getArtworkImageOverrideSignature(imageOverrides) === DEFAULT_ARTWORK_IMAGE_OVERRIDES_SIGNATURE
  ) {
    return config
  }

  const nextConfig = cloneConfig(config)

  const ensureArtworkAt = (index: number): ArtworkConfig => {
    const existing = nextConfig.artworks[index]
    if (existing) return existing

    const fallbackArtwork = nextConfig.artworks[nextConfig.artworks.length - 1]
    const created: ArtworkConfig = {
      id: `framer-art-${index + 1}`,
      title: `Artwork ${index + 1}`,
      description: '',
      imageUrl: '',
      fallbackImageUrl: fallbackArtwork?.fallbackImageUrl,
      side: index % 2 === 0 ? 'left' : 'right',
      width: fallbackArtwork?.width ?? 2.4,
      height: fallbackArtwork?.height ?? 1.6,
      frameEnabled: fallbackArtwork?.frameEnabled ?? false,
      frameColor: fallbackArtwork?.frameColor ?? '#151515',
      frameThickness: fallbackArtwork?.frameThickness ?? 0.14,
      frameDepth: fallbackArtwork?.frameDepth ?? 0.06,
      spotlightIntensity: fallbackArtwork?.spotlightIntensity ?? 1.15
    }
    nextConfig.artworks[index] = created
    return created
  }

  for (let index = 0; index < normalizedOverrides.length; index += 1) {
    const override = normalizedOverrides[index]
    if (
      !override.imageUrl &&
      !override.artworkTitle &&
      !override.artworkDescription &&
      override.sideTextEnabled === undefined &&
      !override.sideTextEyebrow &&
      !override.sideTextTitle &&
      !override.sideTextDescription
    ) {
      continue
    }

    const existingArtwork = nextConfig.artworks[index]
    if (!existingArtwork && !override.imageUrl) {
      continue
    }
    const currentArtwork = existingArtwork ?? ensureArtworkAt(index)
    const nextArtwork: ArtworkConfig = {
      ...currentArtwork,
      imageUrl: override.imageUrl ?? currentArtwork.imageUrl,
      title: override.artworkTitle ?? currentArtwork.title,
      description: override.artworkDescription ?? currentArtwork.description
    }

    if (override.sideTextEnabled) {
      nextArtwork.sideText = {
        align: currentArtwork.sideText?.align ?? 'after',
        width: currentArtwork.sideText?.width ?? 1.55,
        height: currentArtwork.sideText?.height ?? 1.1,
        gap: currentArtwork.sideText?.gap ?? 0.5,
        offsetY: currentArtwork.sideText?.offsetY ?? 0,
        offsetZ: currentArtwork.sideText?.offsetZ ?? 0,
        backgroundColor: currentArtwork.sideText?.backgroundColor ?? '#0e1422',
        textColor: currentArtwork.sideText?.textColor ?? '#f3f6fb',
        borderEnabled: currentArtwork.sideText?.borderEnabled ?? false,
        borderColor: currentArtwork.sideText?.borderColor ?? '#ff9e4b',
        borderIntensity: currentArtwork.sideText?.borderIntensity ?? 1.2,
        borderWidth: currentArtwork.sideText?.borderWidth ?? 0.035,
        eyebrow: override.sideTextEyebrow ?? currentArtwork.sideText?.eyebrow,
        title: override.sideTextTitle ?? currentArtwork.sideText?.title,
        description: override.sideTextDescription ?? currentArtwork.sideText?.description
      }
    } else if (override.sideTextEnabled === false) {
      nextArtwork.sideText = undefined
    }

    nextConfig.artworks[index] = nextArtwork
  }
  return nextConfig
}

const parseCustomConfigJson = (value: string): OverrideParseResult => {
  const trimmed = value.trim()
  if (!trimmed) return { parsed: null, error: null }

  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (!isPlainObject(parsed)) {
      return {
        parsed: null,
        error: '[Scrollix] customConfigJson must be a JSON object.'
      }
    }
    return { parsed: parsed as DeepPartial<ArtGallerySceneConfig>, error: null }
  } catch (error) {
    return {
      parsed: null,
      error: error instanceof Error ? error.message : '[Scrollix] Invalid customConfigJson.'
    }
  }
}

const loadJsonOverrideFromUrl = async (url: string): Promise<OverrideParseResult> => {
  const trimmed = url.trim()
  if (!trimmed) {
    return { parsed: null, error: null }
  }

  try {
    const response = await fetch(trimmed, { cache: 'no-store' })
    if (!response.ok) {
      return {
        parsed: null,
        error: `[Scrollix] JSON Override File request failed (${response.status}).`
      }
    }

    const text = await response.text()
    const parsed = parseCustomConfigJson(text)
    if (!parsed.parsed) {
      return {
        parsed: null,
        error: parsed.error
          ? `[Scrollix] JSON Override File invalid: ${parsed.error}`
          : '[Scrollix] JSON Override File invalid.'
      }
    }

    return parsed
  } catch (error) {
    return {
      parsed: null,
      error: error instanceof Error
        ? `[Scrollix] JSON Override File load failed: ${error.message}`
        : '[Scrollix] JSON Override File load failed.'
    }
  }
}

const buildGalleryConfig = (
  props: ScrollixArtGalleryProps,
  sampleConfigs: SampleConfigMap,
  fileOverride: OverrideParseResult
): BuildConfigResult => {
  const sampleConfig = sampleConfigs[props.samplePreset]
  const controlsBaseline = cloneConfig(sampleConfigs.daylight)
  const geometryColors = props.geometryColors
  const carpet = props.carpet
  const title = props.title
  const durations = props.durations
  const selectedTitleFontUrl = resolveTitleFontUrl(title.fontPreset, title.customFontUrl)

  const overrideConfig: DeepPartial<ArtGallerySceneConfig> = {
    id: props.sceneId.trim() || controlsBaseline.id,
    sceneTitle: title.text.trim() || props.sceneTitle.trim() || controlsBaseline.sceneTitle,
    lightingMode: props.lightingMode,
    infiniteCorridor: props.infiniteCorridor,
    sceneBackgroundColor: geometryColors.backgroundColor,
    sceneFogColor: geometryColors.fogColor,
    ceilingSpotsEnabled: props.ceilingSpotsEnabled,
    ceilingSpotsColor: props.ceilingSpotsColor,
    ceilingSpotsIntensity: props.ceilingSpotsIntensity,
    artworkBacklightEnabled: props.artworkBacklightEnabled,
    artworkBacklightColor: props.artworkBacklightColor,
    artworkBacklightIntensity: props.artworkBacklightIntensity,
    scrollStrength: props.scrollStrength,
    loopWhiteAfterEndWindow: props.loopWhiteAfterEndWindow,
    loopWhiteStartsBeforeEndWindow: props.loopWhiteStartsBeforeEndWindow,
    loopWhiteFadeOutRevealWindow: props.loopWhiteFadeOutRevealWindow,
    loopWhiteFadeOutWindow: props.loopWhiteFadeOutWindow,
    loopProgressAdvanceDuringWhiteFadeOut: props.loopProgressAdvanceDuringWhiteFadeOut,
    artworkFocusFill: props.artworkFocusFill,
    artworkTurnSmoothness: props.artworkTurnSmoothness,
    artworkTurnKeyframes: props.artworkTurnKeyframes,
    artworkTurnLeadIn: props.artworkTurnLeadIn,
    camera: {
      fov: props.cameraFov,
      startPosition: [props.cameraStartX, props.cameraStartY, props.cameraStartZ],
      height: props.cameraHeight,
      movementSmoothing: props.cameraMovementSmoothing,
      near: props.cameraNear,
      far: props.cameraFar
    },
    corridor: {
      width: props.corridorWidth,
      height: props.corridorHeight,
      segmentLength: props.corridorSegmentLength,
      wallColor: props.corridorWallColor,
      floorColor: geometryColors.floorColor,
      ceilingColor: props.corridorCeilingColor,
      carpetEnabled: carpet.enabled,
      carpetWidth: carpet.width,
      carpetColor: carpet.color,
      artworkSpacing: props.corridorArtworkSpacing,
      wallThickness: props.corridorWallThickness,
      artworkInset: props.corridorArtworkInset
    },
    sceneTitleConfig: {
      fontUrl: selectedTitleFontUrl,
      size: title.size,
      depth: title.depth,
      maxWidth: title.maxWidth,
      lineHeight: title.lineHeight,
      color: title.color,
      daylightContrastEnabled: title.daylightContrastEnabled,
      daylightContrastColor: title.daylightContrastColor,
      daylightContrastStrength: title.daylightContrastStrength,
      position: [title.positionX, title.positionY, title.positionZ],
      maxOpacity: title.maxOpacity,
      fadeStartProgress: title.fadeStartProgress,
      fadeEndProgress: title.fadeEndProgress
    },
    timings: {
      introDuration: durations.intro,
      travelDuration: durations.travel,
      focusDuration: durations.focus,
      returnDuration: durations.return
    }
  }

  const withControlOverrides = deepMerge(
    controlsBaseline as unknown as Record<string, unknown>,
    overrideConfig
  ) as unknown as ArtGallerySceneConfig

  // Sample selector behaves as a direct JSON override layer.
  const withSampleOverride = deepMerge(
    withControlOverrides as unknown as Record<string, unknown>,
    sampleConfig
  ) as unknown as ArtGallerySceneConfig

  const withFontSelection = deepMerge(
    withSampleOverride as unknown as Record<string, unknown>,
    {
      sceneTitleConfig: {
        fontUrl: selectedTitleFontUrl
      }
    }
  ) as unknown as ArtGallerySceneConfig

  const withArtworkControls = deepMerge(
    withFontSelection as unknown as Record<string, unknown>,
    {
      artworks: resolveArtworks(props.artworkSource, props.artworks, withFontSelection)
    }
  ) as unknown as ArtGallerySceneConfig

  const withFileOverride = fileOverride.parsed
    ? (deepMerge(
        withArtworkControls as unknown as Record<string, unknown>,
        fileOverride.parsed
      ) as unknown as ArtGallerySceneConfig)
    : withArtworkControls

  const parsedOverride = parseCustomConfigJson(props.customConfigJson)
  if (!parsedOverride.parsed) {
    const parseError = parsedOverride.error ?? fileOverride.error
    const withImageOverrides = applyArtworkImageOverrides(
      withFileOverride,
      props.artworkImageOverrides,
      props.samplePreset
    )
    return {
      config: withImageOverrides,
      parseError
    }
  }

  const mergedConfig = deepMerge(
    withFileOverride as unknown as Record<string, unknown>,
    parsedOverride.parsed
  ) as unknown as ArtGallerySceneConfig
  const finalConfig = applyArtworkImageOverrides(
    mergedConfig,
    props.artworkImageOverrides,
    props.samplePreset
  )
  return {
    config: finalConfig,
    parseError: fileOverride.error
  }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 760
 */
function ScrollixArtGallery(props: ScrollixArtGalleryProps) {
  const [sampleConfigs, setSampleConfigs] = React.useState<SampleConfigMap>(() => cloneSampleConfigs())
  const [fileOverride, setFileOverride] = React.useState<OverrideParseResult>({
    parsed: null,
    error: null
  })

  React.useEffect(() => {
    let cancelled = false

    void loadTemplateConfigs(cloneSampleConfigs()).then((loaded) => {
      if (cancelled) return
      setSampleConfigs(loaded)
    })

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false

    void loadJsonOverrideFromUrl(props.jsonOverrideFile).then((result) => {
      if (cancelled) return
      setFileOverride(result)
    })

    return () => {
      cancelled = true
    }
  }, [props.jsonOverrideFile])

  const autoRuntimeVersion = React.useMemo(() => getAutoRuntimeVersion(), [])
  const resolvedRuntimeScriptUrl = React.useMemo(
    () => resolveRuntimeUrl(props.runtimeScriptUrl, props.runtimeVersion, autoRuntimeVersion),
    [props.runtimeScriptUrl, props.runtimeVersion, autoRuntimeVersion]
  )

  const { ready: runtimeReady, loading: runtimeLoading, error: runtimeLoadError } =
    useScrollixArtGalleryRuntime(resolvedRuntimeScriptUrl, SCROLLIX_ART_GALLERY_TAG)

  const [runtimeInitialized, setRuntimeInitialized] = React.useState(false)
  const [runtimeInitError, setRuntimeInitError] = React.useState<string | null>(null)

  const buildResult = React.useMemo(
    () => buildGalleryConfig(props, sampleConfigs, fileOverride),
    [props, sampleConfigs, fileOverride]
  )
  const payload = React.useMemo(() => JSON.stringify(buildResult.config), [buildResult.config])

  const frameStyle = React.useMemo<React.CSSProperties>(
    () => ({
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      ...(props.style ?? {})
    }),
    [props.style]
  )

  const runtimeElementStyle = React.useMemo<React.CSSProperties>(
    () => ({
      display: 'block',
      width: '100%',
      height: '100%',
      minHeight: '100%',
      minWidth: 0
    }),
    []
  )

  React.useEffect(() => {
    if (!runtimeReady) {
      setRuntimeInitialized(false)
      return
    }

    try {
      window.ScrollixArtGalleryRuntime?.init?.()
      window.ScrollixArtGalleryRuntime?.registerWebComponents?.()

      const isRegistered = Boolean(window.customElements.get(SCROLLIX_ART_GALLERY_TAG))
      if (!isRegistered) {
        throw new Error('[Scrollix] runtime module loaded but scrollix-art-gallery was not registered.')
      }

      setRuntimeInitError(null)
      setRuntimeInitialized(true)
    } catch (error) {
      setRuntimeInitialized(false)
      setRuntimeInitError(error instanceof Error ? error.message : 'Runtime bootstrap failed.')
    }
  }, [runtimeReady])

  if (runtimeLoadError || runtimeInitError) {
    const errorMessage = runtimeLoadError ?? runtimeInitError ?? 'Runtime failed to initialize.'
    return (
      <div
        style={{ ...runtimePlaceholderStyle, ...(props.style ?? {}) }}
        data-runtime-ready="false"
        data-runtime-error={errorMessage}
      >
        <span>{errorMessage}</span>
      </div>
    )
  }

  if (runtimeLoading || !runtimeInitialized) {
    return (
      <div
        style={{ ...runtimePlaceholderStyle, ...(props.style ?? {}) }}
        data-runtime-ready="false"
        data-runtime-loading="true"
      >
        <span>Loading Scrollix Art Gallery runtime...</span>
      </div>
    )
  }

  return (
    <div
      style={frameStyle}
      data-runtime-ready={runtimeInitialized ? 'true' : 'false'}
      data-config-parse-error={buildResult.parseError ?? ''}
    >
      <scrollix-art-gallery style={runtimeElementStyle} config-json={payload} />
    </div>
  )
}

ScrollixArtGallery.defaultProps = {
  runtimeScriptUrl: DEFAULT_RUNTIME_SCRIPT_URL,
  runtimeVersion: DEFAULT_RUNTIME_VERSION,
  samplePreset: 'daylight',
  artworkSource: 'sample',
  artworkImageOverrides: DEFAULT_ARTWORK_IMAGE_OVERRIDES,
  jsonOverrideFile: '',
  customConfigJson: '',
  sceneId: DAYLIGHT_GALLERY_SAMPLE.id,
  sceneTitle: DAYLIGHT_GALLERY_SAMPLE.sceneTitle,
  lightingMode: DAYLIGHT_GALLERY_SAMPLE.lightingMode,
  infiniteCorridor: DAYLIGHT_GALLERY_SAMPLE.infiniteCorridor,
  scrollStrength: DAYLIGHT_GALLERY_SAMPLE.scrollStrength,
  sceneBackgroundColor: DAYLIGHT_GALLERY_SAMPLE.sceneBackgroundColor,
  sceneFogColor: DAYLIGHT_GALLERY_SAMPLE.sceneFogColor,
  ceilingSpotsEnabled: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsEnabled,
  ceilingSpotsColor: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsColor,
  ceilingSpotsIntensity: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsIntensity,
  artworkBacklightEnabled: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightEnabled,
  artworkBacklightColor: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightColor,
  artworkBacklightIntensity: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightIntensity,
  loopWhiteAfterEndWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteAfterEndWindow,
  loopWhiteStartsBeforeEndWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteStartsBeforeEndWindow,
  loopWhiteFadeOutRevealWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutRevealWindow,
  loopWhiteFadeOutWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutWindow,
  loopProgressAdvanceDuringWhiteFadeOut: DAYLIGHT_GALLERY_SAMPLE.loopProgressAdvanceDuringWhiteFadeOut,
  artworkFocusFill: DAYLIGHT_GALLERY_SAMPLE.artworkFocusFill,
  artworkTurnSmoothness: DAYLIGHT_GALLERY_SAMPLE.artworkTurnSmoothness,
  artworkTurnKeyframes: DAYLIGHT_GALLERY_SAMPLE.artworkTurnKeyframes,
  artworkTurnLeadIn: DAYLIGHT_GALLERY_SAMPLE.artworkTurnLeadIn,
  cameraFov: DAYLIGHT_GALLERY_SAMPLE.camera.fov,
  cameraStartX: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[0],
  cameraStartY: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[1],
  cameraStartZ: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[2],
  cameraHeight: DAYLIGHT_GALLERY_SAMPLE.camera.height,
  cameraMovementSmoothing: DAYLIGHT_GALLERY_SAMPLE.camera.movementSmoothing,
  cameraNear: DAYLIGHT_GALLERY_SAMPLE.camera.near,
  cameraFar: DAYLIGHT_GALLERY_SAMPLE.camera.far,
  corridorWidth: DAYLIGHT_GALLERY_SAMPLE.corridor.width,
  corridorHeight: DAYLIGHT_GALLERY_SAMPLE.corridor.height,
  corridorSegmentLength: DAYLIGHT_GALLERY_SAMPLE.corridor.segmentLength,
  corridorArtworkSpacing: DAYLIGHT_GALLERY_SAMPLE.corridor.artworkSpacing,
  corridorWallThickness: DAYLIGHT_GALLERY_SAMPLE.corridor.wallThickness,
  corridorArtworkInset: DAYLIGHT_GALLERY_SAMPLE.corridor.artworkInset,
  corridorWallColor: DAYLIGHT_GALLERY_SAMPLE.corridor.wallColor,
  corridorFloorColor: DAYLIGHT_GALLERY_SAMPLE.corridor.floorColor,
  corridorCeilingColor: DAYLIGHT_GALLERY_SAMPLE.corridor.ceilingColor,
  corridorCarpetEnabled: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetEnabled,
  corridorCarpetWidth: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetWidth,
  corridorCarpetColor: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetColor,
  titleFontPreset: 'helvetiker',
  titleFontUrl: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl,
  titleSize: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.size,
  titleDepth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.depth,
  titleMaxWidth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxWidth,
  titleLineHeight: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.lineHeight,
  titleColor: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.color,
  titleDaylightContrastEnabled: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastEnabled,
  titleDaylightContrastColor: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastColor,
  titleDaylightContrastStrength: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastStrength,
  titlePositionX: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[0],
  titlePositionY: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[1],
  titlePositionZ: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[2],
  titleMaxOpacity: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxOpacity,
  titleFadeStartProgress: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeStartProgress,
  titleFadeEndProgress: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeEndProgress,
  timingIntroDuration: DAYLIGHT_GALLERY_SAMPLE.timings.introDuration,
  timingTravelDuration: DAYLIGHT_GALLERY_SAMPLE.timings.travelDuration,
  timingFocusDuration: DAYLIGHT_GALLERY_SAMPLE.timings.focusDuration,
  timingReturnDuration: DAYLIGHT_GALLERY_SAMPLE.timings.returnDuration,
  artworks: DEFAULT_MANUAL_ARTWORKS
} as ScrollixArtGalleryProps

addPropertyControls(ScrollixArtGallery, {
  runtimeScriptUrl: {
    type: ControlType.String,
    title: 'Runtime URL',
    description: 'Runtime: ESM script that registers <scrollix-art-gallery>.',
    defaultValue: DEFAULT_RUNTIME_SCRIPT_URL
  },
  runtimeVersion: {
    type: ControlType.String,
    title: 'Version',
    defaultValue: DEFAULT_RUNTIME_VERSION,
    placeholder: 'auto'
  },
  samplePreset: {
    type: ControlType.Enum,
    title: 'Sample',
    options: Object.keys(SAMPLE_CONFIGS),
    optionTitles: ['DayLight', 'Mistery'],
    defaultValue: 'daylight'
  },
  artworkSource: {
    type: ControlType.Enum,
    title: 'Artworks',
    options: ['sample', 'manual'],
    optionTitles: ['Template + Edit', 'Manual Only'],
    defaultValue: 'sample',
    description:
      'Template + Edit usa el sample como base y permite editar cada obra desde Framer.'
  },
  artworkImageOverrides: {
    type: ControlType.Array,
    title: 'Artwork Images',
    maxCount: 48,
    description:
      'Imagen + texto por indice. Edita aqui upload, titulo, descripcion y side text.',
    control: {
      type: ControlType.Object,
      controls: {
        image: {
          type: ControlType.Image,
          title: 'Image'
        },
        artworkTitle: {
          type: ControlType.String,
          title: 'Title'
        },
        artworkDescription: {
          type: ControlType.String,
          title: 'Description',
          displayTextArea: true
        },
        sideTextEnabled: {
          type: ControlType.Boolean,
          title: 'Side Text',
          defaultValue: false
        },
        sideTextEyebrow: {
          type: ControlType.String,
          title: 'Eyebrow',
          hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled
        },
        sideTextTitle: {
          type: ControlType.String,
          title: 'Text Title',
          hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled
        },
        sideTextDescription: {
          type: ControlType.String,
          title: 'Text Desc',
          displayTextArea: true,
          hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled
        }
      }
    }
  },
  jsonOverrideFile: {
    type: ControlType.File,
    title: 'JSON File',
    allowedFileTypes: ['json']
  },
  customConfigJson: {
    type: ControlType.String,
    title: 'JSON Override',
    displayTextArea: true,
    placeholder: '{"sceneTitle":"Custom"}'
  },
  sceneId: {
    type: ControlType.String,
    title: 'Scene ID',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.id
  },
  sceneTitle: {
    type: ControlType.String,
    title: 'Scene Title',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitle
  },
  lightingMode: {
    type: ControlType.Enum,
    title: 'Lighting',
    options: ['day', 'contrast'],
    optionTitles: ['Day', 'Contrast'],
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.lightingMode
  },
  infiniteCorridor: {
    type: ControlType.Boolean,
    title: 'Infinite',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.infiniteCorridor
  },
  scrollStrength: {
    type: ControlType.Number,
    title: 'Scroll',
    min: 0.25,
    max: 8,
    step: 0.05,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.scrollStrength
  },
  sceneBackgroundColor: {
    type: ControlType.Color,
    title: 'BG Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneBackgroundColor
  },
  sceneFogColor: {
    type: ControlType.Color,
    title: 'Fog Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneFogColor
  },
  ceilingSpotsEnabled: {
    type: ControlType.Boolean,
    title: 'Ceiling Fx',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsEnabled
  },
  ceilingSpotsColor: {
    type: ControlType.Color,
    title: 'Ceiling Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsColor
  },
  ceilingSpotsIntensity: {
    type: ControlType.Number,
    title: 'Ceiling Int.',
    min: 0,
    max: 4,
    step: 0.05,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.ceilingSpotsIntensity
  },
  artworkBacklightEnabled: {
    type: ControlType.Boolean,
    title: 'Backlight',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightEnabled
  },
  artworkBacklightColor: {
    type: ControlType.Color,
    title: 'Back Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightColor
  },
  artworkBacklightIntensity: {
    type: ControlType.Number,
    title: 'Back Int.',
    min: 0,
    max: 4,
    step: 0.05,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkBacklightIntensity
  },
  loopWhiteAfterEndWindow: {
    type: ControlType.Number,
    title: 'White In+',
    min: 0.02,
    max: 0.45,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.loopWhiteAfterEndWindow
  },
  loopWhiteStartsBeforeEndWindow: {
    type: ControlType.Number,
    title: 'White In-',
    min: 0,
    max: 0.45,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.loopWhiteStartsBeforeEndWindow
  },
  loopWhiteFadeOutRevealWindow: {
    type: ControlType.Number,
    title: 'White Reveal',
    min: 0.03,
    max: 0.45,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutRevealWindow
  },
  loopWhiteFadeOutWindow: {
    type: ControlType.Number,
    title: 'White Out',
    min: 0.05,
    max: 0.6,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutWindow
  },
  loopProgressAdvanceDuringWhiteFadeOut: {
    type: ControlType.Number,
    title: 'Loop Advance',
    min: 0,
    max: 0.45,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.loopProgressAdvanceDuringWhiteFadeOut
  },
  artworkFocusFill: {
    type: ControlType.Number,
    title: 'Focus Fill',
    min: 0.35,
    max: 0.95,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkFocusFill
  },
  artworkTurnSmoothness: {
    type: ControlType.Number,
    title: 'Turn Smooth',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkTurnSmoothness
  },
  artworkTurnKeyframes: {
    type: ControlType.Number,
    title: 'Turn Keys',
    min: 1,
    max: 12,
    step: 1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkTurnKeyframes
  },
  artworkTurnLeadIn: {
    type: ControlType.Number,
    title: 'Turn Lead',
    min: 0,
    max: 0.85,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.artworkTurnLeadIn
  },
  cameraFov: {
    type: ControlType.Number,
    title: 'Cam FOV',
    min: 35,
    max: 90,
    step: 1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.fov
  },
  cameraStartX: {
    type: ControlType.Number,
    title: 'Cam X',
    min: -8,
    max: 8,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[0]
  },
  cameraStartY: {
    type: ControlType.Number,
    title: 'Cam Y',
    min: -2,
    max: 8,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[1]
  },
  cameraStartZ: {
    type: ControlType.Number,
    title: 'Cam Z',
    min: -20,
    max: 40,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.startPosition[2]
  },
  cameraHeight: {
    type: ControlType.Number,
    title: 'Eye H',
    min: 0.3,
    max: 4,
    step: 0.05,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.height
  },
  cameraMovementSmoothing: {
    type: ControlType.Number,
    title: 'Move Smooth',
    min: 0.01,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.movementSmoothing
  },
  cameraNear: {
    type: ControlType.Number,
    title: 'Near',
    min: 0.01,
    max: 2,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.near
  },
  cameraFar: {
    type: ControlType.Number,
    title: 'Far',
    min: 50,
    max: 1000,
    step: 10,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.camera.far
  },
  corridorWidth: {
    type: ControlType.Number,
    title: 'Cor Width',
    min: 4,
    max: 20,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.width
  },
  corridorHeight: {
    type: ControlType.Number,
    title: 'Cor Height',
    min: 2.8,
    max: 12,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.height
  },
  corridorSegmentLength: {
    type: ControlType.Number,
    title: 'Cor Seg',
    min: 4,
    max: 30,
    step: 0.5,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.segmentLength
  },
  corridorArtworkSpacing: {
    type: ControlType.Number,
    title: 'Art Space',
    min: 4,
    max: 30,
    step: 0.5,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.artworkSpacing
  },
  corridorWallThickness: {
    type: ControlType.Number,
    title: 'Wall Thick',
    min: 0.05,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.wallThickness
  },
  corridorArtworkInset: {
    type: ControlType.Number,
    title: 'Art Inset',
    min: 0,
    max: 0.5,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.artworkInset
  },
  corridorWallColor: {
    type: ControlType.Color,
    title: 'Wall',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.wallColor
  },
  corridorFloorColor: {
    type: ControlType.Color,
    title: 'Floor',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.floorColor
  },
  corridorCeilingColor: {
    type: ControlType.Color,
    title: 'Ceiling',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.ceilingColor
  },
  corridorCarpetEnabled: {
    type: ControlType.Boolean,
    title: 'Carpet',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetEnabled
  },
  corridorCarpetWidth: {
    type: ControlType.Number,
    title: 'Carpet W',
    min: 0.12,
    max: 8,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetWidth
  },
  corridorCarpetColor: {
    type: ControlType.Color,
    title: 'Carpet C',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetColor
  },
  titleFontPreset: {
    type: ControlType.Enum,
    title: 'Font',
    options: ['helvetiker', 'droidSerif', 'optimer', 'gentilis', 'custom'],
    optionTitles: [
      'Helvetiker',
      'Droid Serif (Times)',
      'Optimer',
      'Gentilis',
      'Custom URL'
    ],
    defaultValue: 'helvetiker'
  },
  titleFontUrl: {
    type: ControlType.String,
    title: 'Custom Font URL',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl,
    hidden: (props: ScrollixArtGalleryProps) => props.titleFontPreset !== 'custom'
  },
  titleSize: {
    type: ControlType.Number,
    title: 'Title Size',
    min: 0.3,
    max: 5,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.size
  },
  titleDepth: {
    type: ControlType.Number,
    title: 'Title Depth',
    min: 0.02,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.depth
  },
  titleMaxWidth: {
    type: ControlType.Number,
    title: 'Title Wrap',
    min: 0.8,
    max: 40,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxWidth
  },
  titleLineHeight: {
    type: ControlType.Number,
    title: 'Title LH',
    min: 0.8,
    max: 2.4,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.lineHeight
  },
  titleColor: {
    type: ControlType.Color,
    title: 'Title Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.color
  },
  titleDaylightContrastEnabled: {
    type: ControlType.Boolean,
    title: 'Title Ctrst',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastEnabled
  },
  titleDaylightContrastColor: {
    type: ControlType.Color,
    title: 'Ctrst Color',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastColor
  },
  titleDaylightContrastStrength: {
    type: ControlType.Number,
    title: 'Ctrst Amt',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastStrength
  },
  titlePositionX: {
    type: ControlType.Number,
    title: 'Title X',
    min: -20,
    max: 20,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[0]
  },
  titlePositionY: {
    type: ControlType.Number,
    title: 'Title Y',
    min: -6,
    max: 12,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[1]
  },
  titlePositionZ: {
    type: ControlType.Number,
    title: 'Title Z',
    min: -20,
    max: 20,
    step: 0.1,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[2]
  },
  titleMaxOpacity: {
    type: ControlType.Number,
    title: 'Title Op.',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxOpacity
  },
  titleFadeStartProgress: {
    type: ControlType.Number,
    title: 'Title Fade In',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeStartProgress
  },
  titleFadeEndProgress: {
    type: ControlType.Number,
    title: 'Title Fade Out',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeEndProgress
  },
  timingIntroDuration: {
    type: ControlType.Number,
    title: 'Intro Dur',
    min: 0.01,
    max: 8,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.introDuration
  },
  timingTravelDuration: {
    type: ControlType.Number,
    title: 'Travel Dur',
    min: 0.01,
    max: 8,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.travelDuration
  },
  timingFocusDuration: {
    type: ControlType.Number,
    title: 'Focus Dur',
    min: 0.01,
    max: 8,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.focusDuration
  },
  timingReturnDuration: {
    type: ControlType.Number,
    title: 'Return Dur',
    min: 0.01,
    max: 8,
    step: 0.01,
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.returnDuration
  },
  artworks: {
    type: ControlType.Array,
    title: 'Artworks',
    maxCount: 48,
    description:
      'Editar contenido y estilo por obra. Las imagenes se suben en Artwork Images.',
    control: {
      type: ControlType.Object,
      controls: {
        id: {
          type: ControlType.String,
          title: 'ID',
          defaultValue: 'art-1'
        },
        title: {
          type: ControlType.String,
          title: 'Title',
          defaultValue: 'Artwork'
        },
        description: {
          type: ControlType.String,
          title: 'Description',
          displayTextArea: true
        },
        fallbackImageUrl: {
          type: ControlType.Image,
          title: 'Fallback'
        },
        side: {
          type: ControlType.Enum,
          title: 'Side',
          options: ['auto', 'left', 'right'],
          optionTitles: ['Auto', 'Left', 'Right'],
          defaultValue: 'auto'
        },
        width: {
          type: ControlType.Number,
          title: 'Width',
          min: 0.8,
          max: 4.2,
          step: 0.01,
          defaultValue: 2.4
        },
        height: {
          type: ControlType.Number,
          title: 'Height',
          min: 0.8,
          max: 3.2,
          step: 0.01,
          defaultValue: 1.6
        },
        frameEnabled: {
          type: ControlType.Boolean,
          title: 'Frame',
          defaultValue: false
        },
        frameColor: {
          type: ControlType.Color,
          title: 'Frame C',
          defaultValue: '#151515'
        },
        frameThickness: {
          type: ControlType.Number,
          title: 'Frame T',
          min: 0.02,
          max: 0.32,
          step: 0.01,
          defaultValue: 0.14
        },
        frameDepth: {
          type: ControlType.Number,
          title: 'Frame D',
          min: 0.01,
          max: 0.2,
          step: 0.01,
          defaultValue: 0.06
        },
        spotlightIntensity: {
          type: ControlType.Number,
          title: 'Spot Int',
          min: 0,
          max: 3,
          step: 0.01,
          defaultValue: 1.15
        },
        sideTextEnabled: {
          type: ControlType.Boolean,
          title: 'Side Text',
          defaultValue: false
        },
        sideTextEyebrow: {
          type: ControlType.String,
          title: 'Eyebrow',
          defaultValue: '',
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextTitle: {
          type: ControlType.String,
          title: 'Text Title',
          defaultValue: '',
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextDescription: {
          type: ControlType.String,
          title: 'Text Desc',
          displayTextArea: true,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextAlign: {
          type: ControlType.Enum,
          title: 'Text Align',
          options: ['before', 'after'],
          optionTitles: ['Before', 'After'],
          defaultValue: 'after',
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextWidth: {
          type: ControlType.Number,
          title: 'Text W',
          min: 0.8,
          max: 3.6,
          step: 0.01,
          defaultValue: 1.55,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextHeight: {
          type: ControlType.Number,
          title: 'Text H',
          min: 0.6,
          max: 2.6,
          step: 0.01,
          defaultValue: 1.1,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextGap: {
          type: ControlType.Number,
          title: 'Text Gap',
          min: 0.08,
          max: 2.2,
          step: 0.01,
          defaultValue: 0.5,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextOffsetY: {
          type: ControlType.Number,
          title: 'Text Y',
          min: -2,
          max: 2,
          step: 0.01,
          defaultValue: 0,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextOffsetZ: {
          type: ControlType.Number,
          title: 'Text Z',
          min: -3,
          max: 3,
          step: 0.01,
          defaultValue: 0,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextBackgroundColor: {
          type: ControlType.Color,
          title: 'Text BG',
          defaultValue: '#0e1422',
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextTextColor: {
          type: ControlType.Color,
          title: 'Text C',
          defaultValue: '#f3f6fb',
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextBorderEnabled: {
          type: ControlType.Boolean,
          title: 'Text Border',
          defaultValue: false,
          hidden: (item: FramerArtworkInput) => !item.sideTextEnabled
        },
        sideTextBorderColor: {
          type: ControlType.Color,
          title: 'Border C',
          defaultValue: '#ff9e4b',
          hidden: (item: FramerArtworkInput) =>
            !item.sideTextEnabled || !item.sideTextBorderEnabled
        },
        sideTextBorderIntensity: {
          type: ControlType.Number,
          title: 'Border I',
          min: 0,
          max: 4,
          step: 0.01,
          defaultValue: 1.2,
          hidden: (item: FramerArtworkInput) =>
            !item.sideTextEnabled || !item.sideTextBorderEnabled
        },
        sideTextBorderWidth: {
          type: ControlType.Number,
          title: 'Border W',
          min: 0.01,
          max: 0.16,
          step: 0.01,
          defaultValue: 0.035,
          hidden: (item: FramerArtworkInput) =>
            !item.sideTextEnabled || !item.sideTextBorderEnabled
        }
      }
    }
  }
})

export default ScrollixArtGallery



