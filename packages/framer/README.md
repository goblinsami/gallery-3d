# Scrollix Art Gallery Framer Wrapper

`ScrollixArtGallery.tsx` is a Framer Code Component wrapper for the standalone runtime.

Responsibilities:

- reads Framer property controls
- starts from sample defaults (`DayLight galery` / `Mistery Museum`)
- allows manual override for scene, camera, timings, artworks and side text
- supports raw `customConfigJson` override
- renders `<scrollix-art-gallery config-json="...">`

Runtime:

- loads ESM script URL (`scrollix-art-gallery-runtime.js`)
- waits for custom element registration
- shows loading/error placeholders if runtime is unavailable

