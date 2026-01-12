const CracoLessPlugin = require("craco-less");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

// Use premium package when env var is set (Cloudflare build)
const usePremiumPackage = process.env.REACT_APP_USE_PREMIUM_PACKAGE === "true";

module.exports = {
  webpack: {
    plugins: {
      add: [
        new NodePolyfillPlugin({
          excludeAliases: ["console"],
        }),
      ],
    },
    alias: usePremiumPackage
      ? {
          // Redirect src/Premium to @gdc/premium package
          [path.resolve(__dirname, "src/Premium")]: "@gdc/premium",
        }
      : {},
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
