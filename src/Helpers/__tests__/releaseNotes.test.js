import { describe, it, expect, vi } from "vitest";

const recent = () => Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
const old = () => Math.floor(Date.now() / 1000) - 8 * 86400; // 8 days ago

// The helper reads the bundled JSON at import time, so mock that module. The
// factory is hoisted above the helpers above, so compute timestamps inline.
vi.mock("../../data/releaseNotes.json", () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    default: [
      { version: "3.9.1", title: "Older fix", body: "b", timestamp: now - 3700 },
      { version: "3.9.3", title: "Newest fix", body: "b", severity: "info", timestamp: now - 3600 },
      { version: "3.9.2", title: "Middle fix", body: "b", timestamp: now - 3650 },
    ],
  };
});

import { getReleaseNotes, isReleaseNoteUnread, countUnreadReleaseNotes } from "../releaseNotes";

describe("getReleaseNotes", () => {
  it("sorts newest first and normalises shape", () => {
    const notes = getReleaseNotes();
    expect(notes.map((n) => n.version)).toEqual(["3.9.3", "3.9.2", "3.9.1"]);
    expect(notes[0]).toMatchObject({ source: "release", key: "release-3.9.3" });
  });
});

describe("isReleaseNoteUnread", () => {
  it("is unread when newer than last read and recent", () => {
    expect(isReleaseNoteUnread({ version: "3.9.3", timestamp: recent() }, "3.9.2")).toBe(true);
  });

  it("is read when version is not newer than last read", () => {
    expect(isReleaseNoteUnread({ version: "3.9.2", timestamp: recent() }, "3.9.2")).toBe(false);
    expect(isReleaseNoteUnread({ version: "3.9.1", timestamp: recent() }, "3.9.2")).toBe(false);
  });

  it("is read when older than the recency window", () => {
    expect(isReleaseNoteUnread({ version: "3.9.9", timestamp: old() }, "0.0.0")).toBe(false);
  });

  it("respects active:false and invalid versions", () => {
    expect(isReleaseNoteUnread({ version: "3.9.9", timestamp: recent(), active: false }, "0.0.0")).toBe(false);
    expect(isReleaseNoteUnread({ version: "not-a-version", timestamp: recent() }, "0.0.0")).toBe(false);
  });

  it("treats a missing/invalid last-read version as 0.0.0", () => {
    expect(isReleaseNoteUnread({ version: "3.9.1", timestamp: recent() }, undefined)).toBe(true);
  });
});

describe("countUnreadReleaseNotes", () => {
  it("counts bundled notes newer than the last read version", () => {
    expect(countUnreadReleaseNotes("3.9.1")).toBe(2); // 3.9.2 and 3.9.3
    expect(countUnreadReleaseNotes("3.9.3")).toBe(0);
    expect(countUnreadReleaseNotes("0.0.0")).toBe(3);
  });
});
