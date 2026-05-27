import { createApp, reactive, type App } from "vue";
import RuntimeArtGallery from "../vue/RuntimeArtGallery.vue";

const resolveRuntimeCssHref = (): string => {
  const moduleUrl = new URL(import.meta.url);
  const cssUrl = new URL(/* @vite-ignore */ "./scrollix-art-gallery-runtime.css", moduleUrl);

  // Keep CSS and JS on the same cache-busting version (e.g. ?v=..., ?cb=...).
  moduleUrl.searchParams.forEach((value, key) => {
    cssUrl.searchParams.set(key, value);
  });

  return cssUrl.toString();
};

const RUNTIME_CSS_HREF = resolveRuntimeCssHref();
const RUNTIME_MODULE_BASE_URL = new URL(/* @vite-ignore */ "./", import.meta.url).toString();

interface RuntimeArtGalleryProps {
  configJson: string;
  initialProgress: number;
  assetBaseUrl: string;
}

const toProgress = (value: string | null): number => {
  if (value === null) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(1, parsed));
};

export class ScrollixArtGalleryElement extends HTMLElement {
  static get observedAttributes() {
    return ["config-json", "initial-progress"];
  }

  private app: App<Element> | null = null;
  private mountNode: HTMLDivElement | null = null;
  private props = reactive<RuntimeArtGalleryProps>({
    configJson: "",
    initialProgress: 0,
    assetBaseUrl: RUNTIME_MODULE_BASE_URL,
  });

  connectedCallback() {
    this.style.display = "block";
    this.style.width = "100%";
    this.style.height = "100%";
    this.style.minHeight = "100%";
    this.style.minWidth = "0";

    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: "open" });

    if (!this.mountNode) {
      this.mountNode = document.createElement("div");
      this.mountNode.className = "scrollix-runtime-host";

      const styleLink = document.createElement("link");
      styleLink.setAttribute("rel", "stylesheet");
      styleLink.setAttribute("href", RUNTIME_CSS_HREF);
      styleLink.setAttribute("data-scrollix-runtime-style", "true");

      shadowRoot.append(styleLink, this.mountNode);
    }

    this.syncPropsFromAttributes();

    if (!this.app && this.mountNode) {
      this.app = createApp(RuntimeArtGallery, this.props);
      this.app.mount(this.mountNode);
    }
  }

  disconnectedCallback() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }

  attributeChangedCallback() {
    this.syncPropsFromAttributes();
  }

  private syncPropsFromAttributes() {
    this.props.configJson = this.getAttribute("config-json") ?? "";
    this.props.initialProgress = toProgress(this.getAttribute("initial-progress"));
    this.props.assetBaseUrl = RUNTIME_MODULE_BASE_URL;
  }
}
