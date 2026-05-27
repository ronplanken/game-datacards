import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { classifyUpdate, UpdateCheckProvider, useUpdateCheck } from "../useUpdateCheck";

describe("classifyUpdate", () => {
  it("flags a minor bump as a feature release", () => {
    expect(classifyUpdate("3.11.0", "3.10.2")).toBe("minor");
  });

  it("flags a major bump as a feature release", () => {
    expect(classifyUpdate("4.0.0", "3.10.2")).toBe("minor");
  });

  it("flags a patch bump as a quiet patch", () => {
    expect(classifyUpdate("3.10.3", "3.10.2")).toBe("patch");
  });

  it("returns none for the same version", () => {
    expect(classifyUpdate("3.10.2", "3.10.2")).toBe("none");
  });

  it("returns none for a downgrade", () => {
    expect(classifyUpdate("3.10.1", "3.10.2")).toBe("none");
    expect(classifyUpdate("3.9.9", "3.10.0")).toBe("none");
  });

  it("returns none for unparseable versions", () => {
    expect(classifyUpdate("not-a-version", "3.10.2")).toBe("none");
    expect(classifyUpdate("3.10.3", undefined)).toBe("none");
  });
});

describe("UpdateCheckProvider", () => {
  const renderProvider = () => renderHook(() => useUpdateCheck(), { wrapper: UpdateCheckProvider });

  const mockVersion = (version) => fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ version }) });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("DEV", "");
    vi.stubEnv("VITE_VERSION", "3.10.2");
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("detects a feature (minor) release and shows the banner", async () => {
    mockVersion("3.11.0");
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateKind).toBe("minor");
    expect(result.current.latestVersion).toBe("3.11.0");
    expect(result.current.showBanner).toBe(true);
  });

  it("detects a patch release without showing the banner", async () => {
    mockVersion("3.10.3");
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateKind).toBe("patch");
    expect(result.current.showBanner).toBe(false);
  });

  it("stays quiet when the deployed version matches", async () => {
    mockVersion("3.10.2");
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateKind).toBe("none");
    expect(result.current.showBanner).toBe(false);
  });

  it("dismissBanner hides the banner and persists per version", async () => {
    mockVersion("3.11.0");
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.showBanner).toBe(true);

    act(() => {
      result.current.dismissBanner();
    });

    expect(result.current.showBanner).toBe(false);
    expect(sessionStorage.getItem("update-banner-dismissed-version")).toBe("3.11.0");
  });

  it("does not show the banner for a version already dismissed", async () => {
    sessionStorage.setItem("update-banner-dismissed-version", "3.11.0");
    mockVersion("3.11.0");
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateKind).toBe("minor");
    expect(result.current.showBanner).toBe(false);
  });

  it("silently handles fetch errors", async () => {
    fetch.mockRejectedValue(new Error("network error"));
    const { result } = renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateKind).toBe("none");
  });

  it("polls on the interval after the initial delay", async () => {
    mockVersion("3.10.2");
    renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("checks on visibility change with a cooldown", async () => {
    mockVersion("3.10.2");
    renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetch).toHaveBeenCalledTimes(1); // within cooldown

    await act(async () => {
      vi.advanceTimersByTime(61_000);
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
