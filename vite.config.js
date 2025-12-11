import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    target: "es6",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "Live2dRender",
      fileName: (format) => `live2d-render.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    minify: true,
    sourcemap: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@framework": path.resolve(__dirname, "../../../Framework/src"),
    },
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    open: false,
    compress: true,
    watch: {
      usePolling: true,
    },
  },
  plugins: [],
});
