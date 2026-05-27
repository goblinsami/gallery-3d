# Scrollix Art Gallery Runtime

Portable runtime Web Component for the JSON-driven 3D gallery.

## Build outputs

- `dist/scrollix-art-gallery-runtime.js`
- `dist/images/*`
- `dist/fonts/*`

## Registered element

- `<scrollix-art-gallery>`

## Usage

```html
<script type="module" src="/runtime/<version>/scrollix-art-gallery-runtime.js"></script>
<script>
  window.ScrollixArtGalleryRuntime.init()
</script>

<scrollix-art-gallery config-json='{"sceneTitle":"My Gallery"}'></scrollix-art-gallery>
```

Notes:

- Styles are injected inside the component `shadowRoot` at runtime (no external CSS file required).
- For production deployments, use versioned runtime paths and drive the current release with `/runtime/latest.json`.
