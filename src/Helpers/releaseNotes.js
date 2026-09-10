import { compare, validate } from "compare-versions";
import releaseNotesData from "../data/releaseNotes.json";

// Bundled release notes are the "small note" channel for fixes and minor changes
// that ship through the issue-to-PR pipeline. They surface in the notification
// bell (desktop and mobile) instead of the full What's New wizard, which is
// reserved for notable features. Each entry is shaped like a notification
// message so the bell can render it directly:
//   { version, title, body, severity?, timestamp, active? }
// The pipeline appends one entry per released fix. See docs and the issue-to-PR
// prompt for the authoring rules.

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

// Cap how many notes the bell lists so the feed stays tidy as fixes accumulate.
// Older entries drop off the list; read state is still tracked by version.
const MAX_DISPLAYED_RELEASE_NOTES = 15;

const isRecent = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() / 1000 - timestamp < SEVEN_DAYS_IN_SECONDS;
};

// compare-versions throws on malformed input; a single bad entry must not break
// the whole bell, so guard the comparison.
const isNewerVersion = (version, baseline) => {
  if (!validate(version)) return false;
  const base = validate(baseline) ? baseline : "0.0.0";
  return compare(version, base, ">");
};

// Bundled release notes normalised into the notification message shape, newest
// first, capped for display.
export const getReleaseNotes = () => {
  const list = Array.isArray(releaseNotesData) ? releaseNotesData : [];
  return list
    .map((note) => ({ ...note, source: "release", key: `release-${note.version}` }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, MAX_DISPLAYED_RELEASE_NOTES);
};

// A release note is unread when it is newer than the last version the user
// marked read and is still recent enough to surface.
export const isReleaseNoteUnread = (note, lastReadVersion) =>
  !!note?.version && note.active !== false && isRecent(note.timestamp) && isNewerVersion(note.version, lastReadVersion);

// Number of unread release notes for the bell badge.
export const countUnreadReleaseNotes = (lastReadVersion) =>
  getReleaseNotes().filter((note) => isReleaseNoteUnread(note, lastReadVersion)).length;
