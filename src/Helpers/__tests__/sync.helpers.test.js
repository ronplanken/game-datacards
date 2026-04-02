import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseSubscriptionLimitError, getDeviceId, runDebouncedSync } from "../sync.helpers";

describe("sync.helpers", () => {
  describe("parseSubscriptionLimitError", () => {
    it("parses a valid error message", () => {
      const result = parseSubscriptionLimitError("SUBSCRIPTION_LIMIT_EXCEEDED:categories:5:2;free");
      expect(result).toEqual({
        resource: "categories",
        current: 5,
        limit: 2,
        tier: "free",
      });
    });

    it("parses datasources error", () => {
      const result = parseSubscriptionLimitError("SUBSCRIPTION_LIMIT_EXCEEDED:datasources:10:2;premium");
      expect(result).toEqual({
        resource: "datasources",
        current: 10,
        limit: 2,
        tier: "premium",
      });
    });

    it("returns null for non-matching string", () => {
      expect(parseSubscriptionLimitError("some other error")).toBeNull();
    });

    it("returns null for null input", () => {
      expect(parseSubscriptionLimitError(null)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseSubscriptionLimitError("")).toBeNull();
    });
  });

  describe("getDeviceId", () => {
    beforeEach(() => {
      localStorage.removeItem("gdc-device-id");
    });

    it("generates a device ID when none exists", () => {
      const id = getDeviceId();
      expect(id).toBeTruthy();
      expect(id).toMatch(/^device-/);
    });

    it("returns the same ID on subsequent calls", () => {
      const id1 = getDeviceId();
      const id2 = getDeviceId();
      expect(id1).toBe(id2);
    });

    it("reads existing ID from localStorage", () => {
      localStorage.setItem("gdc-device-id", "device-existing-123");
      expect(getDeviceId()).toBe("device-existing-123");
    });
  });

  describe("runDebouncedSync", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("triggers syncFn after delay when new pending items appear", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set() };

      runDebouncedSync({
        items: [
          { uuid: "a", syncEnabled: true, syncStatus: "pending" },
          { uuid: "b", syncEnabled: true, syncStatus: "synced" },
        ],
        isPending: (item) => item.syncEnabled && item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      expect(syncFn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(2000);
      expect(syncFn).toHaveBeenCalledOnce();
    });

    it("does not trigger when no new pending items and timeout is active", () => {
      const syncFn = vi.fn();
      const existingTimeout = setTimeout(() => {}, 10000);
      const timeoutRef = { current: existingTimeout };
      const pendingRef = { current: new Set(["a"]) };

      runDebouncedSync({
        items: [{ uuid: "a", syncEnabled: true, syncStatus: "pending" }],
        isPending: (item) => item.syncEnabled && item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      vi.advanceTimersByTime(2000);
      expect(syncFn).not.toHaveBeenCalled();
    });

    it("reschedules when pending items exist but timeout was cleared by cleanup", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set(["a"]) };

      runDebouncedSync({
        items: [{ uuid: "a", syncEnabled: true, syncStatus: "pending" }],
        isPending: (item) => item.syncEnabled && item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      expect(syncFn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(2000);
      expect(syncFn).toHaveBeenCalledOnce();
    });

    it("does not trigger when no items match isPending", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set() };

      runDebouncedSync({
        items: [{ uuid: "a", syncEnabled: true, syncStatus: "synced" }],
        isPending: (item) => item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      vi.advanceTimersByTime(2000);
      expect(syncFn).not.toHaveBeenCalled();
    });

    it("returns cleanup function that clears timeout", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set() };

      const cleanup = runDebouncedSync({
        items: [{ uuid: "a", syncStatus: "pending" }],
        isPending: (item) => item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      cleanup();
      vi.advanceTimersByTime(2000);
      expect(syncFn).not.toHaveBeenCalled();
    });

    it("resets timer when new pending items appear before delay expires", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set() };

      // First call - item "a" is pending
      runDebouncedSync({
        items: [{ uuid: "a", syncStatus: "pending" }],
        isPending: (item) => item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      vi.advanceTimersByTime(1000);
      expect(syncFn).not.toHaveBeenCalled();

      // Second call - item "b" is now also pending
      runDebouncedSync({
        items: [
          { uuid: "a", syncStatus: "pending" },
          { uuid: "b", syncStatus: "pending" },
        ],
        isPending: (item) => item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      // After another 1000ms (total 2000ms from start), first timeout would have fired
      // but it was reset, so syncFn should not have been called yet
      vi.advanceTimersByTime(1000);
      expect(syncFn).not.toHaveBeenCalled();

      // After the full delay from the reset
      vi.advanceTimersByTime(1000);
      expect(syncFn).toHaveBeenCalledOnce();
    });

    it("updates pendingRef with current pending items", () => {
      const syncFn = vi.fn();
      const timeoutRef = { current: null };
      const pendingRef = { current: new Set() };

      runDebouncedSync({
        items: [
          { uuid: "a", syncStatus: "pending" },
          { uuid: "b", syncStatus: "pending" },
        ],
        isPending: (item) => item.syncStatus === "pending",
        getKey: (item) => item.uuid,
        syncFn,
        timeoutRef,
        pendingRef,
        delay: 2000,
      });

      expect(pendingRef.current).toEqual(new Set(["a", "b"]));
    });
  });
});
