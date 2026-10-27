import React from "react";
import { act, render, renderHook } from "@testing-library/react";
import { ThemeController, useTheme } from "../useTheme";
import { SettingsStorageProviderComponent } from "../useSettingsStorage";

const createMatchMedia = (initialMatches) => {
  const listeners = new Set();
  const query = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_event, listener) => listeners.add(listener),
    removeEventListener: (_event, listener) => listeners.delete(listener),
  };
  return {
    matchMedia: vi.fn(() => query),
    setMatches: (matches) => {
      query.matches = matches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
};

const wrapper = ({ children }) => <SettingsStorageProviderComponent>{children}</SettingsStorageProviderComponent>;

describe("useTheme", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to the light theme", () => {
    window.matchMedia = createMatchMedia(true).matchMedia;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.preference).toBe("light");
    expect(result.current.theme).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("reads the stored preference", () => {
    localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
    window.matchMedia = createMatchMedia(false).matchMedia;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("stores a new preference in settings", () => {
    window.matchMedia = createMatchMedia(false).matchMedia;
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setPreference("dark"));

    expect(result.current.preference).toBe("dark");
    expect(result.current.theme).toBe("dark");
    expect(JSON.parse(localStorage.getItem("settings")).theme).toBe("dark");
  });

  it("follows the system setting and reacts to changes", () => {
    const media = createMatchMedia(false);
    window.matchMedia = media.matchMedia;
    localStorage.setItem("settings", JSON.stringify({ theme: "system" }));
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");

    act(() => media.setMatches(true));
    expect(result.current.theme).toBe("dark");

    act(() => media.setMatches(false));
    expect(result.current.theme).toBe("light");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("settings", JSON.stringify({ theme: "neon" }));
    window.matchMedia = createMatchMedia(true).matchMedia;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.preference).toBe("light");
    expect(result.current.theme).toBe("light");
  });

  it("works without a settings provider", () => {
    window.matchMedia = createMatchMedia(true).matchMedia;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(() => result.current.setPreference("dark")).not.toThrow();
  });
});

describe("ThemeController", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = createMatchMedia(false).matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("applies the resolved theme to the document", () => {
    localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
    render(
      <SettingsStorageProviderComponent>
        <ThemeController />
      </SettingsStorageProviderComponent>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("switches the document theme when the preference changes", () => {
    let api;
    const Probe = () => {
      api = useTheme();
      return null;
    };
    render(
      <SettingsStorageProviderComponent>
        <ThemeController />
        <Probe />
      </SettingsStorageProviderComponent>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    act(() => api.setPreference("dark"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    act(() => api.setPreference("light"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
