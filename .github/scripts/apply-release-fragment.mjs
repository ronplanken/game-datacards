#!/usr/bin/env node
// Applies one issue-to-PR release fragment to the working tree:
//   1. bumps the PATCH version in package.json (preserving its exact formatting)
//   2. appends a notification entry to src/data/releaseNotes.json
//
// Invoked once per fragment by .github/workflows/release.yml. The feature PR no
// longer does any of this; deferring it to a post-merge run on main is what lets
// parallel PRs avoid colliding on the version number and the notes file.
//
// Usage: node .github/scripts/apply-release-fragment.mjs <path/to/fragment.json>

import { readFileSync, writeFileSync } from "node:fs";

const fragmentPath = process.argv[2];
if (!fragmentPath) {
  console.error("usage: apply-release-fragment.mjs <fragment.json>");
  process.exit(1);
}

const PKG_PATH = "package.json";
const NOTES_PATH = "src/data/releaseNotes.json";
const ALLOWED_SEVERITY = new Set(["info", "success", "warning", "error"]);

const fragment = JSON.parse(readFileSync(fragmentPath, "utf8"));
if (!fragment.title || !fragment.body || !String(fragment.title).trim() || !String(fragment.body).trim()) {
  console.error(`fragment ${fragmentPath} must have a non-empty "title" and "body"`);
  process.exit(1);
}

// Bump the patch version with a targeted replace so package.json keeps its exact
// formatting (rewriting the parsed object risks reformatting that trips CI).
const pkgRaw = readFileSync(PKG_PATH, "utf8");
const match = pkgRaw.match(/("version":\s*")(\d+)\.(\d+)\.(\d+)(")/);
if (!match) {
  console.error(`could not find an x.y.z version field in ${PKG_PATH}`);
  process.exit(1);
}
const [major, minor, patch] = [match[2], match[3], match[4]].map((n) => parseInt(n, 10));
const version = `${major}.${minor}.${patch + 1}`;
writeFileSync(PKG_PATH, pkgRaw.replace(match[0], `${match[1]}${version}${match[5]}`));

// Append the notification entry. The post-merge run owns version + timestamp;
// the fragment only supplies the player-facing text and optional severity.
const entry = {
  version,
  title: String(fragment.title),
  body: String(fragment.body),
  severity: ALLOWED_SEVERITY.has(fragment.severity) ? fragment.severity : "info",
  timestamp: Math.floor(Date.now() / 1000),
};

let notes = [];
try {
  const parsed = JSON.parse(readFileSync(NOTES_PATH, "utf8"));
  if (Array.isArray(parsed)) notes = parsed;
} catch {
  notes = [];
}
notes.push(entry);
writeFileSync(NOTES_PATH, `${JSON.stringify(notes, null, 2)}\n`);

console.log(`Released v${version}: ${entry.title}`);
