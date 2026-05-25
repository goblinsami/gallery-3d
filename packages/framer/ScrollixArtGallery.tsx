import * as React from 'react'
import { addPropertyControls, ControlType } from 'framer'
import { useScrollixArtGalleryRuntime } from './useScrollixArtGalleryRuntime.ts'
import {
  DAYLIGHT_GALLERY_SAMPLE,
  MISTERY_MUSEUM_SAMPLE,
  SAMPLE_CONFIGS,
  type ArtGallerySceneConfig,
  type ArtworkConfig,
  type ArtworkSide,
  type ArtworkSideTextAlign,
  type DeepPartial,
  type LightingMode,
  type SamplePreset
} from './gallerySamples.ts'

type ArtworkSource = 'sample' | 'manual'
type ArtworkSideControl = 'auto' | ArtworkSide
type FramerImageValue = string | { src?: string; srcSet?: string }

interface FramerArtworkInput {
  id: string
  title: string
  description: string
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

interface ScrollixArtGalleryProps {
  style?: React.CSSProperties
  runtimeScriptUrl: string
  runtimeVersion: string
  samplePreset: SamplePreset
  artworkSource: ArtworkSource
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
const DEFAULT_RUNTIME_SCRIPT_URL = 'https://cdn.scrollix.app/scrollix-art-gallery-runtime.js'
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

const createArtworkInputFromConfig = (artwork: ArtworkConfig, index: number): FramerArtworkInput => ({
  id: artwork.id || `art-${index + 1}`,
  title: artwork.title || `Artwork ${index + 1}`,
  description: artwork.description ?? '',
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
})

const DEFAULT_MANUAL_ARTWORKS: FramerArtworkInput[] = DAYLIGHT_GALLERY_SAMPLE.artworks.map(
  createArtworkInputFromConfig
)

const toArtworkConfig = (artwork: FramerArtworkInput, index: number): ArtworkConfig | null => {
  const normalizedId = artwork.id.trim() || `framer-art-${index + 1}`
  const normalizedTitle = artwork.title.trim()
  const imageUrl = normalizeFramerImageValue(artwork.imageUrl)
  const fallbackImageUrl = normalizeFramerImageValue(artwork.fallbackImageUrl)

  if (!normalizedTitle || !imageUrl) {
    return null
  }

  const side = artwork.side === 'left' || artwork.side === 'right' ? artwork.side : undefined
  const hasSideText =
    artwork.sideTextEnabled &&
    (artwork.sideTextEyebrow.trim() ||
      artwork.sideTextTitle.trim() ||
      artwork.sideTextDescription.trim())

  return {
    id: normalizedId,
    title: normalizedTitle,
    description: artwork.description.trim() || undefined,
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
    sideText: hasSideText
      ? {
          eyebrow: artwork.sideTextEyebrow.trim() || undefined,
          title: artwork.sideTextTitle.trim() || undefined,
          description: artwork.sideTextDescription.trim() || undefined,
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
  }
}

const resolveArtworks = (
  artworkSource: ArtworkSource,
  artworks: FramerArtworkInput[],
  sampleConfig: ArtGallerySceneConfig
) => {
  if (artworkSource === 'sample') {
    return sampleConfig.artworks
  }

  const manual = artworks
    .map((artwork, index) => toArtworkConfig(artwork, index))
    .filter((item): item is ArtworkConfig => Boolean(item))

  return manual.length > 0 ? manual : sampleConfig.artworks
}

const parseCustomConfigJson = (value: string): { parsed: DeepPartial<ArtGallerySceneConfig> | null; error: string | null } => {
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

const buildGalleryConfig = (props: ScrollixArtGalleryProps): BuildConfigResult => {
  const sampleConfig = props.samplePreset === 'mistery' ? MISTERY_MUSEUM_SAMPLE : DAYLIGHT_GALLERY_SAMPLE
  const baseConfig = cloneConfig(sampleConfig)

  const overrideConfig: DeepPartial<ArtGallerySceneConfig> = {
    id: props.sceneId.trim() || baseConfig.id,
    sceneTitle: props.sceneTitle.trim() || baseConfig.sceneTitle,
    lightingMode: props.lightingMode,
    infiniteCorridor: props.infiniteCorridor,
    sceneBackgroundColor: props.sceneBackgroundColor,
    sceneFogColor: props.sceneFogColor,
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
      floorColor: props.corridorFloorColor,
      ceilingColor: props.corridorCeilingColor,
      carpetEnabled: props.corridorCarpetEnabled,
      carpetWidth: props.corridorCarpetWidth,
      carpetColor: props.corridorCarpetColor,
      artworkSpacing: props.corridorArtworkSpacing,
      wallThickness: props.corridorWallThickness,
      artworkInset: props.corridorArtworkInset
    },
    sceneTitleConfig: {
      fontUrl: props.titleFontUrl,
      size: props.titleSize,
      depth: props.titleDepth,
      maxWidth: props.titleMaxWidth,
      lineHeight: props.titleLineHeight,
      color: props.titleColor,
      daylightContrastEnabled: props.titleDaylightContrastEnabled,
      daylightContrastColor: props.titleDaylightContrastColor,
      daylightContrastStrength: props.titleDaylightContrastStrength,
      position: [props.titlePositionX, props.titlePositionY, props.titlePositionZ],
      maxOpacity: props.titleMaxOpacity,
      fadeStartProgress: props.titleFadeStartProgress,
      fadeEndProgress: props.titleFadeEndProgress
    },
    timings: {
      introDuration: props.timingIntroDuration,
      travelDuration: props.timingTravelDuration,
      focusDuration: props.timingFocusDuration,
      returnDuration: props.timingReturnDuration
    },
    artworks: resolveArtworks(props.artworkSource, props.artworks, baseConfig)
  }

  const merged = deepMerge(baseConfig as unknown as Record<string, unknown>, overrideConfig)
  const withOverrides = merged as unknown as ArtGallerySceneConfig

  const parsedOverride = parseCustomConfigJson(props.customConfigJson)
  if (!parsedOverride.parsed) {
    return {
      config: withOverrides,
      parseError: parsedOverride.error
    }
  }

  const finalConfig = deepMerge(withOverrides as unknown as Record<string, unknown>, parsedOverride.parsed)
  return {
    config: finalConfig as unknown as ArtGallerySceneConfig,
    parseError: null
  }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 760
 */
function ScrollixArtGallery(props: ScrollixArtGalleryProps) {
  const autoRuntimeVersion = React.useMemo(() => getAutoRuntimeVersion(), [])
  const resolvedRuntimeScriptUrl = React.useMemo(
    () => resolveRuntimeUrl(props.runtimeScriptUrl, props.runtimeVersion, autoRuntimeVersion),
    [props.runtimeScriptUrl, props.runtimeVersion, autoRuntimeVersion]
  )

  const { ready: runtimeReady, loading: runtimeLoading, error: runtimeLoadError } =
    useScrollixArtGalleryRuntime(resolvedRuntimeScriptUrl, SCROLLIX_ART_GALLERY_TAG)

  const [runtimeInitialized, setRuntimeInitialized] = React.useState(false)
  const [runtimeInitError, setRuntimeInitError] = React.useState<string | null>(null)

  const buildResult = React.useMemo(() => buildGalleryConfig(props), [props])
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
    optionTitles: ['Sample', 'Manual'],
    defaultValue: 'sample'
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
  titleFontUrl: {
    type: ControlType.String,
    title: 'Font URL',
    defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl
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
    maxCount: 24,
    hidden: (props: ScrollixArtGalleryProps) => props.artworkSource !== 'manual',
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
        imageUrl: {
          type: ControlType.Image,
          title: 'Image'
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
          defaultValue: ''
        },
        sideTextTitle: {
          type: ControlType.String,
          title: 'Text Title',
          defaultValue: ''
        },
        sideTextDescription: {
          type: ControlType.String,
          title: 'Text Desc',
          displayTextArea: true
        },
        sideTextAlign: {
          type: ControlType.Enum,
          title: 'Text Align',
          options: ['before', 'after'],
          optionTitles: ['Before', 'After'],
          defaultValue: 'after'
        },
        sideTextWidth: {
          type: ControlType.Number,
          title: 'Text W',
          min: 0.8,
          max: 3.6,
          step: 0.01,
          defaultValue: 1.55
        },
        sideTextHeight: {
          type: ControlType.Number,
          title: 'Text H',
          min: 0.6,
          max: 2.6,
          step: 0.01,
          defaultValue: 1.1
        },
        sideTextGap: {
          type: ControlType.Number,
          title: 'Text Gap',
          min: 0.08,
          max: 2.2,
          step: 0.01,
          defaultValue: 0.5
        },
        sideTextOffsetY: {
          type: ControlType.Number,
          title: 'Text Y',
          min: -2,
          max: 2,
          step: 0.01,
          defaultValue: 0
        },
        sideTextOffsetZ: {
          type: ControlType.Number,
          title: 'Text Z',
          min: -3,
          max: 3,
          step: 0.01,
          defaultValue: 0
        },
        sideTextBackgroundColor: {
          type: ControlType.Color,
          title: 'Text BG',
          defaultValue: '#0e1422'
        },
        sideTextTextColor: {
          type: ControlType.Color,
          title: 'Text C',
          defaultValue: '#f3f6fb'
        },
        sideTextBorderEnabled: {
          type: ControlType.Boolean,
          title: 'Text Border',
          defaultValue: false
        },
        sideTextBorderColor: {
          type: ControlType.Color,
          title: 'Border C',
          defaultValue: '#ff9e4b'
        },
        sideTextBorderIntensity: {
          type: ControlType.Number,
          title: 'Border I',
          min: 0,
          max: 4,
          step: 0.01,
          defaultValue: 1.2
        },
        sideTextBorderWidth: {
          type: ControlType.Number,
          title: 'Border W',
          min: 0.01,
          max: 0.16,
          step: 0.01,
          defaultValue: 0.035
        }
      }
    }
  }
})

export default ScrollixArtGallery
