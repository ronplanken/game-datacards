import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import fs from "fs";

const usePremiumPackage = process.env.VITE_USE_PREMIUM_PACKAGE === "true";
const mainAppSrc = path.resolve(__dirname, "src");

// Detect premium package location and resolve symlinks for consistent path matching
function getPremiumPackagePath() {
  const nodeModulesPath = path.resolve(__dirname, "node_modules/@gdc/premium/src");
  const linkedPath = path.resolve(__dirname, "../gdc-premium/src");

  if (fs.existsSync(nodeModulesPath)) {
    // Resolve symlinks to get the actual path (important for yarn link scenarios)
    try {
      return fs.realpathSync(nodeModulesPath);
    } catch {
      return nodeModulesPath;
    }
  }
  return linkedPath;
}

const premiumPackagePath = getPremiumPackagePath();

// Plugin to resolve imports from gdc-premium to main app's src and node_modules
function premiumPackageResolver() {
  const extensions = ["", ".js", ".jsx", ".ts", ".tsx", ".png", ".jpg", ".svg", "/index.js", "/index.jsx"];
  const mainNodeModules = path.resolve(__dirname, "node_modules");

  // Debug: log paths at plugin init
  console.log("[premium-resolver] Plugin initialized");
  console.log("[premium-resolver] premiumPackagePath:", premiumPackagePath);
  console.log("[premium-resolver] mainAppSrc:", mainAppSrc);
  console.log("[premium-resolver] __dirname:", __dirname);

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

      // Debug: log ALL imports from premium package
      if (source.startsWith("..") || source.startsWith("./")) {
        console.log("[premium-resolver] Processing:", source, "from:", importer?.substring(importer.indexOf("@gdc")));
      }

      // Handle relative imports
      if (source.startsWith("..") || source.startsWith("./")) {
        const importerDir = path.dirname(importer);
        const resolvedPath = path.resolve(importerDir, source);

        // Check if file exists in gdc-premium
        const existsInPremium = fileExists(resolvedPath);
        console.log("[premium-resolver]   existsInPremium:", existsInPremium ? "YES" : "NO", resolvedPath?.substring(resolvedPath.indexOf("@gdc")));

        if (existsInPremium) {
          return null; // Let Vite handle it normally
        }

        // File doesn't exist in gdc-premium, try to find it in main app
        const relativeToPremium = path.relative(premiumPackagePath, resolvedPath);
        const mainAppPath = path.resolve(mainAppSrc, relativeToPremium);

        const existsInMainApp = fileExists(mainAppPath);

        // Debug: log resolution attempt for files not found in premium
        console.log("[premium-resolver]   relativeToPremium:", relativeToPremium);
        console.log("[premium-resolver]   mainAppPath:", mainAppPath);
        console.log("[premium-resolver]   existsInMainApp:", existsInMainApp ? "YES -> " + existsInMainApp : "NO");

        if (existsInMainApp) {
          return existsInMainApp;
        }
      }

      // Handle bare module imports (npm packages) - resolve from main app's context
      if (!source.startsWith(".") && !source.startsWith("/")) {
        // Use Vite's resolver with main app as the importer context
        return this.resolve(source, mainAppSrc + "/index.jsx", { skipSelf: true });
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
    commonjsOptions: {
      include: [/node_modules/, /gdc-premium/],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react", "uuid"],
  },
});
