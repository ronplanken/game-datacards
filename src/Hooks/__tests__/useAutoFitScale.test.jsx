// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoFitScale } from "../useAutoFitScale";

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

describe("useAutoFitScale", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const containerOf = (clientWidth) => ({ current: { clientWidth } });

  it("fits the card type width into the container", () => {
    const { result } = renderHook(() => useAutoFitScale(containerOf(1077 + 32), "unit", true));
    expect(result.current.autoScale).toBe(1);
    const half = renderHook(() => useAutoFitScale(containerOf(1077 / 2 + 32), "unit", true));
    expect(half.result.current.autoScale).toBeCloseTo(0.5, 5);
  });

  it("uses the template width when one is given", () => {
    const { result } = renderHook(() => useAutoFitScale(containerOf(540 + 32), "unit", true, 1080));
    expect(result.current.autoScale).toBeCloseTo(0.5, 5);
    const ignored = renderHook(() => useAutoFitScale(containerOf(540 + 32), "unit", true, null));
    expect(ignored.result.current.autoScale).toBeCloseTo(540 / 1077, 5);
  });

  it("returns 1 when disabled", () => {
    const { result } = renderHook(() => useAutoFitScale(containerOf(200), "unit", false, 1080));
    expect(result.current.autoScale).toBe(1);
  });
});
