import { createApp, reactive, type App } from "vue";
import RuntimeArtGallery from "../vue/RuntimeArtGallery.vue";
import runtimeStyles from "../styles/runtime.scss?inline";

const RUNTIME_STYLE_ATTR = "data-scrollix-runtime-style";
const RUNTIME_MODULE_BASE_URL = new URL(/* @vite-ignore */ "./", import.meta.url).toString();

const ensureRuntimeStyle = (shadowRoot: ShadowRoot): void => {
  if (shadowRoot.querySelector(`style[${RUNTIME_STYLE_ATTR}]`)) return;
  const styleTag = document.createElement("style");
  styleTag.setAttribute(RUNTIME_STYLE_ATTR, "true");
  styleTag.textContent = runtimeStyles;
  shadowRoot.prepend(styleTag);
};

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
    ensureRuntimeStyle(shadowRoot);

    if (!this.mountNode) {
      this.mountNode = document.createElement("div");
      this.mountNode.className = "scrollix-runtime-host";
      shadowRoot.append(this.mountNode);
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
