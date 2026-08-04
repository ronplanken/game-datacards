import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../NotificationBell.css", () => ({}));

// No remote messages here; this file exercises the bundled release-notes channel.
vi.mock("../../Helpers/external.helpers", () => ({
  getMessages: () => Promise.resolve({ messages: [], lastMessageId: 0 }),
}));

const mockUpdateSettings = vi.fn();
let mockSettings = { serviceMessage: 0, lastReadReleaseVersion: "0.0.0" };
vi.mock("../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockSettings, updateSettings: mockUpdateSettings }),
}));

// Real releaseNotes helper runs against this mocked bundle. The factory is
// hoisted, so compute timestamps inline rather than referencing a helper.
vi.mock("../../data/releaseNotes.json", () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    default: [
      { version: "3.9.1", title: "First fix", body: "Something used to break. Now it works.", timestamp: now - 3600 },
      { version: "3.9.2", title: "Second fix", body: "Another fix.", severity: "info", timestamp: now - 3590 },
    ],
  };
});

import { NotificationBell } from "../NotificationBell";

describe("NotificationBell release notes", () => {
  beforeEach(() => {
    mockUpdateSettings.mockReset();
    mockSettings = { serviceMessage: 0, lastReadReleaseVersion: "3.9.0" };
    vi.stubEnv("VITE_VERSION", "3.9.2");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    cleanup();
  });

  it("renders bundled release notes in the dropdown, newest first", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(document.querySelector(".notification-bell-btn"));
    await waitFor(() => {
      expect(screen.getByText("First fix")).toBeInTheDocument();
      expect(screen.getByText("Second fix")).toBeInTheDocument();
    });
    const titles = screen.getAllByText(/fix$/).map((n) => n.textContent);
    expect(titles).toEqual(["Second fix", "First fix"]);
  });

  it("badges unread release notes newer than the last read version", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows no badge once the last read version covers all notes", async () => {
    mockSettings = { serviceMessage: 0, lastReadReleaseVersion: "3.9.2" };
    render(<NotificationBell />);
    await waitFor(() => {
      expect(document.querySelector(".notification-badge")).not.toBeInTheDocument();
    });
  });

  it("marks release notes read by recording the current version", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(document.querySelector(".notification-bell-btn"));
    await user.click(await screen.findByText("Mark all read"));
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ serviceMessage: 0, lastReadReleaseVersion: "3.9.2" }),
    );
  });
});
