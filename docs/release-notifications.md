---
title: Release Notifications and What's New Channels
description: How shipped changes reach users - quiet release notes in the notification bell for fixes, and the full What's New wizard for notable features
category: features
tags: [notifications, release-notes, whats-new, versioning, issue-to-pr]
version: "3.9.0"
related:
  - welcome-wizard-v2.md
file_locations:
  feed: src/data/releaseNotes.json
  helper: src/Helpers/releaseNotes.js
  bell: src/Components/NotificationBell.jsx
  mobile_sheet: src/Components/Viewer/MobileNotifications.jsx
  mobile_badge: src/Components/Viewer/MobileMenu.jsx
  settings: src/Hooks/useSettingsStorage.jsx
  pipeline_prompt: .github/issue-to-pr/prompt.md
  pipeline_workflow: .github/workflows/issue-to-pr.yml
---

# Release Notifications and What's New Channels

The app announces shipped changes through two deliberately different channels, so
that the steady stream of small fixes does not bury users under update modals.

## Table of Contents

- [The two channels](#the-two-channels)
- [Release notes feed](#release-notes-feed)
- [Read state and unread badge](#read-state-and-unread-badge)
- [Where notes render](#where-notes-render)
- [How the pipeline chooses a channel](#how-the-pipeline-chooses-a-channel)
- [Authoring a release note](#authoring-a-release-note)

## The two channels

| Channel | For | Version bump | Where it shows |
|---------|-----|--------------|----------------|
| **Release note** (default) | Fixes and small changes | Patch (`3.9.0` -> `3.9.1`) | A small item in the notification bell |
| **What's New** (opt-in) | Notable features | Minor (`3.9.4` -> `3.10.0`) | The full-screen What's New wizard |

The What's New wizard is unchanged: it is still triggered purely by entries in the
desktop/mobile `VERSION_REGISTRY` (see `src/Components/WhatsNewWizard/`). A patch
bump that adds no registry entry shows **no** modal, which is exactly what the
release-note channel relies on.

The separate "new build available, reload" prompt (`src/Hooks/useUpdateChecker.js`)
is unrelated to either channel — it is driven by `buildId` and fires on any deploy.

## Release notes feed

Release notes are a bundled, in-repo feed at `src/data/releaseNotes.json` — a JSON
array of entries shaped like notification messages:

```json
{
  "version": "3.9.1",
  "title": "Keywords stay after saving",
  "body": "Keywords you typed used to disappear after saving. Now they stay.",
  "severity": "info",
  "timestamp": 1716800000
}
```

- `version` — the app version this note ships with; also the read-state key.
- `timestamp` — Unix time in **seconds** (not milliseconds). Notes only surface as
  unread for seven days, so it must be roughly the release time.
- `severity` — optional: `info` | `success` | `warning` | `error`.

`src/Helpers/releaseNotes.js` normalises and sorts the feed (newest first), caps
the displayed list at 15, and exposes `getReleaseNotes`, `isReleaseNoteUnread`, and
`countUnreadReleaseNotes`. The remote operational message feed (`VITE_MESSAGES_URL`)
is unaffected and is merged alongside release notes in the bell.

## Read state and unread badge

A release note is **unread** when its `version` is newer than
`settings.lastReadReleaseVersion` **and** its timestamp is within the last seven
days. "Mark all read" sets `lastReadReleaseVersion` to the current app version
(and the remote feed's `serviceMessage` cursor, as before). New users are seeded
with the current version on welcome-wizard completion, so they do not see older
notes as new.

## Where notes render

Both notification surfaces merge the remote message feed with release notes,
newest first, and pick the right unread cursor by each item's `source`:

- Desktop: `src/Components/NotificationBell.jsx`
- Mobile sheet: `src/Components/Viewer/MobileNotifications.jsx`
- Mobile badge count: `src/Components/Viewer/MobileMenu.jsx`

## How the pipeline chooses a channel

The issue-to-PR pipeline routes by an explicit, human-applied label:

- No `release:feature` label (the default) -> **note**: patch bump + one
  `releaseNotes.json` entry, no wizard.
- `release:feature` label present -> **feature**: minor bump + a What's New entry
  (desktop + mobile).

The `gate` job in `.github/workflows/issue-to-pr.yml` derives a `release_kind`
output (`note` or `feature`) from the labels and passes it to the agent prompt as a
`Release type` line. The agent follows `.github/issue-to-pr/prompt.md` ("Release
the change").

## Authoring a release note

Write the way a team member jots an honest note to players: address the reader as
"you" in the present tense, say plainly what used to go wrong and what happens now,
avoid jargon, file names, version numbers, emojis, and marketing words. The full
writing rules live under "How to write the release text" in the pipeline prompt.
