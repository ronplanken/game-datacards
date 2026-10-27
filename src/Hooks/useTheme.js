import { useEffect, useState } from "react";
import { useOptionalSettingsStorage } from "./useSettingsStorage";
import { applyTheme, getSystemPrefersDark, normalizeThemePreference, resolveTheme } from "../Helpers/theme.helpers";

export function useTheme() {
  const context = useOptionalSettingsStorage();
  const preference = normalizeThemePreference(context?.settings?.theme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => getSystemPrefersDark());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setSystemPrefersDark(event.matches);
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }
    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);

  const theme = resolveTheme(preference, systemPrefersDark);

  const setPreference = (next) => {
    if (!context?.updateSettings) return;
    context.updateSettings((prev) => ({ ...prev, theme: normalizeThemePreference(next) }));
  };

  return { preference, theme, isDark: theme === "dark", setPreference };
}

export const ThemeController = () => {
  const { theme } = useTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
};
