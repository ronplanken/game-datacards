module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ["plugin:react/recommended", "plugin:react/jsx-runtime", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": ["error", { jsxBracketSameLine: true, endOfLine: "auto" }],
    "react/prop-types": ["off"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
