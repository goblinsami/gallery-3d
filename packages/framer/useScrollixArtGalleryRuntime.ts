import * as React from 'react'

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
      reject(new Error(`[Scrollix] Failed to load runtime module: ${runtimeUrl}`))
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

export const useScrollixArtGalleryRuntime = (
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

