import {
  applyTheme,
  DEFAULT_THEME_PREFERENCE,
  getSystemPrefersDark,
  normalizeThemePreference,
  resolveTheme,
  THEME_COLOR_META,
  THEME_PREFERENCES,
} from "../theme.helpers";

describe("normalizeThemePreference", () => {
  it("keeps known preferences", () => {
    THEME_PREFERENCES.forEach((preference) => {
      expect(normalizeThemePreference(preference)).toBe(preference);
    });
  });

  it("falls back to the default for unknown values", () => {
    expect(normalizeThemePreference(undefined)).toBe(DEFAULT_THEME_PREFERENCE);
    expect(normalizeThemePreference("sepia")).toBe(DEFAULT_THEME_PREFERENCE);
    expect(normalizeThemePreference(null)).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it("defaults to light", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("light");
  });
});

describe("resolveTheme", () => {
  it("returns explicit choices regardless of the system setting", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system setting for system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("treats unknown preferences as light", () => {
    expect(resolveTheme("unknown", true)).toBe("light");
  });
});

describe("getSystemPrefersDark", () => {
  it("returns false without matchMedia", () => {
    expect(getSystemPrefersDark({})).toBe(false);
    expect(getSystemPrefersDark(undefined)).toBe(false);
  });

  it("reads the prefers-color-scheme media query", () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    expect(getSystemPrefersDark({ matchMedia })).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });
});

describe("applyTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it("sets the data-theme attribute and color-scheme", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("treats anything other than dark as light", () => {
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("updates the theme-color meta tag", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", "#000000");
    document.head.appendChild(meta);

    applyTheme("dark");
    expect(meta.getAttribute("content")).toBe(THEME_COLOR_META.dark);

    applyTheme("light");
    expect(meta.getAttribute("content")).toBe(THEME_COLOR_META.light);
  });

  it("does nothing without a document", () => {
    expect(() => applyTheme("dark", {})).not.toThrow();
  });
});
