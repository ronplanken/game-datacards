export const THEME_PREFERENCES = ["light", "dark", "system"];

export const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export const DEFAULT_THEME_PREFERENCE = "light";

export const THEME_COLOR_META = {
  light: "#000000",
  dark: "#0b1220",
};

export const normalizeThemePreference = (preference) =>
  THEME_PREFERENCES.includes(preference) ? preference : DEFAULT_THEME_PREFERENCE;

export const resolveTheme = (preference, systemPrefersDark) => {
  const normalized = normalizeThemePreference(preference);
  if (normalized === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return normalized;
};

export const getSystemPrefersDark = (win = typeof window !== "undefined" ? window : undefined) => {
  if (!win || typeof win.matchMedia !== "function") return false;
  return win.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const applyTheme = (theme, doc = typeof document !== "undefined" ? document : undefined) => {
  if (!doc?.documentElement) return;
  const resolved = theme === "dark" ? "dark" : "light";
  doc.documentElement.setAttribute("data-theme", resolved);
  doc.documentElement.style.colorScheme = resolved;
  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR_META[resolved]);
};
