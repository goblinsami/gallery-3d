import { ensureWindowRuntimeApi, type ScrollixArtGalleryRuntimeApi } from "./bootstrap";

const runtimeApi: ScrollixArtGalleryRuntimeApi = ensureWindowRuntimeApi();
runtimeApi.registerWebComponents();

export { runtimeApi as ScrollixArtGalleryRuntime };
export { SCROLLIX_ART_GALLERY_TAG, ensureWindowRuntimeApi } from "./bootstrap";
export { init, registerWebComponents } from "./bootstrap";
export type { ScrollixArtGalleryRuntimeApi } from "./bootstrap";
