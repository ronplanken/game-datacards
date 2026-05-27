import { describe, it, expect, beforeEach } from "vitest";
import { vi } from "vitest";

const recent = () => Math.floor(Date.now() / 1000) - 3600;

// notifications.js merges in bundled release notes via releaseNotes.js, which
// reads the JSON at import time — so mock the bundle. Factory is hoisted, so
// compute timestamps inline.
vi.mock("../../data/releaseNotes.json", () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    default: [{ version: "3.10.3", title: "A fix", body: "b", severity: "info", timestamp: now - 100 }],
  };
});

import {
  buildNotificationItems,
  countUnreadNotifications,
  getUpdateNotification,
  isNotificationUnread,
  isUpdateRead,
  markUpdateRead,
} from "../notifications";

beforeEach(() => {
  sessionStorage.clear();
});

describe("getUpdateNotification", () => {
  it("returns a nudge only for patch releases", () => {
    const item = getUpdateNotification("patch");
    expect(item).toMatchObject({ source: "update", key: "update-available", severity: "info" });
    expect(item.title).toMatch(/new version/i);
    expect(getUpdateNotification("minor")).toBeNull();
    expect(getUpdateNotification("none")).toBeNull();
  });
});

describe("isUpdateRead / markUpdateRead", () => {
  it("is unread until the detected version is marked read", () => {
    expect(isUpdateRead("3.10.3")).toBe(false);
    markUpdateRead("3.10.3");
    expect(isUpdateRead("3.10.3")).toBe(true);
  });

  it("a newer detected version is unread again", () => {
    markUpdateRead("3.10.3");
    expect(isUpdateRead("3.10.4")).toBe(false);
  });

  it("treats a missing version as not read", () => {
    expect(isUpdateRead(null)).toBe(false);
    markUpdateRead(null);
    expect(sessionStorage.getItem("update-bell-read-version")).toBeNull();
  });
});

describe("buildNotificationItems", () => {
  it("merges remote, release, and update sources newest first", () => {
    const now = Math.floor(Date.now() / 1000);
    const messages = [{ id: 1, title: "Remote", body: "b", timestamp: now - 5000 }];
    const items = buildNotificationItems(messages, getUpdateNotification("patch"));

    expect(items.map((i) => i.source)).toEqual(["update", "release", "remote"]);
    expect(items[0].key).toBe("update-available");
  });

  it("omits the update item when there is none", () => {
    const items = buildNotificationItems([], getUpdateNotification("none"));
    expect(items.some((i) => i.source === "update")).toBe(false);
  });
});

describe("isNotificationUnread", () => {
  const settings = { lastReadReleaseVersion: "3.10.2", serviceMessage: 0 };

  it("treats the update nudge as unread until marked read", () => {
    const item = getUpdateNotification("patch");
    expect(isNotificationUnread(item, settings, "3.10.3")).toBe(true);
    markUpdateRead("3.10.3");
    expect(isNotificationUnread(item, settings, "3.10.3")).toBe(false);
  });

  it("dispatches release notes to the version cursor", () => {
    const note = { source: "release", version: "3.10.3", timestamp: recent() };
    expect(isNotificationUnread(note, settings, null)).toBe(true);
    expect(isNotificationUnread(note, { ...settings, lastReadReleaseVersion: "3.10.3" }, null)).toBe(false);
  });

  it("dispatches remote messages to the id cursor and recency", () => {
    const msg = { source: "remote", id: 5, timestamp: recent() };
    expect(isNotificationUnread(msg, settings, null)).toBe(true);
    expect(isNotificationUnread(msg, { ...settings, serviceMessage: 5 }, null)).toBe(false);
  });
});

describe("countUnreadNotifications", () => {
  const settings = { lastReadReleaseVersion: "3.10.2", serviceMessage: 0 };

  it("counts update + release + recent active remote, matching the rendered list", () => {
    const messages = [{ id: 1, timestamp: recent() }];
    expect(countUnreadNotifications(messages, settings, "patch", "3.10.3")).toBe(3);
  });

  it("excludes inactive and stale remote messages, like the dropdown does", () => {
    const stale = Math.floor(Date.now() / 1000) - 8 * 86400;
    const messages = [
      { id: 1, timestamp: recent(), active: false },
      { id: 2, timestamp: stale },
    ];
    // Only the bundled release note (3.10.3) is unread; no update nudge.
    expect(countUnreadNotifications(messages, settings, "none", null)).toBe(1);
  });

  it("drops the update from the count once it is marked read", () => {
    markUpdateRead("3.10.3");
    expect(countUnreadNotifications([], settings, "patch", "3.10.3")).toBe(1);
  });
});
