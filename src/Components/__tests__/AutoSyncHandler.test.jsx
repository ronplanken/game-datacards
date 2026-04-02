import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { AutoSyncHandler } from "../AutoSyncHandler";

const mockSyncAll = vi.fn().mockResolvedValue({ success: true });
let mockCardStorage = { categories: [] };
let mockSyncState = { syncAll: mockSyncAll, isSyncing: false, globalSyncStatus: "idle" };

vi.mock("../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ cardStorage: mockCardStorage }),
}));

vi.mock("../../Premium", () => ({
  useSync: () => mockSyncState,
}));

describe("AutoSyncHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSyncAll.mockClear();
    mockCardStorage = { categories: [] };
    mockSyncState = { syncAll: mockSyncAll, isSyncing: false, globalSyncStatus: "idle" };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing", () => {
    const { container } = render(<AutoSyncHandler />);
    expect(container.innerHTML).toBe("");
  });

  it("does not sync when globalSyncStatus is disabled", () => {
    mockSyncState = { syncAll: mockSyncAll, isSyncing: false, globalSyncStatus: "disabled" };
    mockCardStorage = {
      categories: [{ uuid: "a", syncEnabled: true, syncStatus: "pending", localVersion: 2 }],
    };
    render(<AutoSyncHandler />);
    vi.advanceTimersByTime(5000);
    expect(mockSyncAll).not.toHaveBeenCalled();
  });

  it("does not sync when already syncing", () => {
    mockSyncState = { syncAll: mockSyncAll, isSyncing: true, globalSyncStatus: "idle" };
    mockCardStorage = {
      categories: [{ uuid: "a", syncEnabled: true, syncStatus: "pending", localVersion: 2 }],
    };
    render(<AutoSyncHandler />);
    vi.advanceTimersByTime(5000);
    expect(mockSyncAll).not.toHaveBeenCalled();
  });

  it("triggers sync after delay when pending categories exist", () => {
    mockCardStorage = {
      categories: [{ uuid: "a", syncEnabled: true, syncStatus: "pending", localVersion: 2 }],
    };
    render(<AutoSyncHandler />);
    expect(mockSyncAll).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(mockSyncAll).toHaveBeenCalledOnce();
  });

  it("does not sync categories where syncEnabled is false", () => {
    mockCardStorage = {
      categories: [{ uuid: "a", syncEnabled: false, syncStatus: "pending", localVersion: 2 }],
    };
    render(<AutoSyncHandler />);
    vi.advanceTimersByTime(5000);
    expect(mockSyncAll).not.toHaveBeenCalled();
  });

  it("does not sync categories that are already synced", () => {
    mockCardStorage = {
      categories: [{ uuid: "a", syncEnabled: true, syncStatus: "synced", localVersion: 1 }],
    };
    render(<AutoSyncHandler />);
    vi.advanceTimersByTime(5000);
    expect(mockSyncAll).not.toHaveBeenCalled();
  });
});
