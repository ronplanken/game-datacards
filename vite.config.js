import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

const usePremiumPackage = process.env.VITE_USE_PREMIUM_PACKAGE === "true";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["stream", "timers", "buffer", "util", "events"],
      globals: { process: true, Buffer: true },
    }),
  ],
  resolve: {
    alias: {
      // Force all react imports to use the same instance
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
      // Premium package aliases (when enabled)
      ...(usePremiumPackage
        ? {
            "./Premium": "@gdc/premium",
            "../Premium": "@gdc/premium",
            "../../Premium": "@gdc/premium",
          }
        : {}),
    },
    dedupe: ["react", "react-dom"],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
