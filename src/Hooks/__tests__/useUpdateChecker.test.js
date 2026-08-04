import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUpdateChecker } from "../useUpdateChecker";

describe("useUpdateChecker", () => {
  const CURRENT_BUILD_ID = "test123";
  const NEW_BUILD_ID = "test456";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("DEV", "");
    vi.stubEnv("VITE_BUILD_ID", CURRENT_BUILD_ID);
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("does not show update when buildId matches", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.5.0", buildId: CURRENT_BUILD_ID }),
    });

    const { result } = renderHook(() => useUpdateChecker());

    // Advance past initial delay
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("shows update when buildId differs", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.6.0", buildId: NEW_BUILD_ID }),
    });

    const { result } = renderHook(() => useUpdateChecker());

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateAvailable).toBe(true);
    expect(result.current.latestVersion).toBe("3.6.0");
  });

  it("dismiss hides the banner and persists in sessionStorage", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.6.0", buildId: NEW_BUILD_ID }),
    });

    const { result } = renderHook(() => useUpdateChecker());

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateAvailable).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.updateAvailable).toBe(false);
    expect(sessionStorage.getItem("update-dismissed-build")).toBe(NEW_BUILD_ID);
  });

  it("does not show update if buildId was dismissed", async () => {
    sessionStorage.setItem("update-dismissed-build", NEW_BUILD_ID);

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.6.0", buildId: NEW_BUILD_ID }),
    });

    const { result } = renderHook(() => useUpdateChecker());

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("reload calls window.location.reload", () => {
    const reloadMock = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload: reloadMock });

    const { result } = renderHook(() => useUpdateChecker());

    act(() => {
      result.current.reload();
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("silently handles fetch errors", async () => {
    fetch.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useUpdateChecker());

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("polls on interval after initial delay", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.5.0", buildId: CURRENT_BUILD_ID }),
    });

    renderHook(() => useUpdateChecker());

    // Initial delay
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    // First poll interval
    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("checks on visibility change with cooldown", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "3.5.0", buildId: CURRENT_BUILD_ID }),
    });

    renderHook(() => useUpdateChecker());

    // Advance past initial delay to trigger first check
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    // Simulate visibility change immediately — should be within cooldown
    await act(async () => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetch).toHaveBeenCalledTimes(1); // No extra call — cooldown

    // Advance past cooldown (61s > 60s threshold) but well under 5min poll interval
    await act(async () => {
      vi.advanceTimersByTime(61_000);
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetch).toHaveBeenCalledTimes(2); // Now it checks
  });
});
