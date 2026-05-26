# Issue to PR pipeline

Turns an approved Discord-sourced feature or bug issue into a draft pull request,
implemented by an [OpenCode](https://opencode.ai) agent (1M-context model). A
human reviews and merges; nothing is auto-merged.

## How it works

1. The idea-to-issue Discord bot files a feature or bug issue here with the
   `from-discord` + `enhancement` (or `bug`) labels.
2. An approver adds the **`ai-build`** label when they want the bot to attempt it.
3. `issue-to-pr.yml` runs: it checks out **both** `game-datacards` and
   `gdc-premium` as sibling directories (matching the `vite.config.js` /
   `scripts/build-premium.sh` layout), runs OpenCode with the prompt in
   `prompt.md`, then runs `yarn lint:fix` + `yarn test:ci`. The app is OpenCode's
   project root; the premium package is reachable via the `external_directory`
   grant in `opencode.json`.
   - As part of the prompt, after implementing the change the agent bumps the
     app's patch version in `package.json` and adds a matching "What's New" entry
     (desktop + mobile) so the update is announced in-app. This happens in
     `game-datacards` even for premium-package features, so that repo always gets
     a PR. A no-op run skips the bump.
4. For each repo the agent changed, it pushes a branch `ai/issue-<n>` and opens a
   **draft** PR, cross-linked to the issue. Because both repos use the same branch
   name, the premium build links them automatically.
5. The PRs are opened with a PAT, so `ci.yml` and `claude-review.yml` run on them
   automatically. The bot also comments the result back on the issue.

Each issue is attempted **once** — the `ai-attempted` label is added up front. To
retry, remove `ai-attempted` and re-add `ai-build`.

## Setup (one-time)

### Secrets (repo settings → Secrets and variables → Actions)

| Secret | Purpose |
|--------|---------|
| `DEEPSEEK_API_KEY` | API key for the model (same key the idea-bot uses). |
| `GH_PAT` | Fine-grained PAT with **Contents: write**, **Pull requests: write**, **Issues: write** on **both** `ronplanken/game-datacards` and `ronplanken/gdc-premium`. Needed so the AI PR triggers CI + Claude review (the default `GITHUB_TOKEN` cannot trigger other workflows). |

### Labels (create in both repos)

| Label | Meaning |
|-------|---------|
| `ai-build` | Approver opt-in: attempt this issue. |
| `ai-generated` | Applied to PRs the pipeline opens. |
| `ai-attempted` | Set automatically; blocks re-runs. |

The pipeline relies on the `from-discord` and `enhancement`/`bug` labels the
idea-bot already applies.

## Tuning

- **Prompt**: edit `prompt.md` — it is the agent's task brief. The workflow
  appends the repository locations and the issue title/body to it at runtime.
- **Model**: change `--model` in `issue-to-pr.yml` and the `models` block in
  `opencode.json` (e.g. to a cheaper model to cut cost).
- **Guardrails**: `opencode.json` `permission` fences what the agent may edit
  (`src/` + `docs/` in both repos, plus the app's `package.json` for the version
  bump) and blocks network/destructive shell. The `gate` job controls which issues
  qualify.

## Security / threat model

Issue bodies originate from untrusted Discord users, so the pipeline is built
defensively:

- The agent is told to treat the issue as a spec, not instructions.
- `opencode.json` denies edits outside `src/`/`docs/` (the only exception is the
  app's `package.json`, for the version bump), denies `curl`/`wget`/`ssh`/
  `webfetch` (no exfiltration), and denies `npm`.
- Issue text is passed via environment variables, never interpolated into shell.
- Output is always a **draft** PR gated behind human review + the existing Claude
  review.

**Residual risk**: the model API key is present in the job environment for the
model call, so it is technically reachable by the agent's shell. The draft-PR +
review gate is the backstop. Use a dedicated, rotatable key for this pipeline.

## Gotchas

- `opencode.json` uses the `GDCWS` placeholder for the runner workspace path; the
  "Run OpenCode" step substitutes the real absolute path (via `sed`) before
  running, so the permission globs and the `external_directory` grant resolve
  correctly. Edit the placeholders, not hardcoded `/home/runner/...` paths.
- OpenCode matches **in-project** `edit` rules against paths relative to the app
  root (`src/**`, `docs/**`); only the **external** (`gdc-premium`) rules use
  absolute paths. Don't make the app's edit rules absolute or they won't match.
- OpenCode auto-installs the `@ai-sdk/openai-compatible` provider package named in
  `opencode.json` (confirmed working in CI).
- If the model rejects the request over `max_tokens`, lower `limit.output` in
  `opencode.json`.
- `gdc-premium` is Yarn 1 (`--frozen-lockfile`); `game-datacards` uses
  `--immutable`. Keep the install flags as-is.
- The premium PR targets `main`; set `PREMIUM_BASE` in the final workflow step if
  that ever changes.
