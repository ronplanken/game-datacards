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
  notifications_helper: src/Helpers/notifications.js
  update_check: src/Hooks/useUpdateCheck.jsx
  bell: src/Components/NotificationBell.jsx
  mobile_sheet: src/Components/Viewer/MobileNotifications.jsx
  mobile_badge: src/Components/Viewer/MobileMenu.jsx
  settings: src/Hooks/useSettingsStorage.jsx
  pipeline_prompt: .github/issue-to-pr/prompt.md
  pipeline_workflow: .github/workflows/issue-to-pr.yml
  fragments: changes/unreleased/
  release_workflow: .github/workflows/release.yml
  release_script: .github/scripts/apply-release-fragment.mjs
---

# Release Notifications and What's New Channels

The app announces shipped changes through two deliberately different channels, so
that the steady stream of small fixes does not bury users under update modals.

## Table of Contents

- [The two channels](#the-two-channels)
- [Release notes feed](#release-notes-feed)
- [Read state and unread badge](#read-state-and-unread-badge)
- [Where notes render](#where-notes-render)
- [How the pipeline releases](#how-the-pipeline-releases)
- [Authoring a release note](#authoring-a-release-note)

## The two channels

| Channel | For | Who/when | Version bump | Where it shows |
|---------|-----|----------|--------------|----------------|
| **Release note** | Fixes and small changes (all issue-to-PR PRs) | Pipeline, automatically after merge | Patch (`3.9.0` -> `3.9.1`) | A small item in the notification bell |
| **What's New** | Notable features | A human, cut manually | Minor (`3.9.4` -> `3.10.0`) | The full-screen What's New wizard |

The What's New wizard is unchanged: it is still triggered purely by entries in the
desktop/mobile `VERSION_REGISTRY` (see `src/Components/WhatsNewWizard/`). A patch
bump that adds no registry entry shows **no** modal, which is exactly what the
release-note channel relies on.

The "reload to update" prompt (`src/Hooks/useUpdateCheck.jsx`) is a separate,
client-detected cue rather than a content channel. It polls the deployed
`version.json` and compares its `version` to the running build, so it no longer
fires on every deploy:

- a **minor/major** bump (a feature release) shows the loud `UpdateNotification`
  banner;
- a **patch** bump shows a quiet, temporary "A new version is available — reload"
  line in the notification bell. It bumps the unread badge, carries a Reload
  button, and disappears once the tab reloads (the running bundle then matches
  the deployed version).

The patch nudge bridges a gap: an already-loaded tab cannot see a freshly shipped
release note until it reloads, so the nudge tells it to. The synthetic bell item
and its read state live in `src/Helpers/notifications.js`.

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

## How the pipeline releases

Issue-to-PR PRs always use the **release-note** channel, and the version bump and
feed entry are applied **after merge**, not in the PR. This keeps release
bookkeeping out of the feature branch, so several pipeline PRs can be open at once
without colliding on the version number or on `releaseNotes.json`.

1. The agent writes one **fragment** to `changes/unreleased/<issue>.json` — just
   `title`, `body`, and optional `severity` (no version, no timestamp). One file
   per issue means two PRs never edit the same file. See `changes/README.md`.
2. On merge to `main`, `.github/workflows/release.yml` runs (serialized via a
   `release` concurrency group). For each pending fragment it calls
   `.github/scripts/apply-release-fragment.mjs`, which bumps the **patch** version
   in `package.json` and appends the entry to `src/data/releaseNotes.json` with
   the assigned version and current timestamp. It then deletes the fragment,
   commits `Release v<x.y.z>`, and tags.
3. That commit is the only thing that changes `package.json`. Cloudflare Pages is
   set with a **build watch path** of `package.json`, so production deploys on
   release commits only — a merge that carries no fragment does not deploy.

The full-screen **What's New** wizard is not produced by the pipeline. It is still
triggered purely by `VERSION_REGISTRY` entries, and a human adds those (with a
minor bump) when cutting a notable feature release. Patch notes are never lost —
they remain in `releaseNotes.json` and the bell.

## Authoring a release note

Write the way a team member jots an honest note to players: address the reader as
"you" in the present tense, say plainly what used to go wrong and what happens now,
avoid jargon, file names, version numbers, emojis, and marketing words. The full
writing rules live under "How to write the release text" in the pipeline prompt.
