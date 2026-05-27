import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../NotificationBell.css", () => ({}));

// No remote messages or release notes here; this file exercises the client
// "reload to update" nudge for patch releases.
vi.mock("../../Helpers/external.helpers", () => ({
  getMessages: () => Promise.resolve({ messages: [], lastMessageId: 0 }),
}));
vi.mock("../../data/releaseNotes.json", () => ({ default: [] }));

const mockUpdateSettings = vi.fn();
let mockSettings = { serviceMessage: 0, lastReadReleaseVersion: "3.10.2" };
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockSettings, updateSettings: mockUpdateSettings }),
}));

const mockReload = vi.fn();
let mockUpdate = { updateKind: "patch", latestVersion: "3.10.3", reload: mockReload };
vi.mock("../../Hooks/useUpdateCheck", () => ({
  useUpdateCheck: () => mockUpdate,
}));

import { NotificationBell } from "../NotificationBell";

describe("NotificationBell update nudge", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUpdateSettings.mockReset();
    mockReload.mockReset();
    mockSettings = { serviceMessage: 0, lastReadReleaseVersion: "3.10.2" };
    mockUpdate = { updateKind: "patch", latestVersion: "3.10.3", reload: mockReload };
    vi.stubEnv("VITE_VERSION", "3.10.2");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    cleanup();
  });

  it("shows a reload line in the dropdown for a patch release", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(document.querySelector(".notification-bell-btn"));
    await waitFor(() => {
      expect(screen.getByText("A new version is available")).toBeInTheDocument();
      expect(screen.getByText("Reload")).toBeInTheDocument();
    });
  });

  it("bumps the unread badge", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("reloads when the Reload button is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(document.querySelector(".notification-bell-btn"));
    await user.click(await screen.findByText("Reload"));
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("marks the nudge read on Mark all read", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(document.querySelector(".notification-bell-btn"));
    await user.click(await screen.findByText("Mark all read"));
    expect(sessionStorage.getItem("update-bell-read-version")).toBe("3.10.3");
  });

  it("shows no nudge when there is no patch release", async () => {
    mockUpdate = { updateKind: "none", latestVersion: null, reload: mockReload };
    render(<NotificationBell />);
    await waitFor(() => {
      expect(document.querySelector(".notification-badge")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("A new version is available")).not.toBeInTheDocument();
  });
});
