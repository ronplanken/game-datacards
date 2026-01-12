import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import fs from "fs";

const usePremiumPackage = process.env.VITE_USE_PREMIUM_PACKAGE === "true";
const mainAppSrc = path.resolve(__dirname, "src");
const premiumPackagePath = path.resolve(__dirname, "../gdc-premium/src");

// Plugin to resolve imports from gdc-premium to main app's src
function premiumPackageResolver() {
  const extensions = ["", ".js", ".jsx", ".ts", ".tsx", ".png", ".jpg", ".svg", "/index.js", "/index.jsx"];

  function fileExists(basePath) {
    for (const ext of extensions) {
      if (fs.existsSync(basePath + ext)) {
        return basePath + ext;
      }
    }
    return null;
  }

  return {
    name: "premium-package-resolver",
    enforce: "pre",
    resolveId(source, importer) {
      // Only process imports from the premium package
      if (!importer || !importer.includes("gdc-premium")) {
        return null;
      }

      // Handle relative imports
      if (source.startsWith("..") || source.startsWith("./")) {
        const importerDir = path.dirname(importer);
        const resolvedPath = path.resolve(importerDir, source);

        // Check if file exists in gdc-premium
        const existsInPremium = fileExists(resolvedPath);
        if (existsInPremium) {
          return null; // Let Vite handle it normally
        }

        // File doesn't exist in gdc-premium, try to find it in main app
        const relativeToPremium = path.relative(premiumPackagePath, resolvedPath);
        const mainAppPath = path.resolve(mainAppSrc, relativeToPremium);

        const existsInMainApp = fileExists(mainAppPath);
        if (existsInMainApp) {
          return existsInMainApp;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["stream", "timers", "buffer", "util", "events"],
      globals: { process: true, Buffer: true },
    }),
    ...(usePremiumPackage ? [premiumPackageResolver()] : []),
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
