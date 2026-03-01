import { renderHook, act } from "@testing-library/react";
import { useUmami } from "../useUmami";

describe("useUmami", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete window.umami;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    delete window.umami;
  });

  it("should return callable functions when window.umami is undefined", () => {
    const { result } = renderHook(() => useUmami());

    expect(() => result.current.trackEvent("test")).not.toThrow();
    expect(() => result.current.identify({ appVersion: "1.0" })).not.toThrow();
  });

  it("should call window.umami.track with name only", () => {
    window.umami = { track: jest.fn(), identify: jest.fn() };
    const { result } = renderHook(() => useUmami());

    act(() => {
      result.current.trackEvent("import-file");
    });

    expect(window.umami.track).toHaveBeenCalledWith("import-file", undefined);
  });

  it("should call window.umami.track with name and data", () => {
    window.umami = { track: jest.fn(), identify: jest.fn() };
    const { result } = renderHook(() => useUmami());

    act(() => {
      result.current.trackEvent("import-file", { format: "gdc-json" });
    });

    expect(window.umami.track).toHaveBeenCalledWith("import-file", { format: "gdc-json" });
  });

  it("should debounce trackEvent when debounceMs is provided", () => {
    window.umami = { track: jest.fn(), identify: jest.fn() };
    const { result } = renderHook(() => useUmami());

    act(() => {
      result.current.trackEvent("search-query", { queryLength: 1 }, { debounceMs: 1000 });
      result.current.trackEvent("search-query", { queryLength: 2 }, { debounceMs: 1000 });
      result.current.trackEvent("search-query", { queryLength: 3 }, { debounceMs: 1000 });
    });

    expect(window.umami.track).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(window.umami.track).toHaveBeenCalledTimes(1);
    expect(window.umami.track).toHaveBeenCalledWith("search-query", { queryLength: 3 });
  });

  it("should call window.umami.identify with data", () => {
    window.umami = { track: jest.fn(), identify: jest.fn() };
    const { result } = renderHook(() => useUmami());

    act(() => {
      result.current.identify({ appVersion: "3.3.0", device: "desktop" });
    });

    expect(window.umami.identify).toHaveBeenCalledWith({ appVersion: "3.3.0", device: "desktop" });
  });

  it("should handle umami removed mid-session gracefully", () => {
    window.umami = { track: jest.fn(), identify: jest.fn() };
    const { result } = renderHook(() => useUmami());

    act(() => {
      result.current.trackEvent("test-event");
    });

    expect(window.umami.track).toHaveBeenCalledTimes(1);

    delete window.umami;

    expect(() => {
      act(() => {
        result.current.trackEvent("another-event");
      });
    }).not.toThrow();
  });

  it("should return stable function references across renders", () => {
    const { result, rerender } = renderHook(() => useUmami());

    const firstTrackEvent = result.current.trackEvent;
    const firstIdentify = result.current.identify;

    rerender();

    expect(result.current.trackEvent).toBe(firstTrackEvent);
    expect(result.current.identify).toBe(firstIdentify);
  });
});
