import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type LightingMode = "contrast" | "day"
type ArtworkSide = "left" | "right"
type Vec3 = [number, number, number]
type TitleFontPreset =
    | "helvetiker"
    | "droidSerif"
    | "optimer"
    | "gentilis"
    | "custom"
type ArtworkImageSourceMode = "upload" | "url" | "runtimePath" | "sample"
type RuntimeChannel = "stable" | "beta"
type RuntimeSourceMode = "manifest" | "legacyUrl"
type CameraAspectPreset =
    | "auto"
    | "ratio_3_4"
    | "ratio_1_1"
    | "ratio_4_3"
    | "ratio_16_9"

interface ArtworkMetadata {
    artist?: string
    year?: string
    medium?: string
    tags?: string[]
}

type ArtworkSideTextAlign = "before" | "after"

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
    targetAspectRatio?: number
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
    id: "daylight-galery",
    sceneTitle: "DayLight galery",
    lightingMode: "day",
    infiniteCorridor: true,
    sceneBackgroundColor: "#e6ebf3",
    sceneFogColor: "#e7ecf3",
    ceilingSpotsEnabled: false,
    ceilingSpotsColor: "#91ff00",
    ceilingSpotsIntensity: 0.9,
    artworkBacklightEnabled: false,
    artworkBacklightColor: "#ffb36b",
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
        far: 400,
    },
    corridor: {
        width: 8,
        height: 4.2,
        segmentLength: 12,
        wallColor: "#d8d9dd",
        floorColor: "#656b74",
        ceilingColor: "#eceff4",
        carpetEnabled: true,
        carpetWidth: 0.72,
        carpetColor: "#8f1319",
        artworkSpacing: 14,
        wallThickness: 0.24,
        artworkInset: 0.02,
    },
    sceneTitleConfig: {
        fontUrl: "/fonts/helvetiker_regular.typeface.json",
        size: 0.1,
        depth: 0.3,
        maxWidth: 7.2,
        lineHeight: 1.18,
        color: "#ffffff",
        daylightContrastEnabled: true,
        daylightContrastColor: "#c6c6c6",
        daylightContrastStrength: 0.3,
        position: [0, 1.75, 3.25],
        maxOpacity: 1,
        fadeStartProgress: 0.1,
        fadeEndProgress: 0.22,
    },
    timings: {
        introDuration: 1.1,
        travelDuration: 1,
        focusDuration: 0.9,
        returnDuration: 0.75,
    },
    artworks: [
        {
            id: "w-01",
            title: "Echoes of Atrium",
            description: "A suspended fragment of stillness.",
            imageUrl: "/images/work1.jpg",
            sideText: {
                eyebrow: "Gallery Note",
                title: "Echoes of Atrium",
                description:
                    "A suspended fragment of stillness in atmospheric low-contrast tones.",
            },
            metadata: {
                artist: "A. Mercer",
                year: "2026",
                medium: "Archival Pigment",
            },
        },
        {
            id: "w-02",
            title: "Soft Geometry",
            description: "Planes, silence, and reflected light.",
            imageUrl: "/images/work2.jpg",
            sideText: {
                eyebrow: "Collection",
                title: "Soft Geometry",
                description:
                    "Planes, silence and reflected light arranged in a restrained composition.",
                align: "before",
            },
            metadata: {
                artist: "I. Rowan",
                year: "2025",
                medium: "Digital C-Print",
            },
        },
        {
            id: "w-03",
            title: "Threshold #4",
            description: "A corridor inside another corridor.",
            imageUrl: "/images/work3.jpg",
            metadata: {
                artist: "Noa Lane",
                year: "2026",
                medium: "Mixed Media",
            },
        },
        {
            id: "w-04",
            title: "Monochrome Drift",
            description: "A cloud-like structure in muted tones.",
            imageUrl: "/images/work4.jpg",
            metadata: {
                artist: "R. Chen",
                year: "2024",
                medium: "Photography",
            },
        },
    ],
}

const MISTERY_MUSEUM_SAMPLE: ArtGallerySceneConfig = {
    ...DAYLIGHT_GALLERY_SAMPLE,
    id: "mistery-museum",
    sceneTitle: "Mistery Museum",
    lightingMode: "contrast",
    infiniteCorridor: true,
    sceneBackgroundColor: "#000000",
    sceneFogColor: "#050505",
    ceilingSpotsEnabled: true,
    ceilingSpotsColor: "#ff9a3d",
    ceilingSpotsIntensity: 4,
    artworkBacklightEnabled: true,
    artworkBacklightColor: "#ff7a1f",
    artworkBacklightIntensity: 4,
    loopWhiteAfterEndWindow: 0.08,
    loopWhiteStartsBeforeEndWindow: 0.07,
    loopWhiteFadeOutRevealWindow: 0.12,
    loopWhiteFadeOutWindow: 0.24,
    loopProgressAdvanceDuringWhiteFadeOut: 0.22,
    corridor: {
        ...DAYLIGHT_GALLERY_SAMPLE.corridor,
        wallColor: "#2b2723",
        floorColor: "#1f1a16",
        ceilingColor: "#211d1a",
        carpetColor: "#af141b",
        carpetWidth: 0.68,
        artworkSpacing: 12,
    },
    sceneTitleConfig: {
        ...DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig,
        color: "#d8e3f8",
    },
    artworks: DAYLIGHT_GALLERY_SAMPLE.artworks.map((artwork, index) => ({
        ...artwork,
        id: `m-${index + 1}`,
        side: index % 2 === 0 ? "right" : "left",
        frameColor: "#242b37",
        spotlightIntensity: 1.35,
        sideText: artwork.sideText
            ? {
                  ...artwork.sideText,
                  borderEnabled: true,
                  borderColor: "#ff8d36",
                  borderIntensity: 2.2,
                  borderWidth: 0.04,
              }
            : artwork.sideText,
    })),
}

const CABARET_GALLERY_SAMPLE: ArtGallerySceneConfig = {
    ...DAYLIGHT_GALLERY_SAMPLE,
    id: "cabaret-nocturno",
    sceneTitle: "Cabaret Nocturno",
    lightingMode: "contrast",
    infiniteCorridor: true,
    sceneBackgroundColor: "#18060f",
    sceneFogColor: "#2f0f1d",
    ceilingSpotsEnabled: true,
    ceilingSpotsColor: "#ff4f9b",
    ceilingSpotsIntensity: 3.2,
    artworkBacklightEnabled: true,
    artworkBacklightColor: "#ffbb4d",
    artworkBacklightIntensity: 2.6,
    loopWhiteAfterEndWindow: 0.09,
    loopWhiteStartsBeforeEndWindow: 0.06,
    loopWhiteFadeOutRevealWindow: 0.12,
    loopWhiteFadeOutWindow: 0.22,
    loopProgressAdvanceDuringWhiteFadeOut: 0.2,
    corridor: {
        ...DAYLIGHT_GALLERY_SAMPLE.corridor,
        wallColor: "#3f1328",
        floorColor: "#2a101b",
        ceilingColor: "#24111a",
        carpetEnabled: true,
        carpetColor: "#d10f58",
        carpetWidth: 1.2,
        artworkSpacing: 11,
    },
    sceneTitleConfig: {
        ...DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig,
        color: "#ffe8f3",
        daylightContrastEnabled: false,
        daylightContrastColor: "#5f1f3b",
        daylightContrastStrength: 0.5,
        position: [0, 1.85, 3.15],
    },
    artworks: DAYLIGHT_GALLERY_SAMPLE.artworks.map((artwork, index) => ({
        ...artwork,
        id: `c-${index + 1}`,
        side: index % 2 === 0 ? "left" : "right",
        frameEnabled: true,
        frameColor: "#6e1b40",
        spotlightIntensity: 1.55,
        sideText: artwork.sideText
            ? {
                  ...artwork.sideText,
                  backgroundColor: "#170810",
                  textColor: "#ffdbe9",
                  borderEnabled: true,
                  borderColor: "#ff6aa8",
                  borderIntensity: 2.5,
                  borderWidth: 0.05,
              }
            : artwork.sideText,
    })),
}

const NAVE_NODRIZA_SAMPLE: ArtGallerySceneConfig = {
    ...DAYLIGHT_GALLERY_SAMPLE,
    id: "nave-nodriza",
    sceneTitle: "Nave Nodriza",
    lightingMode: "contrast",
    infiniteCorridor: true,
    sceneBackgroundColor: "#040a14",
    sceneFogColor: "#0a2136",
    ceilingSpotsEnabled: true,
    ceilingSpotsColor: "#66efff",
    ceilingSpotsIntensity: 4.1,
    artworkBacklightEnabled: true,
    artworkBacklightColor: "#4fb4ff",
    artworkBacklightIntensity: 3.2,
    loopWhiteAfterEndWindow: 0.07,
    loopWhiteStartsBeforeEndWindow: 0.08,
    loopWhiteFadeOutRevealWindow: 0.14,
    loopWhiteFadeOutWindow: 0.26,
    loopProgressAdvanceDuringWhiteFadeOut: 0.23,
    corridor: {
        ...DAYLIGHT_GALLERY_SAMPLE.corridor,
        wallColor: "#12314a",
        floorColor: "#0d1d2f",
        ceilingColor: "#1b3a58",
        carpetEnabled: true,
        carpetColor: "#00e5a8",
        carpetWidth: 0.56,
        artworkSpacing: 16,
    },
    sceneTitleConfig: {
        ...DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig,
        color: "#d7f7ff",
        daylightContrastEnabled: true,
        daylightContrastColor: "#144060",
        daylightContrastStrength: 0.65,
        position: [0, 1.82, 3.05],
    },
    artworks: DAYLIGHT_GALLERY_SAMPLE.artworks.map((artwork, index) => ({
        ...artwork,
        id: `n-${index + 1}`,
        side: index % 2 === 0 ? "right" : "left",
        frameEnabled: true,
        frameColor: "#1f5f83",
        spotlightIntensity: 1.65,
        sideText: artwork.sideText
            ? {
                  ...artwork.sideText,
                  backgroundColor: "#081a2b",
                  textColor: "#dff9ff",
                  borderEnabled: true,
                  borderColor: "#55dbff",
                  borderIntensity: 2.8,
                  borderWidth: 0.05,
              }
            : artwork.sideText,
    })),
}

const SAMPLE_CONFIGS = {
    daylight: DAYLIGHT_GALLERY_SAMPLE,
    mistery: MISTERY_MUSEUM_SAMPLE,
    cabaret: CABARET_GALLERY_SAMPLE,
    naveNodriza: NAVE_NODRIZA_SAMPLE,
} as const

type SamplePreset = keyof typeof SAMPLE_CONFIGS
type SampleConfigMap = Record<SamplePreset, ArtGallerySceneConfig>

const TITLE_FONT_PRESET_URLS: Record<
    Exclude<TitleFontPreset, "custom">,
    string
> = {
    helvetiker: "/fonts/helvetiker_regular.typeface.json",
    droidSerif: "/fonts/droid_serif_regular.typeface.json",
    optimer: "/fonts/optimer_regular.typeface.json",
    gentilis: "/fonts/gentilis_regular.typeface.json",
}

const resolveTitleFontUrl = (
    preset: TitleFontPreset,
    customUrl: string
): string => {
    if (preset === "custom") {
        const trimmed = customUrl.trim()
        return trimmed || TITLE_FONT_PRESET_URLS.helvetiker
    }
    return TITLE_FONT_PRESET_URLS[preset]
}

const resolveCameraAspectRatio = (
    preset: CameraAspectPreset
): number | undefined => {
    switch (preset) {
        case "ratio_3_4":
            return 3 / 4
        case "ratio_1_1":
            return 1
        case "ratio_4_3":
            return 4 / 3
        case "ratio_16_9":
            return 16 / 9
        default:
            return undefined
    }
}

const TEMPLATE_PATHS: Record<SamplePreset, string> = {
    daylight: "./templates/daylight-gallery.json",
    mistery: "./templates/mistery-museum.json",
    cabaret: "./templates/cabaret-nocturno.json",
    naveNodriza: "./templates/nave-nodriza.json",
}

const isValidSceneConfig = (value: unknown): value is ArtGallerySceneConfig => {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false
    const candidate = value as Partial<ArtGallerySceneConfig>
    return (
        typeof candidate.id === "string" &&
        typeof candidate.sceneTitle === "string" &&
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
        const response = await fetch(templateUrl, { cache: "no-store" })
        if (!response.ok) {
            return fallback
        }

        const parsed = (await response.json()) as unknown
        return isValidSceneConfig(parsed) ? parsed : fallback
    } catch (_error) {
        return fallback
    }
}

const loadTemplateConfigs = async (
    fallbackConfigs: SampleConfigMap
): Promise<SampleConfigMap> => {
    const [daylight, mistery, cabaret, naveNodriza] = await Promise.all([
        loadTemplateConfigFromPath("daylight", fallbackConfigs.daylight),
        loadTemplateConfigFromPath("mistery", fallbackConfigs.mistery),
        loadTemplateConfigFromPath("cabaret", fallbackConfigs.cabaret),
        loadTemplateConfigFromPath("naveNodriza", fallbackConfigs.naveNodriza),
    ])

    return {
        daylight,
        mistery,
        cabaret,
        naveNodriza,
    }
}

const cloneSampleConfigs = (): SampleConfigMap => ({
    daylight: cloneConfig(SAMPLE_CONFIGS.daylight),
    mistery: cloneConfig(SAMPLE_CONFIGS.mistery),
    cabaret: cloneConfig(SAMPLE_CONFIGS.cabaret),
    naveNodriza: cloneConfig(SAMPLE_CONFIGS.naveNodriza),
})

const RUNTIME_SCRIPT_ATTR = "data-scrollix-runtime-url"
const DEFAULT_REGISTRATION_TIMEOUT_MS = 7000

interface RuntimeHookState {
    ready: boolean
    loading: boolean
    error: string | null
}

const runtimeScriptPromiseByUrl = new Map<string, Promise<void>>()
const getBrowserHref = (): string =>
    typeof window === "undefined" ? DEFAULT_RUNTIME_ORIGIN : window.location.href

const normalizeRuntimeUrlForCompare = (runtimeUrl: string): string => {
    try {
        return new URL(runtimeUrl, getBrowserHref()).href
    } catch (_error) {
        return runtimeUrl.trim()
    }
}

const getRuntimeUrlRegistryByTag = (): Record<string, string> => {
    if (typeof window === "undefined") {
        return {}
    }
    if (!window.__SCROLLIX_RUNTIME_TAG_RUNTIME_URLS__) {
        window.__SCROLLIX_RUNTIME_TAG_RUNTIME_URLS__ = {}
    }
    return window.__SCROLLIX_RUNTIME_TAG_RUNTIME_URLS__
}

const createRuntimeConflictError = (
    tagName: string,
    activeRuntimeUrl: string,
    requestedRuntimeUrl: string
) =>
    new Error(
        `[Scrollix] ${tagName} is already registered with a different runtime URL.\n` +
            `Active: ${activeRuntimeUrl}\n` +
            `Requested: ${requestedRuntimeUrl}\n` +
            `Use one runtime version per page (or switch Runtime Mode to manifest and keep one shared channel/version).`
    )

const getRuntimeScriptElement = (runtimeUrl: string) => {
    const normalizedRuntimeUrl = normalizeRuntimeUrlForCompare(runtimeUrl)
    const scripts = Array.from(document.querySelectorAll("script"))

    return scripts.find((script) => {
        if (!(script instanceof HTMLScriptElement)) return false
        const taggedUrl = script.getAttribute(RUNTIME_SCRIPT_ATTR)
        if (taggedUrl === runtimeUrl) return true
        if (!script.src) return false

        try {
            return (
                new URL(script.src, getBrowserHref()).href ===
                normalizedRuntimeUrl
            )
        } catch (_error) {
            return false
        }
    }) as HTMLScriptElement | undefined
}

const waitForScriptLoad = (script: HTMLScriptElement, runtimeUrl: string) =>
    new Promise<void>((resolve, reject) => {
        if (script.getAttribute("data-scrollix-loaded") === "true") {
            resolve()
            return
        }

        const readyState = (
            script as HTMLScriptElement & { readyState?: string }
        ).readyState
        if (readyState === "loaded" || readyState === "complete") {
            script.setAttribute("data-scrollix-loaded", "true")
            resolve()
            return
        }

        const handleLoad = () => {
            script.setAttribute("data-scrollix-loaded", "true")
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

        script.addEventListener("load", handleLoad, { once: true })
        script.addEventListener("error", handleError, { once: true })
    })

const waitForRegistration = async (tagName: string, timeoutMs: number) => {
    if (window.customElements.get(tagName)) return

    await Promise.race([
        window.customElements.whenDefined(tagName),
        new Promise((_, reject) => {
            window.setTimeout(() => {
                reject(
                    new Error(
                        `[Scrollix] Timed out waiting for ${tagName} registration.`
                    )
                )
            }, timeoutMs)
        }),
    ])

    if (!window.customElements.get(tagName)) {
        throw new Error(
            `[Scrollix] ${tagName} is still not registered after module load.`
        )
    }
}

const loadRuntimeModule = async (runtimeUrl: string, tagName: string) => {
    const trimmedRuntimeUrl = runtimeUrl.trim()
    if (!trimmedRuntimeUrl) return

    const requestedRuntimeUrl = normalizeRuntimeUrlForCompare(trimmedRuntimeUrl)
    const runtimeUrlsByTag = getRuntimeUrlRegistryByTag()
    const existingRuntimeUrl = runtimeUrlsByTag[tagName]
    if (existingRuntimeUrl && existingRuntimeUrl !== requestedRuntimeUrl) {
        throw createRuntimeConflictError(
            tagName,
            existingRuntimeUrl,
            requestedRuntimeUrl
        )
    }

    if (window.customElements.get(tagName)) {
        if (!runtimeUrlsByTag[tagName]) {
            const loadedRuntimeScript = document.querySelector(
                `script[${RUNTIME_SCRIPT_ATTR}][data-scrollix-loaded="true"]`
            )
            if (loadedRuntimeScript instanceof HTMLScriptElement) {
                const taggedUrl = loadedRuntimeScript.getAttribute(
                    RUNTIME_SCRIPT_ATTR
                )
                runtimeUrlsByTag[tagName] = normalizeRuntimeUrlForCompare(
                    taggedUrl || loadedRuntimeScript.src
                )
            }
        }

        runtimeUrlsByTag[tagName] = runtimeUrlsByTag[tagName] ?? requestedRuntimeUrl
        if (runtimeUrlsByTag[tagName] !== requestedRuntimeUrl) {
            throw createRuntimeConflictError(
                tagName,
                runtimeUrlsByTag[tagName],
                requestedRuntimeUrl
            )
        }
        return
    }

    const key = `${requestedRuntimeUrl}::${tagName}`
    const existingPromise = runtimeScriptPromiseByUrl.get(key)
    if (existingPromise) {
        await existingPromise
        await waitForRegistration(tagName, DEFAULT_REGISTRATION_TIMEOUT_MS)
        return
    }

    const pendingLoad = (async () => {
        const existingScript = getRuntimeScriptElement(requestedRuntimeUrl)

        if (existingScript) {
            await waitForScriptLoad(existingScript, requestedRuntimeUrl)
        } else {
            const script = document.createElement("script")
            script.type = "module"
            script.async = true
            script.src = requestedRuntimeUrl
            script.setAttribute(RUNTIME_SCRIPT_ATTR, requestedRuntimeUrl)

            const loadPromise = waitForScriptLoad(script, requestedRuntimeUrl)
            document.head.appendChild(script)
            await loadPromise
        }

        await waitForRegistration(tagName, DEFAULT_REGISTRATION_TIMEOUT_MS)
        runtimeUrlsByTag[tagName] = requestedRuntimeUrl
    })()

    runtimeScriptPromiseByUrl.set(key, pendingLoad)

    try {
        await pendingLoad
    } finally {
        runtimeScriptPromiseByUrl.delete(key)
    }
}

const useScrollixArtGalleryRuntime = (
    runtimeLocatorOptions: RuntimeLocatorOptions,
    tagName: string
): RuntimeHookState => {
    const [state, setState] = React.useState<RuntimeHookState>({
        ready: false,
        loading: false,
        error: null,
    })

    React.useEffect(() => {
        let cancelled = false

        setState({ ready: false, loading: true, error: null })

        const loadRuntime = async () => {
            const resolvedRuntimeUrl = await resolveRuntimeScriptUrl(
                runtimeLocatorOptions
            )
            if (!resolvedRuntimeUrl.trim()) {
                throw new Error(
                    "[Scrollix] runtime script URL could not be resolved."
                )
            }
            await loadRuntimeModule(resolvedRuntimeUrl, tagName)
        }

        void loadRuntime()
            .then(() => {
                if (cancelled) return
                setState({ ready: true, loading: false, error: null })
            })
            .catch((error) => {
                if (cancelled) return
                setState({
                    ready: false,
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "[Scrollix] runtime load failed.",
                })
            })

        return () => {
            cancelled = true
        }
    }, [
        runtimeLocatorOptions.runtimeSourceMode,
        runtimeLocatorOptions.runtimeBaseUrl,
        runtimeLocatorOptions.runtimeManifestUrl,
        runtimeLocatorOptions.runtimeChannel,
        runtimeLocatorOptions.runtimePinnedVersion,
        runtimeLocatorOptions.runtimeScriptUrl,
        runtimeLocatorOptions.runtimeVersion,
        runtimeLocatorOptions.runtimeCacheKey,
        tagName,
    ])

    return state
}

type ArtworkSource = "sample" | "manual"
type ArtworkSideControl = "auto" | ArtworkSide
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
    runtimeSourceMode: RuntimeSourceMode
    runtimeBaseUrl: string
    runtimeManifestUrl: string
    runtimeChannel: RuntimeChannel
    runtimePinnedVersion: string
    // Legacy direct JS URL override.
    runtimeScriptUrl: string
    // Legacy cache-busting controls (only applied when runtimeScriptUrl is used).
    runtimeVersion: string
    runtimeCacheKey: string
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
    cameraAspectPreset: CameraAspectPreset
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
        __SCROLLIX_RUNTIME_TAG_RUNTIME_URLS__?: Record<string, string>
    }

    namespace JSX {
        interface ScrollixArtGalleryIntrinsicProps
            extends React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > {
            "config-json"?: string
        }

        interface IntrinsicElements {
            "scrollix-art-gallery": ScrollixArtGalleryIntrinsicProps
        }
    }
}

const SCROLLIX_ART_GALLERY_TAG = "scrollix-art-gallery"
const DEFAULT_RUNTIME_ORIGIN = "https://celadon-lily-f8f07b.netlify.app"
const DEFAULT_RUNTIME_BASE_URL = `${DEFAULT_RUNTIME_ORIGIN}/runtime`
const DEFAULT_RUNTIME_MANIFEST_FILE = "latest.json"
const DEFAULT_RUNTIME_CHANNEL: RuntimeChannel = "stable"
const DEFAULT_RUNTIME_VERSION = "auto"
const RUNTIME_VERSION_AUTO = "auto"

const runtimePlaceholderStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: "220px",
    display: "grid",
    placeItems: "center",
    padding: "12px",
    background: "#060914",
    color: "#e7eeff",
    fontSize: "12px",
    lineHeight: 1.4,
    textAlign: "center",
}

const normalizeFramerImageValue = (
    image: FramerImageValue | undefined
): string | undefined => {
    if (typeof image === "string") {
        const trimmed = image.trim()
        return trimmed.length > 0 ? trimmed : undefined
    }
    if (image && typeof image === "object" && typeof image.src === "string") {
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
    if (typeof override === "string") {
        return {
            imageUrl: normalizeFramerImageValue(override),
        }
    }

    if (!override || typeof override !== "object") {
        return {}
    }

    // Legacy array format: item is directly a Framer image object { src, srcSet }.
    if ("src" in override || "srcSet" in override) {
        return {
            imageUrl: normalizeFramerImageValue(override as FramerImageValue),
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
        artworkTitle:
            artworkTitle && artworkTitle.length > 0 ? artworkTitle : undefined,
        artworkDescription:
            artworkDescription && artworkDescription.length > 0
                ? artworkDescription
                : undefined,
        sideTextEnabled:
            typeof objectOverride.sideTextEnabled === "boolean"
                ? objectOverride.sideTextEnabled
                : undefined,
        sideTextEyebrow:
            sideTextEyebrow && sideTextEyebrow.length > 0
                ? sideTextEyebrow
                : undefined,
        sideTextTitle:
            sideTextTitle && sideTextTitle.length > 0
                ? sideTextTitle
                : undefined,
        sideTextDescription:
            sideTextDescription && sideTextDescription.length > 0
                ? sideTextDescription
                : undefined,
    }
}

const getArtworkImageOverrideSignature = (
    overrides: ArtworkImageOverrideValue[]
): string =>
    JSON.stringify(
        overrides.map((item) => {
            const normalized = normalizeArtworkImageOverride(item)
            return {
                imageUrl: normalized.imageUrl ?? "",
                artworkTitle: normalized.artworkTitle ?? "",
                artworkDescription: normalized.artworkDescription ?? "",
                sideTextEnabled:
                    typeof normalized.sideTextEnabled === "boolean"
                        ? normalized.sideTextEnabled
                        : null,
                sideTextEyebrow: normalized.sideTextEyebrow ?? "",
                sideTextTitle: normalized.sideTextTitle ?? "",
                sideTextDescription: normalized.sideTextDescription ?? "",
            }
        })
    )

const normalizeExternalUrl = (
    value: string | undefined
): string | undefined => {
    const trimmed = value?.trim() ?? ""
    return trimmed.length > 0 ? trimmed : undefined
}

const normalizeRuntimePath = (
    value: string | undefined
): string | undefined => {
    const trimmed = value?.trim() ?? ""
    if (!trimmed) return undefined
    if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith("//")) {
        return trimmed
    }
    if (trimmed.startsWith("/")) {
        return trimmed
    }
    return `/images/${trimmed.replace(/^\.?\//, "")}`
}

const extractFramerColorString = (value: unknown): string | null => {
    if (typeof value === "string") {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
    }

    if (!value || typeof value !== "object") {
        return null
    }

    const tokenCandidate = value as Record<string, unknown>
    const tokenValue = tokenCandidate.value
    if (typeof tokenValue === "string") {
        const trimmed = tokenValue.trim()
        if (trimmed.length > 0) return trimmed
    }

    const lightValue = tokenCandidate.light
    if (typeof lightValue === "string") {
        const trimmed = lightValue.trim()
        if (trimmed.length > 0) return trimmed
    }

    const darkValue = tokenCandidate.dark
    if (typeof darkValue === "string") {
        const trimmed = darkValue.trim()
        if (trimmed.length > 0) return trimmed
    }

    return null
}

const resolveFramerColor = (fallback: string, ...candidates: unknown[]): string => {
    for (const candidate of candidates) {
        const resolved = extractFramerColorString(candidate)
        if (resolved) return resolved
    }
    return fallback
}

interface ParsedColorRgba {
    r: number
    g: number
    b: number
    a: number
}

const clampColorByte = (value: number): number =>
    Math.max(0, Math.min(255, Math.round(value)))

const clampUnit = (value: number): number =>
    Math.max(0, Math.min(1, value))

const parseColorComponent = (value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (trimmed.endsWith("%")) {
        const parsedPercent = Number.parseFloat(trimmed.slice(0, -1))
        if (!Number.isFinite(parsedPercent)) return null
        return clampColorByte((parsedPercent / 100) * 255)
    }

    const parsed = Number.parseFloat(trimmed)
    if (!Number.isFinite(parsed)) return null
    return clampColorByte(parsed)
}

const parseAlphaComponent = (value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (trimmed.endsWith("%")) {
        const parsedPercent = Number.parseFloat(trimmed.slice(0, -1))
        if (!Number.isFinite(parsedPercent)) return null
        return clampUnit(parsedPercent / 100)
    }

    const parsed = Number.parseFloat(trimmed)
    if (!Number.isFinite(parsed)) return null
    return clampUnit(parsed)
}

const parseHexColor = (value: string): ParsedColorRgba | null => {
    const normalized = value.trim().toLowerCase()
    if (!normalized.startsWith("#")) return null

    const hex = normalized.slice(1)
    if (![3, 4, 6, 8].includes(hex.length)) return null
    if (!/^[0-9a-f]+$/i.test(hex)) return null

    const expandNibble = (char: string): number =>
        Number.parseInt(char + char, 16)

    if (hex.length === 3) {
        return {
            r: expandNibble(hex[0]),
            g: expandNibble(hex[1]),
            b: expandNibble(hex[2]),
            a: 1,
        }
    }

    if (hex.length === 4) {
        return {
            r: expandNibble(hex[0]),
            g: expandNibble(hex[1]),
            b: expandNibble(hex[2]),
            a: clampUnit(expandNibble(hex[3]) / 255),
        }
    }

    if (hex.length === 6) {
        return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
            a: 1,
        }
    }

    return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: clampUnit(Number.parseInt(hex.slice(6, 8), 16) / 255),
    }
}

const parseRgbColor = (value: string): ParsedColorRgba | null => {
    const normalized = value.trim().toLowerCase()
    const match = normalized.match(/^rgba?\((.+)\)$/i)
    if (!match) return null

    const inside = match[1].trim()
    if (!inside) return null

    const [rgbSegment, alphaSegment] = inside.includes("/")
        ? inside.split("/")
        : [inside, ""]

    const parts = rgbSegment.includes(",")
        ? rgbSegment.split(",")
        : rgbSegment.trim().split(/\s+/)
    if (parts.length < 3) return null

    const red = parseColorComponent(parts[0])
    const green = parseColorComponent(parts[1])
    const blue = parseColorComponent(parts[2])
    if (red === null || green === null || blue === null) return null

    let alpha = 1
    if (alphaSegment.trim()) {
        const parsedAlpha = parseAlphaComponent(alphaSegment)
        if (parsedAlpha === null) return null
        alpha = parsedAlpha
    } else if (parts.length >= 4) {
        const parsedAlpha = parseAlphaComponent(parts[3])
        if (parsedAlpha === null) return null
        alpha = parsedAlpha
    }

    return {
        r: red,
        g: green,
        b: blue,
        a: alpha,
    }
}

const normalizeColorForComparison = (value: string): string => {
    const parsed =
        parseHexColor(value) ??
        parseRgbColor(value)

    if (!parsed) {
        return value.trim().toLowerCase()
    }

    return `${parsed.r},${parsed.g},${parsed.b},${parsed.a.toFixed(3)}`
}

const areColorValuesEqual = (left: string, right: string): boolean =>
    normalizeColorForComparison(left) === normalizeColorForComparison(right)

const cloneConfig = (config: ArtGallerySceneConfig): ArtGallerySceneConfig =>
    JSON.parse(JSON.stringify(config)) as ArtGallerySceneConfig

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value)

const deepMerge = <T extends Record<string, unknown>>(
    base: T,
    override: unknown
): T => {
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

interface RuntimeReleaseManifestVersionEntry {
    script?: string
}

interface RuntimeReleaseManifest {
    schemaVersion?: number
    updatedAt?: string
    defaultChannel?: string
    channels?: Record<string, string>
    versions?: Record<string, RuntimeReleaseManifestVersionEntry>
    version?: string
    script?: string
}

interface RuntimeLocatorOptions {
    runtimeSourceMode: RuntimeSourceMode
    runtimeBaseUrl: string
    runtimeManifestUrl: string
    runtimeChannel: RuntimeChannel
    runtimePinnedVersion: string
    runtimeScriptUrl: string
    runtimeVersion: string
    runtimeCacheKey: string
}

const runtimeManifestPromiseByUrl = new Map<
    string,
    Promise<RuntimeReleaseManifest>
>()

const runtimeManifestDataByUrl = new Map<string, RuntimeReleaseManifest>()

const toRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null

const normalizeRuntimeBaseUrl = (runtimeBaseUrl: string): string => {
    const trimmed = runtimeBaseUrl.trim()
    if (!trimmed) return ""

    const withoutTrailingSlashes = trimmed.replace(/\/+$/, "")
    if (!withoutTrailingSlashes) return ""
    return withoutTrailingSlashes
}

const appendLegacyRuntimeQueryParams = (
    runtimeScriptUrl: string,
    runtimeVersion: string,
    runtimeCacheKey: string
): string => {
    const trimmedUrl = runtimeScriptUrl.trim()
    if (!trimmedUrl) return ""

    const trimmedVersion = runtimeVersion.trim()
    const trimmedCacheKey = runtimeCacheKey.trim()
    const queryParts: string[] = []

    if (
        trimmedVersion &&
        trimmedVersion.toLowerCase() !== RUNTIME_VERSION_AUTO
    ) {
        queryParts.push(`v=${encodeURIComponent(trimmedVersion)}`)
    }
    if (trimmedCacheKey) {
        queryParts.push(`cb=${encodeURIComponent(trimmedCacheKey)}`)
    }
    if (queryParts.length === 0) return trimmedUrl

    try {
        const url = new URL(trimmedUrl, getBrowserHref())
        for (const part of queryParts) {
            const [key, value] = part.split("=")
            url.searchParams.set(key, value ?? "")
        }
        return url.toString()
    } catch (_error) {
        const separator = trimmedUrl.includes("?") ? "&" : "?"
        return `${trimmedUrl}${separator}${queryParts.join("&")}`
    }
}

const toAbsoluteUrl = (value: string, baseUrl: string): string => {
    try {
        return new URL(value, baseUrl).toString()
    } catch (_error) {
        return value
    }
}

const resolveRuntimeManifestUrl = (
    runtimeBaseUrl: string,
    runtimeManifestUrl: string
): string => {
    const trimmedManifestUrl = runtimeManifestUrl.trim()
    if (trimmedManifestUrl) {
        const fallbackBase =
            typeof window === "undefined"
                ? DEFAULT_RUNTIME_ORIGIN
                : window.location.href
        return toAbsoluteUrl(trimmedManifestUrl, fallbackBase)
    }

    const normalizedBaseUrl = normalizeRuntimeBaseUrl(runtimeBaseUrl)
    if (!normalizedBaseUrl) return ""

    const manifestPath = `${normalizedBaseUrl}/${DEFAULT_RUNTIME_MANIFEST_FILE}`
    return toAbsoluteUrl(manifestPath, normalizedBaseUrl)
}

const parseRuntimeManifest = (
    payload: unknown
): RuntimeReleaseManifest | null => {
    const record = toRecord(payload)
    if (!record) return null

    const manifest: RuntimeReleaseManifest = {}

    if (typeof record.schemaVersion === "number") {
        manifest.schemaVersion = record.schemaVersion
    }
    if (typeof record.updatedAt === "string") {
        manifest.updatedAt = record.updatedAt
    }
    if (typeof record.defaultChannel === "string") {
        manifest.defaultChannel = record.defaultChannel
    }
    if (typeof record.version === "string") {
        manifest.version = record.version
    }
    if (typeof record.script === "string") {
        manifest.script = record.script
    }

    const channelsRecord = toRecord(record.channels)
    if (channelsRecord) {
        const channels: Record<string, string> = {}
        for (const [key, value] of Object.entries(channelsRecord)) {
            if (typeof value !== "string") continue
            channels[key] = value
        }
        manifest.channels = channels
    }

    const versionsRecord = toRecord(record.versions)
    if (versionsRecord) {
        const versions: Record<string, RuntimeReleaseManifestVersionEntry> = {}
        for (const [version, value] of Object.entries(versionsRecord)) {
            const valueRecord = toRecord(value)
            if (!valueRecord) continue
            const script =
                typeof valueRecord.script === "string"
                    ? valueRecord.script
                    : undefined
            versions[version] = { script }
        }
        manifest.versions = versions
    }

    return manifest
}

const fetchRuntimeManifest = async (
    runtimeManifestUrl: string
): Promise<RuntimeReleaseManifest> => {
    const normalizedManifestUrl = runtimeManifestUrl.trim()
    if (!normalizedManifestUrl) {
        throw new Error("[Scrollix] runtime manifest URL is required.")
    }

    const cachedManifest = runtimeManifestDataByUrl.get(normalizedManifestUrl)
    if (cachedManifest) return cachedManifest

    const existingRequest = runtimeManifestPromiseByUrl.get(normalizedManifestUrl)
    if (existingRequest) return existingRequest

    const pendingRequest = (async () => {
        const response = await fetch(normalizedManifestUrl, {
            cache: "no-store",
        })
        if (!response.ok) {
            throw new Error(
                `[Scrollix] runtime manifest request failed (${response.status}): ${normalizedManifestUrl}`
            )
        }

        const parsed = parseRuntimeManifest((await response.json()) as unknown)
        if (!parsed) {
            throw new Error(
                `[Scrollix] runtime manifest has invalid JSON shape: ${normalizedManifestUrl}`
            )
        }

        runtimeManifestDataByUrl.set(normalizedManifestUrl, parsed)
        return parsed
    })()

    runtimeManifestPromiseByUrl.set(normalizedManifestUrl, pendingRequest)

    try {
        return await pendingRequest
    } finally {
        runtimeManifestPromiseByUrl.delete(normalizedManifestUrl)
    }
}

const resolveRuntimeScriptFromManifest = (
    manifest: RuntimeReleaseManifest,
    runtimeManifestUrl: string,
    runtimeBaseUrl: string,
    runtimeChannel: RuntimeChannel,
    runtimePinnedVersion: string
): string => {
    const normalizedBaseUrl = normalizeRuntimeBaseUrl(runtimeBaseUrl)
    const normalizedManifestUrl = runtimeManifestUrl.trim()

    const pinnedVersion = runtimePinnedVersion.trim()
    const channelVersion = manifest.channels?.[runtimeChannel]
    const defaultChannelName = manifest.defaultChannel?.trim()
    const defaultChannelVersion = defaultChannelName
        ? manifest.channels?.[defaultChannelName]
        : undefined

    const resolvedVersion =
        pinnedVersion ||
        channelVersion ||
        defaultChannelVersion ||
        manifest.version?.trim() ||
        ""

    const versionScript = resolvedVersion
        ? manifest.versions?.[resolvedVersion]?.script?.trim()
        : ""

    if (versionScript) {
        return toAbsoluteUrl(versionScript, normalizedManifestUrl)
    }

    if (manifest.script?.trim()) {
        return toAbsoluteUrl(manifest.script.trim(), normalizedManifestUrl)
    }

    if (resolvedVersion && normalizedBaseUrl) {
        return `${normalizedBaseUrl}/${resolvedVersion}/scrollix-art-gallery-runtime.js`
    }

    throw new Error(
        `[Scrollix] Could not resolve runtime script for channel "${runtimeChannel}".`
    )
}

const resolveRuntimeScriptUrl = async (
    options: RuntimeLocatorOptions
): Promise<string> => {
    const useLegacyRuntimeUrl = options.runtimeSourceMode === "legacyUrl"
    const manualRuntimeScriptUrl = options.runtimeScriptUrl.trim()

    if (useLegacyRuntimeUrl && !manualRuntimeScriptUrl) {
        throw new Error(
            "[Scrollix] runtimeScriptUrl is required when Runtime Mode is Legacy URL."
        )
    }

    if (useLegacyRuntimeUrl && manualRuntimeScriptUrl) {
        return appendLegacyRuntimeQueryParams(
            manualRuntimeScriptUrl,
            options.runtimeVersion,
            options.runtimeCacheKey
        )
    }

    const normalizedBaseUrl = normalizeRuntimeBaseUrl(options.runtimeBaseUrl)
    if (!normalizedBaseUrl) {
        throw new Error(
            "[Scrollix] runtimeBaseUrl is required when runtimeScriptUrl is empty."
        )
    }
    const pinnedVersion = options.runtimePinnedVersion.trim()
    if (pinnedVersion && !options.runtimeManifestUrl.trim()) {
        return `${normalizedBaseUrl}/${pinnedVersion}/scrollix-art-gallery-runtime.js`
    }

    const manifestUrl = resolveRuntimeManifestUrl(
        normalizedBaseUrl,
        options.runtimeManifestUrl
    )
    if (!manifestUrl) {
        throw new Error(
            "[Scrollix] Could not resolve runtime manifest URL. Check runtimeBaseUrl/runtimeManifestUrl."
        )
    }

    try {
        const manifest = await fetchRuntimeManifest(manifestUrl)
        return resolveRuntimeScriptFromManifest(
            manifest,
            manifestUrl,
            normalizedBaseUrl,
            options.runtimeChannel,
            options.runtimePinnedVersion
        )
    } catch (error) {
        if (pinnedVersion) {
            return `${normalizedBaseUrl}/${pinnedVersion}/scrollix-art-gallery-runtime.js`
        }
        throw error
    }
}

const createArtworkInputFromConfig = (
    artwork: ArtworkConfig,
    index: number
): FramerArtworkInput => {
    return {
        id: artwork.id || `art-${index + 1}`,
        title: artwork.title || `Artwork ${index + 1}`,
        description: artwork.description ?? "",
        imageSourceMode: "upload",
        imageUpload: artwork.imageUrl,
        imageExternalUrl: "",
        imageRuntimePath: "",
        imageUrl: artwork.imageUrl,
        fallbackImageUrl: artwork.fallbackImageUrl,
        side: artwork.side ?? "auto",
        width: artwork.width ?? 2.4,
        height: artwork.height ?? 1.6,
        frameEnabled: artwork.frameEnabled ?? false,
        frameColor: artwork.frameColor ?? "#151515",
        frameThickness: artwork.frameThickness ?? 0.14,
        frameDepth: artwork.frameDepth ?? 0.06,
        spotlightIntensity: artwork.spotlightIntensity ?? 1.15,
        sideTextEnabled: Boolean(
            artwork.sideText?.eyebrow ||
                artwork.sideText?.title ||
                artwork.sideText?.description
        ),
        sideTextEyebrow: artwork.sideText?.eyebrow ?? "",
        sideTextTitle: artwork.sideText?.title ?? "",
        sideTextDescription: artwork.sideText?.description ?? "",
        sideTextAlign: artwork.sideText?.align ?? "after",
        sideTextWidth: artwork.sideText?.width ?? 1.55,
        sideTextHeight: artwork.sideText?.height ?? 1.1,
        sideTextGap: artwork.sideText?.gap ?? 0.5,
        sideTextOffsetY: artwork.sideText?.offsetY ?? 0,
        sideTextOffsetZ: artwork.sideText?.offsetZ ?? 0,
        sideTextBackgroundColor: artwork.sideText?.backgroundColor ?? "#0e1422",
        sideTextTextColor: artwork.sideText?.textColor ?? "#f3f6fb",
        sideTextBorderEnabled: artwork.sideText?.borderEnabled ?? false,
        sideTextBorderColor: artwork.sideText?.borderColor ?? "#ff9e4b",
        sideTextBorderIntensity: artwork.sideText?.borderIntensity ?? 1.2,
        sideTextBorderWidth: artwork.sideText?.borderWidth ?? 0.035,
    }
}

const DEFAULT_MANUAL_ARTWORKS: FramerArtworkInput[] =
    DAYLIGHT_GALLERY_SAMPLE.artworks.map(createArtworkInputFromConfig)
const DEFAULT_ARTWORK_IMAGE_OVERRIDES: ArtworkImageOverrideInput[] =
    DAYLIGHT_GALLERY_SAMPLE.artworks.map((artwork) => ({
        image: artwork.imageUrl,
        artworkTitle: artwork.title,
        artworkDescription: artwork.description ?? "",
        sideTextEnabled: Boolean(
            artwork.sideText?.eyebrow ||
                artwork.sideText?.title ||
                artwork.sideText?.description
        ),
        sideTextEyebrow: artwork.sideText?.eyebrow ?? "",
        sideTextTitle: artwork.sideText?.title ?? "",
        sideTextDescription: artwork.sideText?.description ?? "",
    }))
const DEFAULT_ARTWORK_IMAGE_OVERRIDES_SIGNATURE =
    getArtworkImageOverrideSignature(DEFAULT_ARTWORK_IMAGE_OVERRIDES)

const getArtworkSignature = (artwork: FramerArtworkInput) => ({
    id: artwork.id.trim(),
    title: artwork.title.trim(),
    description: artwork.description.trim(),
    imageUpload: normalizeFramerImageValue(artwork.imageUpload) ?? "",
    imageUrl: normalizeFramerImageValue(artwork.imageUrl) ?? "",
    fallbackImageUrl: normalizeFramerImageValue(artwork.fallbackImageUrl) ?? "",
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
    sideTextBorderWidth: artwork.sideTextBorderWidth,
})

const getArtworksSignature = (artworks: FramerArtworkInput[]): string =>
    JSON.stringify(artworks.map(getArtworkSignature))

const DEFAULT_MANUAL_ARTWORKS_SIGNATURE = getArtworksSignature(
    DEFAULT_MANUAL_ARTWORKS
)

const resolveArtworkImageUrl = (
    artwork: FramerArtworkInput,
    sampleArtwork: ArtworkConfig | undefined
): string | undefined => {
    const legacyImage = normalizeFramerImageValue(artwork.imageUrl)
    const uploadImage = normalizeFramerImageValue(artwork.imageUpload)
    const externalImage = normalizeExternalUrl(artwork.imageExternalUrl)
    const runtimeImage = normalizeRuntimePath(artwork.imageRuntimePath)
    const sampleImage = sampleArtwork?.imageUrl?.trim() || undefined
    const sourceMode = artwork.imageSourceMode ?? "upload"

    if (sourceMode === "sample") {
        return (
            sampleImage ??
            uploadImage ??
            externalImage ??
            runtimeImage ??
            legacyImage
        )
    }
    if (sourceMode === "url") {
        return (
            externalImage ??
            uploadImage ??
            runtimeImage ??
            legacyImage ??
            sampleImage
        )
    }
    if (sourceMode === "runtimePath") {
        return (
            runtimeImage ??
            uploadImage ??
            externalImage ??
            legacyImage ??
            sampleImage
        )
    }
    return (
        uploadImage ??
        legacyImage ??
        externalImage ??
        runtimeImage ??
        sampleImage
    )
}

const hasSideTextContent = (
    sideText: ArtworkSideTextConfig | undefined
): boolean =>
    Boolean(sideText?.eyebrow || sideText?.title || sideText?.description)

const toArtworkConfig = (
    artwork: FramerArtworkInput,
    index: number,
    sampleArtwork: ArtworkConfig | undefined
): ArtworkConfig | null => {
    const normalizedId = artwork.id.trim() || `framer-art-${index + 1}`
    const normalizedTitle =
        artwork.title.trim() || sampleArtwork?.title || `Artwork ${index + 1}`
    const imageUrl =
        resolveArtworkImageUrl(artwork, sampleArtwork) ??
        sampleArtwork?.imageUrl?.trim()
    const fallbackImageUrl =
        normalizeFramerImageValue(artwork.fallbackImageUrl) ??
        sampleArtwork?.fallbackImageUrl

    if (!imageUrl) {
        return null
    }

    const side =
        artwork.side === "left" || artwork.side === "right"
            ? artwork.side
            : sampleArtwork?.side

    const sideTextFromControls: ArtworkSideTextConfig | undefined =
        artwork.sideTextEnabled
            ? {
                  eyebrow:
                      artwork.sideTextEyebrow.trim() ||
                      sampleArtwork?.sideText?.eyebrow,
                  title:
                      artwork.sideTextTitle.trim() ||
                      sampleArtwork?.sideText?.title,
                  description:
                      artwork.sideTextDescription.trim() ||
                      sampleArtwork?.sideText?.description,
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
                  borderWidth: artwork.sideTextBorderWidth,
              }
            : undefined

    return {
        id: normalizedId,
        title: normalizedTitle,
        description:
            artwork.description.trim() ||
            sampleArtwork?.description ||
            undefined,
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
        sideText: hasSideTextContent(sideTextFromControls)
            ? sideTextFromControls
            : undefined,
    }
}

const resolveArtworks = (
    artworkSource: ArtworkSource,
    artworks: FramerArtworkInput[],
    sampleConfig: ArtGallerySceneConfig
) => {
    if (artworkSource === "sample") {
        const hasAnyArrayEdit =
            getArtworksSignature(artworks) !== DEFAULT_MANUAL_ARTWORKS_SIGNATURE
        if (!hasAnyArrayEdit) {
            return sampleConfig.artworks
        }

        const merged: ArtworkConfig[] = []
        const maxLength = Math.max(
            sampleConfig.artworks.length,
            artworks.length
        )
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

            const editedArtwork = toArtworkConfig(
                manualArtwork,
                index,
                sampleArtwork
            )
            if (editedArtwork) {
                merged.push(editedArtwork)
            } else if (sampleArtwork) {
                merged.push(sampleArtwork)
            }
        }

        return merged.length > 0 ? merged : sampleConfig.artworks
    }

    const manual = artworks
        .map((artwork, index) =>
            toArtworkConfig(artwork, index, sampleConfig.artworks[index])
        )
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

    const normalizedOverrides = imageOverrides.map((item) =>
        normalizeArtworkImageOverride(item)
    )
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

    const normalizedOverrideUrls = normalizedOverrides.map(
        (item) => item.imageUrl ?? ""
    )
    const currentImages = config.artworks.map((artwork) => artwork.imageUrl)
    const alreadyMatchesCurrent = normalizedOverrideUrls.every(
        (overrideUrl, index) =>
            !overrideUrl || overrideUrl === currentImages[index]
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
        samplePreset !== "daylight" &&
        getArtworkImageOverrideSignature(imageOverrides) ===
            DEFAULT_ARTWORK_IMAGE_OVERRIDES_SIGNATURE
    ) {
        return config
    }

    const nextConfig = cloneConfig(config)

    const ensureArtworkAt = (index: number): ArtworkConfig => {
        const existing = nextConfig.artworks[index]
        if (existing) return existing

        const fallbackArtwork =
            nextConfig.artworks[nextConfig.artworks.length - 1]
        const created: ArtworkConfig = {
            id: `framer-art-${index + 1}`,
            title: `Artwork ${index + 1}`,
            description: "",
            imageUrl: "",
            fallbackImageUrl: fallbackArtwork?.fallbackImageUrl,
            side: index % 2 === 0 ? "left" : "right",
            width: fallbackArtwork?.width ?? 2.4,
            height: fallbackArtwork?.height ?? 1.6,
            frameEnabled: fallbackArtwork?.frameEnabled ?? false,
            frameColor: fallbackArtwork?.frameColor ?? "#151515",
            frameThickness: fallbackArtwork?.frameThickness ?? 0.14,
            frameDepth: fallbackArtwork?.frameDepth ?? 0.06,
            spotlightIntensity: fallbackArtwork?.spotlightIntensity ?? 1.15,
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
            description:
                override.artworkDescription ?? currentArtwork.description,
        }

        if (override.sideTextEnabled) {
            nextArtwork.sideText = {
                align: currentArtwork.sideText?.align ?? "after",
                width: currentArtwork.sideText?.width ?? 1.55,
                height: currentArtwork.sideText?.height ?? 1.1,
                gap: currentArtwork.sideText?.gap ?? 0.5,
                offsetY: currentArtwork.sideText?.offsetY ?? 0,
                offsetZ: currentArtwork.sideText?.offsetZ ?? 0,
                backgroundColor:
                    currentArtwork.sideText?.backgroundColor ?? "#0e1422",
                textColor: currentArtwork.sideText?.textColor ?? "#f3f6fb",
                borderEnabled: currentArtwork.sideText?.borderEnabled ?? false,
                borderColor: currentArtwork.sideText?.borderColor ?? "#ff9e4b",
                borderIntensity:
                    currentArtwork.sideText?.borderIntensity ?? 1.2,
                borderWidth: currentArtwork.sideText?.borderWidth ?? 0.035,
                eyebrow:
                    override.sideTextEyebrow ??
                    currentArtwork.sideText?.eyebrow,
                title: override.sideTextTitle ?? currentArtwork.sideText?.title,
                description:
                    override.sideTextDescription ??
                    currentArtwork.sideText?.description,
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
                error: "[Scrollix] customConfigJson must be a JSON object.",
            }
        }
        return {
            parsed: parsed as DeepPartial<ArtGallerySceneConfig>,
            error: null,
        }
    } catch (error) {
        return {
            parsed: null,
            error:
                error instanceof Error
                    ? error.message
                    : "[Scrollix] Invalid customConfigJson.",
        }
    }
}

const loadJsonOverrideFromUrl = async (
    url: string
): Promise<OverrideParseResult> => {
    const trimmed = url.trim()
    if (!trimmed) {
        return { parsed: null, error: null }
    }

    try {
        const response = await fetch(trimmed, { cache: "no-store" })
        if (!response.ok) {
            return {
                parsed: null,
                error: `[Scrollix] JSON Override File request failed (${response.status}).`,
            }
        }

        const text = await response.text()
        const parsed = parseCustomConfigJson(text)
        if (!parsed.parsed) {
            return {
                parsed: null,
                error: parsed.error
                    ? `[Scrollix] JSON Override File invalid: ${parsed.error}`
                    : "[Scrollix] JSON Override File invalid.",
            }
        }

        return parsed
    } catch (error) {
        return {
            parsed: null,
            error:
                error instanceof Error
                    ? `[Scrollix] JSON Override File load failed: ${error.message}`
                    : "[Scrollix] JSON Override File load failed.",
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

    const resolvedSceneBackgroundColor = resolveFramerColor(
        controlsBaseline.sceneBackgroundColor,
        props.geometryColors?.backgroundColor,
        props.sceneBackgroundColor
    )
    const resolvedSceneFogColor = resolveFramerColor(
        controlsBaseline.sceneFogColor,
        props.geometryColors?.fogColor,
        props.sceneFogColor
    )
    const resolvedFloorColor = resolveFramerColor(
        controlsBaseline.corridor.floorColor,
        props.geometryColors?.floorColor,
        props.corridorFloorColor
    )
    const resolvedCarpetColor = resolveFramerColor(
        controlsBaseline.corridor.carpetColor,
        props.carpet?.color,
        props.corridorCarpetColor
    )
    const resolvedTitleColor = resolveFramerColor(
        controlsBaseline.sceneTitleConfig.color,
        props.title?.color,
        props.titleColor
    )
    const resolvedTitleDaylightContrastColor = resolveFramerColor(
        controlsBaseline.sceneTitleConfig.daylightContrastColor,
        props.title?.daylightContrastColor,
        props.titleDaylightContrastColor
    )
    const resolvedCeilingSpotsColor = resolveFramerColor(
        controlsBaseline.ceilingSpotsColor,
        props.ceilingSpotsColor
    )
    const resolvedArtworkBacklightColor = resolveFramerColor(
        controlsBaseline.artworkBacklightColor,
        props.artworkBacklightColor
    )
    const resolvedCorridorWallColor = resolveFramerColor(
        controlsBaseline.corridor.wallColor,
        props.corridorWallColor
    )
    const resolvedCorridorCeilingColor = resolveFramerColor(
        controlsBaseline.corridor.ceilingColor,
        props.corridorCeilingColor
    )

    const geometryColors: GeometryColorsControls = {
        backgroundColor: resolvedSceneBackgroundColor,
        fogColor: resolvedSceneFogColor,
        floorColor: resolvedFloorColor,
    }
    const carpet: CarpetControls = {
        enabled:
            props.carpet?.enabled ??
            props.corridorCarpetEnabled ??
            controlsBaseline.corridor.carpetEnabled,
        color: resolvedCarpetColor,
        width:
            props.carpet?.width ??
            props.corridorCarpetWidth ??
            controlsBaseline.corridor.carpetWidth,
    }
    const title: TitleControls = {
        text:
            props.title?.text ??
            props.sceneTitle ??
            controlsBaseline.sceneTitle,
        fontPreset:
            props.title?.fontPreset ??
            props.titleFontPreset ??
            "helvetiker",
        customFontUrl:
            props.title?.customFontUrl ??
            props.titleFontUrl ??
            controlsBaseline.sceneTitleConfig.fontUrl,
        size:
            props.title?.size ??
            props.titleSize ??
            controlsBaseline.sceneTitleConfig.size,
        depth:
            props.title?.depth ??
            props.titleDepth ??
            controlsBaseline.sceneTitleConfig.depth,
        maxWidth:
            props.title?.maxWidth ??
            props.titleMaxWidth ??
            controlsBaseline.sceneTitleConfig.maxWidth,
        lineHeight:
            props.title?.lineHeight ??
            props.titleLineHeight ??
            controlsBaseline.sceneTitleConfig.lineHeight,
        color: resolvedTitleColor,
        daylightContrastEnabled:
            props.title?.daylightContrastEnabled ??
            props.titleDaylightContrastEnabled ??
            controlsBaseline.sceneTitleConfig.daylightContrastEnabled,
        daylightContrastColor: resolvedTitleDaylightContrastColor,
        daylightContrastStrength:
            props.title?.daylightContrastStrength ??
            props.titleDaylightContrastStrength ??
            controlsBaseline.sceneTitleConfig.daylightContrastStrength,
        positionX:
            props.title?.positionX ??
            props.titlePositionX ??
            controlsBaseline.sceneTitleConfig.position[0],
        positionY:
            props.title?.positionY ??
            props.titlePositionY ??
            controlsBaseline.sceneTitleConfig.position[1],
        positionZ:
            props.title?.positionZ ??
            props.titlePositionZ ??
            controlsBaseline.sceneTitleConfig.position[2],
        maxOpacity:
            props.title?.maxOpacity ??
            props.titleMaxOpacity ??
            controlsBaseline.sceneTitleConfig.maxOpacity,
        fadeStartProgress:
            props.title?.fadeStartProgress ??
            props.titleFadeStartProgress ??
            controlsBaseline.sceneTitleConfig.fadeStartProgress,
        fadeEndProgress:
            props.title?.fadeEndProgress ??
            props.titleFadeEndProgress ??
            controlsBaseline.sceneTitleConfig.fadeEndProgress,
    }
    const durations: DurationControls = {
        intro:
            props.durations?.intro ??
            props.timingIntroDuration ??
            controlsBaseline.timings.introDuration,
        travel:
            props.durations?.travel ??
            props.timingTravelDuration ??
            controlsBaseline.timings.travelDuration,
        focus:
            props.durations?.focus ??
            props.timingFocusDuration ??
            controlsBaseline.timings.focusDuration,
        return:
            props.durations?.return ??
            props.timingReturnDuration ??
            controlsBaseline.timings.returnDuration,
    }
    const selectedTitleFontUrl = resolveTitleFontUrl(
        title.fontPreset,
        title.customFontUrl
    )
    const resolvedCameraAspectRatio = resolveCameraAspectRatio(
        props.cameraAspectPreset
    )
    const resolvedTitleText =
        typeof title.text === "string" ? title.text : controlsBaseline.sceneTitle
    const resolvedSceneTitle =
        resolvedTitleText.trim() || controlsBaseline.sceneTitle
    const isDayPreset = props.samplePreset === "daylight"
    const shouldOverrideSceneTitle =
        isDayPreset || resolvedSceneTitle !== controlsBaseline.sceneTitle
    const shouldOverrideGeometryColors =
        isDayPreset ||
        !areColorValuesEqual(
            geometryColors.backgroundColor,
            controlsBaseline.sceneBackgroundColor
        ) ||
        !areColorValuesEqual(
            geometryColors.fogColor,
            controlsBaseline.sceneFogColor
        ) ||
        !areColorValuesEqual(
            geometryColors.floorColor,
            controlsBaseline.corridor.floorColor
        )
    const shouldOverrideCarpet =
        isDayPreset ||
        carpet.enabled !== controlsBaseline.corridor.carpetEnabled ||
        !areColorValuesEqual(
            carpet.color,
            controlsBaseline.corridor.carpetColor
        ) ||
        carpet.width !== controlsBaseline.corridor.carpetWidth
    const shouldOverrideArtworkSpacing =
        isDayPreset ||
        props.corridorArtworkSpacing !== controlsBaseline.corridor.artworkSpacing
    const shouldOverrideDurations =
        isDayPreset ||
        durations.intro !== controlsBaseline.timings.introDuration ||
        durations.travel !== controlsBaseline.timings.travelDuration ||
        durations.focus !== controlsBaseline.timings.focusDuration ||
        durations.return !== controlsBaseline.timings.returnDuration
    const shouldOverrideCameraAspectRatio =
        isDayPreset || props.cameraAspectPreset !== "auto"
    const shouldOverrideScrollStrength =
        isDayPreset ||
        props.scrollStrength !== controlsBaseline.scrollStrength
    const withResolvedSceneControls = (
        config: ArtGallerySceneConfig
    ): ArtGallerySceneConfig => ({
        ...config,
        scrollStrength: shouldOverrideScrollStrength
            ? props.scrollStrength
            : config.scrollStrength,
        camera: {
            ...config.camera,
            targetAspectRatio: shouldOverrideCameraAspectRatio
                ? resolvedCameraAspectRatio
                : config.camera.targetAspectRatio,
        },
        sceneTitle: shouldOverrideSceneTitle
            ? resolvedSceneTitle
            : config.sceneTitle,
        sceneBackgroundColor: shouldOverrideGeometryColors
            ? geometryColors.backgroundColor
            : config.sceneBackgroundColor,
        sceneFogColor: shouldOverrideGeometryColors
            ? geometryColors.fogColor
            : config.sceneFogColor,
        corridor: {
            ...config.corridor,
            floorColor: shouldOverrideGeometryColors
                ? geometryColors.floorColor
                : config.corridor.floorColor,
            carpetEnabled: shouldOverrideCarpet
                ? carpet.enabled
                : config.corridor.carpetEnabled,
            carpetColor: shouldOverrideCarpet
                ? carpet.color
                : config.corridor.carpetColor,
            carpetWidth: shouldOverrideCarpet
                ? carpet.width
                : config.corridor.carpetWidth,
            artworkSpacing: shouldOverrideArtworkSpacing
                ? props.corridorArtworkSpacing
                : config.corridor.artworkSpacing,
        },
        timings: {
            ...config.timings,
            introDuration: shouldOverrideDurations
                ? durations.intro
                : config.timings.introDuration,
            travelDuration: shouldOverrideDurations
                ? durations.travel
                : config.timings.travelDuration,
            focusDuration: shouldOverrideDurations
                ? durations.focus
                : config.timings.focusDuration,
            returnDuration: shouldOverrideDurations
                ? durations.return
                : config.timings.returnDuration,
        },
    })

    const overrideConfig: DeepPartial<ArtGallerySceneConfig> = {
        id: props.sceneId.trim() || controlsBaseline.id,
        sceneTitle: resolvedSceneTitle,
        lightingMode: props.lightingMode,
        infiniteCorridor: props.infiniteCorridor,
        sceneBackgroundColor: geometryColors.backgroundColor,
        sceneFogColor: geometryColors.fogColor,
        ceilingSpotsEnabled: props.ceilingSpotsEnabled,
        ceilingSpotsColor: resolvedCeilingSpotsColor,
        ceilingSpotsIntensity: props.ceilingSpotsIntensity,
        artworkBacklightEnabled: props.artworkBacklightEnabled,
        artworkBacklightColor: resolvedArtworkBacklightColor,
        artworkBacklightIntensity: props.artworkBacklightIntensity,
        scrollStrength: props.scrollStrength,
        loopWhiteAfterEndWindow: props.loopWhiteAfterEndWindow,
        loopWhiteStartsBeforeEndWindow: props.loopWhiteStartsBeforeEndWindow,
        loopWhiteFadeOutRevealWindow: props.loopWhiteFadeOutRevealWindow,
        loopWhiteFadeOutWindow: props.loopWhiteFadeOutWindow,
        loopProgressAdvanceDuringWhiteFadeOut:
            props.loopProgressAdvanceDuringWhiteFadeOut,
        artworkFocusFill: props.artworkFocusFill,
        artworkTurnSmoothness: props.artworkTurnSmoothness,
        artworkTurnKeyframes: props.artworkTurnKeyframes,
        artworkTurnLeadIn: props.artworkTurnLeadIn,
        camera: {
            fov: props.cameraFov,
            targetAspectRatio: resolvedCameraAspectRatio,
            startPosition: [
                props.cameraStartX,
                props.cameraStartY,
                props.cameraStartZ,
            ],
            height: props.cameraHeight,
            movementSmoothing: props.cameraMovementSmoothing,
            near: props.cameraNear,
            far: props.cameraFar,
        },
        corridor: {
            width: props.corridorWidth,
            height: props.corridorHeight,
            segmentLength: props.corridorSegmentLength,
            wallColor: resolvedCorridorWallColor,
            floorColor: geometryColors.floorColor,
            ceilingColor: resolvedCorridorCeilingColor,
            carpetEnabled: carpet.enabled,
            carpetWidth: carpet.width,
            carpetColor: carpet.color,
            artworkSpacing: props.corridorArtworkSpacing,
            wallThickness: props.corridorWallThickness,
            artworkInset: props.corridorArtworkInset,
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
            fadeEndProgress: title.fadeEndProgress,
        },
        timings: {
            introDuration: durations.intro,
            travelDuration: durations.travel,
            focusDuration: durations.focus,
            returnDuration: durations.return,
        },
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
                fontUrl: selectedTitleFontUrl,
            },
        }
    ) as unknown as ArtGallerySceneConfig

    const withArtworkControls = deepMerge(
        withFontSelection as unknown as Record<string, unknown>,
        {
            artworks: resolveArtworks(
                props.artworkSource,
                props.artworks,
                withFontSelection
            ),
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
            config: withResolvedSceneControls(withImageOverrides),
            parseError,
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
        config: withResolvedSceneControls(finalConfig),
        parseError: fileOverride.error,
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 760
 */
function ScrollixArtGallery(props: ScrollixArtGalleryProps) {
    const [sampleConfigs, setSampleConfigs] = React.useState<SampleConfigMap>(
        () => cloneSampleConfigs()
    )
    const [fileOverride, setFileOverride] = React.useState<OverrideParseResult>(
        {
            parsed: null,
            error: null,
        }
    )

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

    const runtimeLocatorOptions = React.useMemo<RuntimeLocatorOptions>(
        () => ({
            runtimeSourceMode: props.runtimeSourceMode,
            runtimeBaseUrl: props.runtimeBaseUrl,
            runtimeManifestUrl: props.runtimeManifestUrl,
            runtimeChannel: props.runtimeChannel,
            runtimePinnedVersion: props.runtimePinnedVersion,
            runtimeScriptUrl: props.runtimeScriptUrl,
            runtimeVersion: props.runtimeVersion,
            runtimeCacheKey: props.runtimeCacheKey,
        }),
        [
            props.runtimeSourceMode,
            props.runtimeBaseUrl,
            props.runtimeManifestUrl,
            props.runtimeChannel,
            props.runtimePinnedVersion,
            props.runtimeScriptUrl,
            props.runtimeVersion,
            props.runtimeCacheKey,
        ]
    )

    const {
        ready: runtimeReady,
        loading: runtimeLoading,
        error: runtimeLoadError,
    } = useScrollixArtGalleryRuntime(
        runtimeLocatorOptions,
        SCROLLIX_ART_GALLERY_TAG
    )

    const [runtimeInitialized, setRuntimeInitialized] = React.useState(false)
    const [runtimeInitError, setRuntimeInitError] = React.useState<
        string | null
    >(null)

    const buildResult = React.useMemo(
        () => buildGalleryConfig(props, sampleConfigs, fileOverride),
        [props, sampleConfigs, fileOverride]
    )
    const payload = React.useMemo(
        () => JSON.stringify(buildResult.config),
        [buildResult.config]
    )

    const frameStyle = React.useMemo<React.CSSProperties>(
        () => ({
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            ...(props.style ?? {}),
        }),
        [props.style]
    )

    const runtimeElementStyle = React.useMemo<React.CSSProperties>(
        () => ({
            display: "block",
            width: "100%",
            height: "100%",
            minHeight: "100%",
            minWidth: 0,
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

            const isRegistered = Boolean(
                window.customElements.get(SCROLLIX_ART_GALLERY_TAG)
            )
            if (!isRegistered) {
                throw new Error(
                    "[Scrollix] runtime module loaded but scrollix-art-gallery was not registered."
                )
            }

            setRuntimeInitError(null)
            setRuntimeInitialized(true)
        } catch (error) {
            setRuntimeInitialized(false)
            setRuntimeInitError(
                error instanceof Error
                    ? error.message
                    : "Runtime bootstrap failed."
            )
        }
    }, [runtimeReady])

    if (runtimeLoadError || runtimeInitError) {
        const errorMessage =
            runtimeLoadError ??
            runtimeInitError ??
            "Runtime failed to initialize."
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
            data-runtime-ready={runtimeInitialized ? "true" : "false"}
            data-config-parse-error={buildResult.parseError ?? ""}
        >
            <scrollix-art-gallery
                style={runtimeElementStyle}
                config-json={payload}
            />
        </div>
    )
}

ScrollixArtGallery.defaultProps = {
    runtimeSourceMode: "manifest",
    runtimeBaseUrl: DEFAULT_RUNTIME_BASE_URL,
    runtimeManifestUrl: "",
    runtimeChannel: DEFAULT_RUNTIME_CHANNEL,
    runtimePinnedVersion: "",
    runtimeScriptUrl: "",
    runtimeVersion: DEFAULT_RUNTIME_VERSION,
    runtimeCacheKey: "",
    samplePreset: "daylight",
    artworkSource: "sample",
    artworkImageOverrides: DEFAULT_ARTWORK_IMAGE_OVERRIDES,
    geometryColors: {
        backgroundColor: DAYLIGHT_GALLERY_SAMPLE.sceneBackgroundColor,
        fogColor: DAYLIGHT_GALLERY_SAMPLE.sceneFogColor,
        floorColor: DAYLIGHT_GALLERY_SAMPLE.corridor.floorColor,
    },
    carpet: {
        enabled: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetEnabled,
        color: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetColor,
        width: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetWidth,
    },
    title: {
        text: DAYLIGHT_GALLERY_SAMPLE.sceneTitle,
        fontPreset: "helvetiker",
        customFontUrl: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl,
        size: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.size,
        depth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.depth,
        maxWidth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxWidth,
        lineHeight: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.lineHeight,
        color: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.color,
        daylightContrastEnabled:
            DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastEnabled,
        daylightContrastColor:
            DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastColor,
        daylightContrastStrength:
            DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastStrength,
        positionX: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[0],
        positionY: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[1],
        positionZ: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[2],
        maxOpacity: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxOpacity,
        fadeStartProgress:
            DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeStartProgress,
        fadeEndProgress:
            DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeEndProgress,
    },
    durations: {
        intro: DAYLIGHT_GALLERY_SAMPLE.timings.introDuration,
        travel: DAYLIGHT_GALLERY_SAMPLE.timings.travelDuration,
        focus: DAYLIGHT_GALLERY_SAMPLE.timings.focusDuration,
        return: DAYLIGHT_GALLERY_SAMPLE.timings.returnDuration,
    },
    jsonOverrideFile: "",
    customConfigJson: "",
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
    artworkBacklightIntensity:
        DAYLIGHT_GALLERY_SAMPLE.artworkBacklightIntensity,
    loopWhiteAfterEndWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteAfterEndWindow,
    loopWhiteStartsBeforeEndWindow:
        DAYLIGHT_GALLERY_SAMPLE.loopWhiteStartsBeforeEndWindow,
    loopWhiteFadeOutRevealWindow:
        DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutRevealWindow,
    loopWhiteFadeOutWindow: DAYLIGHT_GALLERY_SAMPLE.loopWhiteFadeOutWindow,
    loopProgressAdvanceDuringWhiteFadeOut:
        DAYLIGHT_GALLERY_SAMPLE.loopProgressAdvanceDuringWhiteFadeOut,
    artworkFocusFill: DAYLIGHT_GALLERY_SAMPLE.artworkFocusFill,
    artworkTurnSmoothness: DAYLIGHT_GALLERY_SAMPLE.artworkTurnSmoothness,
    artworkTurnKeyframes: DAYLIGHT_GALLERY_SAMPLE.artworkTurnKeyframes,
    artworkTurnLeadIn: DAYLIGHT_GALLERY_SAMPLE.artworkTurnLeadIn,
    cameraAspectPreset: "auto",
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
    titleFontPreset: "helvetiker",
    titleFontUrl: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl,
    titleSize: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.size,
    titleDepth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.depth,
    titleMaxWidth: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxWidth,
    titleLineHeight: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.lineHeight,
    titleColor: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.color,
    titleDaylightContrastEnabled:
        DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastEnabled,
    titleDaylightContrastColor:
        DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastColor,
    titleDaylightContrastStrength:
        DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastStrength,
    titlePositionX: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[0],
    titlePositionY: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[1],
    titlePositionZ: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[2],
    titleMaxOpacity: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxOpacity,
    titleFadeStartProgress:
        DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeStartProgress,
    titleFadeEndProgress:
        DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeEndProgress,
    timingIntroDuration: DAYLIGHT_GALLERY_SAMPLE.timings.introDuration,
    timingTravelDuration: DAYLIGHT_GALLERY_SAMPLE.timings.travelDuration,
    timingFocusDuration: DAYLIGHT_GALLERY_SAMPLE.timings.focusDuration,
    timingReturnDuration: DAYLIGHT_GALLERY_SAMPLE.timings.returnDuration,
    artworks: DEFAULT_MANUAL_ARTWORKS,
} as ScrollixArtGalleryProps

addPropertyControls(ScrollixArtGallery, {
    runtimeSourceMode: {
        type: ControlType.Enum,
        title: "Runtime Mode",
        options: ["manifest", "legacyUrl"],
        optionTitles: ["Manifest", "Legacy URL"],
        defaultValue: "manifest",
    },
    runtimeBaseUrl: {
        type: ControlType.String,
        title: "Runtime Base",
        defaultValue: DEFAULT_RUNTIME_BASE_URL,
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode === "legacyUrl",
    },
    runtimeChannel: {
        type: ControlType.Enum,
        title: "Channel",
        options: ["stable", "beta"],
        optionTitles: ["Stable", "Beta"],
        defaultValue: DEFAULT_RUNTIME_CHANNEL,
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode === "legacyUrl",
    },
    runtimePinnedVersion: {
        type: ControlType.String,
        title: "Pin Version",
        defaultValue: "",
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode === "legacyUrl",
    },
    runtimeManifestUrl: {
        type: ControlType.String,
        title: "Manifest URL",
        defaultValue: "",
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode === "legacyUrl",
    },
    runtimeScriptUrl: {
        type: ControlType.String,
        title: "Legacy URL",
        defaultValue: "",
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode !== "legacyUrl",
    },
    runtimeVersion: {
        type: ControlType.String,
        title: "Legacy Ver",
        defaultValue: DEFAULT_RUNTIME_VERSION,
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode !== "legacyUrl" ||
            !props.runtimeScriptUrl.trim(),
    },
    runtimeCacheKey: {
        type: ControlType.String,
        title: "Legacy Key",
        defaultValue: "",
        hidden: (props: ScrollixArtGalleryProps) =>
            props.runtimeSourceMode !== "legacyUrl" ||
            !props.runtimeScriptUrl.trim(),
    },
    samplePreset: {
        type: ControlType.Enum,
        title: "Template",
        options: Object.keys(SAMPLE_CONFIGS),
        optionTitles: [
            "DayLight",
            "Mistery",
            "Cabaret",
            "Nave Nodriza",
        ],
        defaultValue: "daylight",
    },
    artworkImageOverrides: {
        type: ControlType.Array,
        title: "Artworks",
        maxCount: 48,
        description:
            "Imagen + texto por indice. Upload, titulo, descripcion y side text.",
        control: {
            type: ControlType.Object,
            controls: {
                image: {
                    type: ControlType.Image,
                    title: "Image",
                },
                artworkTitle: {
                    type: ControlType.String,
                    title: "Title",
                },
                artworkDescription: {
                    type: ControlType.String,
                    title: "Description",
                    displayTextArea: true,
                },
                sideTextEnabled: {
                    type: ControlType.Boolean,
                    title: "Side Text",
                    defaultValue: false,
                },
                sideTextEyebrow: {
                    type: ControlType.String,
                    title: "Eyebrow",
                    hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled,
                },
                sideTextTitle: {
                    type: ControlType.String,
                    title: "Text Title",
                    hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled,
                },
                sideTextDescription: {
                    type: ControlType.String,
                    title: "Text Desc",
                    displayTextArea: true,
                    hidden: (item: ArtworkImageOverrideInput) => !item.sideTextEnabled,
                },
            },
        },
    },
    infiniteCorridor: {
        type: ControlType.Boolean,
        title: "Infinite Corridor",
        defaultValue: DAYLIGHT_GALLERY_SAMPLE.infiniteCorridor,
    },
    scrollStrength: {
        type: ControlType.Number,
        title: "Scroll Strength",
        min: 0.25,
        max: 8,
        step: 0.05,
        defaultValue: DAYLIGHT_GALLERY_SAMPLE.scrollStrength,
    },
    cameraAspectPreset: {
        type: ControlType.Enum,
        title: "Aspect Ratio",
        options: [
            "auto",
            "ratio_3_4",
            "ratio_1_1",
            "ratio_4_3",
            "ratio_16_9",
        ],
        optionTitles: ["Auto", "3:4", "1:1", "4:3", "16:9"],
        defaultValue: "auto",
    },
    geometryColors: {
        type: ControlType.Object,
        title: "Geometry Colors",
        controls: {
            backgroundColor: {
                type: ControlType.Color,
                title: "BG",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneBackgroundColor,
            },
            fogColor: {
                type: ControlType.Color,
                title: "Fog",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneFogColor,
            },
            floorColor: {
                type: ControlType.Color,
                title: "Floor",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.floorColor,
            },
        },
    },
    carpet: {
        type: ControlType.Object,
        title: "Carpet",
        controls: {
            enabled: {
                type: ControlType.Boolean,
                title: "Enabled",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetEnabled,
            },
            color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetColor,
            },
            width: {
                type: ControlType.Number,
                title: "Width",
                min: 0.12,
                max: 8,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.carpetWidth,
            },
        },
    },
    corridorArtworkSpacing: {
        type: ControlType.Number,
        title: "Artwork Gap",
        min: 4,
        max: 30,
        step: 0.1,
        defaultValue: DAYLIGHT_GALLERY_SAMPLE.corridor.artworkSpacing,
    },
    title: {
        type: ControlType.Object,
        title: "Title",
        controls: {
            text: {
                type: ControlType.String,
                title: "Text",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitle,
            },
            fontPreset: {
                type: ControlType.Enum,
                title: "Font",
                options: ["helvetiker", "droidSerif", "optimer", "gentilis", "custom"],
                optionTitles: ["Helvetiker", "Droid Serif (Times)", "Optimer", "Gentilis", "Custom URL"],
                defaultValue: "helvetiker",
            },
            customFontUrl: {
                type: ControlType.String,
                title: "Custom Font URL",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fontUrl,
            },
            size: {
                type: ControlType.Number,
                title: "Size",
                min: 0.3,
                max: 5,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.size,
            },
            depth: {
                type: ControlType.Number,
                title: "Depth",
                min: 0.02,
                max: 1,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.depth,
            },
            maxWidth: {
                type: ControlType.Number,
                title: "Wrap",
                min: 0.8,
                max: 40,
                step: 0.1,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxWidth,
            },
            lineHeight: {
                type: ControlType.Number,
                title: "Line Height",
                min: 0.8,
                max: 2.4,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.lineHeight,
            },
            color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.color,
            },
            daylightContrastEnabled: {
                type: ControlType.Boolean,
                title: "Day Contrast",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastEnabled,
            },
            daylightContrastColor: {
                type: ControlType.Color,
                title: "Contrast Color",
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastColor,
            },
            daylightContrastStrength: {
                type: ControlType.Number,
                title: "Contrast Strength",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.daylightContrastStrength,
            },
            positionX: {
                type: ControlType.Number,
                title: "X",
                min: -20,
                max: 20,
                step: 0.1,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[0],
            },
            positionY: {
                type: ControlType.Number,
                title: "Y",
                min: -20,
                max: 20,
                step: 0.1,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[1],
            },
            positionZ: {
                type: ControlType.Number,
                title: "Z",
                min: -20,
                max: 20,
                step: 0.1,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.position[2],
            },
            maxOpacity: {
                type: ControlType.Number,
                title: "Opacity",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.maxOpacity,
            },
            fadeStartProgress: {
                type: ControlType.Number,
                title: "Fade Start",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeStartProgress,
            },
            fadeEndProgress: {
                type: ControlType.Number,
                title: "Fade End",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.sceneTitleConfig.fadeEndProgress,
            },
        },
    },
    durations: {
        type: ControlType.Object,
        title: "Durations",
        controls: {
            intro: {
                type: ControlType.Number,
                title: "Intro",
                min: 0.01,
                max: 8,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.introDuration,
            },
            travel: {
                type: ControlType.Number,
                title: "Travel",
                min: 0.01,
                max: 8,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.travelDuration,
            },
            focus: {
                type: ControlType.Number,
                title: "Focus",
                min: 0.01,
                max: 8,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.focusDuration,
            },
            return: {
                type: ControlType.Number,
                title: "Return",
                min: 0.01,
                max: 8,
                step: 0.01,
                defaultValue: DAYLIGHT_GALLERY_SAMPLE.timings.returnDuration,
            },
        },
    },
})
export default ScrollixArtGallery

