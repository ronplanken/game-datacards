import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

// ============================================
// useDebounce
// ============================================
describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 300 });

    // Value should still be initial immediately after change
    expect(result.current).toBe("initial");

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now value should be updated
    expect(result.current).toBe("updated");
  });

  it("should cancel previous timeout on new value", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "first-change", delay: 300 });

    // Advance partially
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Change value again before timeout completes
    rerender({ value: "second-change", delay: 300 });

    // Advance by another 200ms (350ms total since first change)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Value should still be initial because timer was reset
    expect(result.current).toBe("initial");

    // Advance remaining time (100ms more = 300ms since second change)
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now should be the second change value
    expect(result.current).toBe("second-change");
  });

  it("should use default delay of 150ms when not specified", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Advance by 100ms - not enough
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("initial");

    // Advance by 50ms more (150ms total)
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe("updated");
  });

  it("should handle null values", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: null, delay: 100 },
    });

    expect(result.current).toBe(null);

    rerender({ value: "not null", delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe("not null");
  });

  it("should handle object values", () => {
    const initialObj = { name: "test" };
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialObj, delay: 100 },
    });

    expect(result.current).toEqual({ name: "test" });

    const newObj = { name: "updated", extra: true };
    rerender({ value: newObj, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ name: "updated", extra: true });
  });

  it("should handle rapid value changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 0, delay: 200 },
    });

    // Rapidly update value multiple times
    for (let i = 1; i <= 5; i++) {
      rerender({ value: i, delay: 200 });
      act(() => {
        jest.advanceTimersByTime(50);
      });
    }

    // Should still be initial value
    expect(result.current).toBe(0);

    // Wait for debounce to complete
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should be the last value
    expect(result.current).toBe(5);
  });

  it("should update immediately when delay changes to 0", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    rerender({ value: "updated", delay: 0 });

    // With 0 delay, should update immediately (after microtask/timer)
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe("updated");
  });
});
