import { ScrollixArtGalleryElement } from "./elements/scrollix-art-gallery.element";

export const SCROLLIX_ART_GALLERY_TAG = "scrollix-art-gallery";

export interface ScrollixArtGalleryRuntimeApi {
  init: () => ScrollixArtGalleryRuntimeApi;
  registerWebComponents: () => ScrollixArtGalleryRuntimeApi;
}

declare global {
  interface Window {
    ScrollixArtGalleryRuntime?: ScrollixArtGalleryRuntimeApi;
  }
}

let runtimeBootLogged = false;

const logRuntimeBoot = () => {
  if (runtimeBootLogged) return;
  runtimeBootLogged = true;
  console.log("[Scrollix Art Gallery] runtime booted");
};

const defineIfNeeded = (tagName: string, constructor: CustomElementConstructor) => {
  if (window.customElements.get(tagName)) return;
  window.customElements.define(tagName, constructor);
  console.log(`[Scrollix Art Gallery] ${tagName} registered`);
};

export const registerWebComponents = (): ScrollixArtGalleryRuntimeApi => {
  if (typeof window === "undefined") return runtimeApi;

  try {
    defineIfNeeded(SCROLLIX_ART_GALLERY_TAG, ScrollixArtGalleryElement);
  } catch (error) {
    if (!window.customElements.get(SCROLLIX_ART_GALLERY_TAG)) {
      throw error;
    }
  }

  return runtimeApi;
};

export const init = (): ScrollixArtGalleryRuntimeApi => {
  registerWebComponents();
  return runtimeApi;
};

const runtimeApi: ScrollixArtGalleryRuntimeApi = {
  init,
  registerWebComponents,
};

export const ensureWindowRuntimeApi = (): ScrollixArtGalleryRuntimeApi => {
  if (typeof window === "undefined") return runtimeApi;

  logRuntimeBoot();

  if (window.ScrollixArtGalleryRuntime) {
    return window.ScrollixArtGalleryRuntime;
  }

  window.ScrollixArtGalleryRuntime = runtimeApi;
  return runtimeApi;
};

