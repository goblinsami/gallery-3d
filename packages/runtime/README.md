# Scrollix Art Gallery Runtime

Portable runtime Web Component for the JSON-driven 3D gallery.

## Build outputs

- `dist/scrollix-art-gallery-runtime.js`
- `dist/scrollix-art-gallery-runtime.css`
- `dist/images/*`
- `dist/fonts/*`

## Registered element

- `<scrollix-art-gallery>`

## Usage

```html
<script type="module" src="/scrollix-art-gallery-runtime.js"></script>
<script>
  window.ScrollixArtGalleryRuntime.init()
</script>

<scrollix-art-gallery config-json='{"sceneTitle":"My Gallery"}'></scrollix-art-gallery>
```

