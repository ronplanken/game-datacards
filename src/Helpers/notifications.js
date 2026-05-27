import { getReleaseNotes, isReleaseNoteUnread, isRecent } from "./releaseNotes";

// The notification bell merges three sources, newest first:
//   - "remote"  operational messages from VITE_MESSAGES_URL (unread by id cursor)
//   - "release" bundled patch notes from releaseNotes.json (unread by version)
//   - "update"  a client-detected "reload to update" nudge for patch releases
// This module owns the merge and the per-source unread test so the desktop bell,
// the mobile sheet, and the mobile badge stay in sync. See useUpdateCheck.jsx for
// how the update kind is detected and docs/release-notifications.md for the why.

const UPDATE_READ_KEY = "update-bell-read-version";

// Relative "time ago" label shared by the desktop bell and the mobile sheet.
export const formatTimestamp = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

// The update nudge is ephemeral: it is derived live from the version check, never
// persisted, and disappears after a reload (the running bundle then matches the
// deployed version). Only patch releases produce one — minor/feature releases get
// the louder UpdateNotification banner instead.
export const getUpdateNotification = (updateKind) =>
  updateKind === "patch"
    ? {
        source: "update",
        key: "update-available",
        title: "A new version is available",
        body: "Reload to get the latest changes.",
        severity: "info",
        timestamp: Math.floor(Date.now() / 1000),
      }
    : null;

// Read state for the nudge lives in sessionStorage, keyed by the detected
// version, rather than in persisted settings: it is per-tab and short-lived by
// nature, and a reload clears the underlying condition anyway.
export const isUpdateRead = (latestVersion) => {
  if (!latestVersion) return false;
  try {
    return sessionStorage.getItem(UPDATE_READ_KEY) === latestVersion;
  } catch {
    return false;
  }
};

export const markUpdateRead = (latestVersion) => {
  if (!latestVersion) return;
  try {
    sessionStorage.setItem(UPDATE_READ_KEY, latestVersion);
  } catch {
    // sessionStorage unavailable — the nudge stays unread until reload
  }
};

// Merge remote messages, bundled release notes, and the optional update nudge
// into one list, newest first. `updateItem` is the result of getUpdateNotification.
export const buildNotificationItems = (messages, updateItem) =>
  [
    ...messages.map((m) => ({ ...m, source: "remote", key: `remote-${m.id}` })),
    ...getReleaseNotes(),
    ...(updateItem ? [updateItem] : []),
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

// Dispatch the unread test on the item's source to the right cursor.
export const isNotificationUnread = (item, settings, latestVersion) => {
  if (item.source === "update") return !isUpdateRead(latestVersion);
  if (item.source === "release") return isReleaseNoteUnread(item, settings.lastReadReleaseVersion);
  return item.active !== false && item.id > settings.serviceMessage && isRecent(item.timestamp);
};

// Single source of truth for the unread badge count. Counting through the same
// merged list + unread test the dropdown renders keeps the badge from drifting
// from what the user sees when they open it.
export const countUnreadNotifications = (messages, settings, updateKind, latestVersion) =>
  buildNotificationItems(messages, getUpdateNotification(updateKind)).filter((item) =>
    isNotificationUnread(item, settings, latestVersion),
  ).length;
