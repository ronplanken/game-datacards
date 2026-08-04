# Release fragments

Each pull request that should ship a release note drops one JSON file in
`changes/unreleased/`, named after its issue number (e.g. `231.json`):

```json
{
  "title": "Keywords stay after saving",
  "body": "Keywords you typed used to disappear after saving. Now they stay.",
  "severity": "info"
}
```

- `title`, `body` — the player-facing note (no version numbers, no jargon).
- `severity` — optional; one of `info`, `success`, `warning`, `error`.
- No `version` or `timestamp` — the release workflow assigns those.

Why one file per issue: two open PRs never edit the same file, so they cannot
conflict on the version bump or on `src/data/releaseNotes.json` the way they did
when each PR bumped the version itself.

When a PR merges to `main`, `.github/workflows/release.yml` consumes its
fragment: it bumps the **patch** version in `package.json`, appends the note to
`src/data/releaseNotes.json` (the in-app notification bell), deletes the
fragment, commits, and tags `v<x.y.z>`. That version-bump commit is the only
thing that changes `package.json`, which is what the Cloudflare Pages build
watch path uses to deploy production.

Notable **feature** releases — the full-screen What's New wizard plus a minor
version bump — are cut by a human, not by this pipeline.
