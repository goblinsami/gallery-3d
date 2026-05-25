import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2020",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ScrollixArtGalleryRuntime",
      fileName: () => "scrollix-art-gallery-runtime.js",
      formats: ["es"],
    },
    cssCodeSplit: false,
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "scrollix-art-gallery-runtime.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  publicDir: path.resolve(__dirname, "public"),
});

