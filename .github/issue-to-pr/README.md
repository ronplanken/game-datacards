# Issue to PR pipeline (DeepSeek V4 Pro)

Turns an approved Discord-sourced feature issue into a draft pull request,
implemented by an [OpenCode](https://opencode.ai) agent driven by **DeepSeek V4
Pro** (1M context). A human reviews and merges; nothing is auto-merged.

## How it works

1. The idea-to-issue Discord bot files a feature issue here with the
   `from-discord` + `enhancement` labels.
2. An approver adds the **`ai-build`** label when they want the bot to attempt it.
3. `issue-to-pr.yml` runs: it checks out **both** `game-datacards` and
   `gdc-premium` as sibling directories (matching the `vite.config.js` /
   `scripts/build-premium.sh` layout), runs OpenCode with the prompt in
   `prompt.md`, then runs `yarn lint:fix` + `yarn test:ci`.
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
| `DEEPSEEK_API_KEY` | DeepSeek API key (same key the idea-bot uses). |
| `GH_PAT` | Fine-grained PAT with **Contents: write**, **Pull requests: write**, **Issues: write** on **both** `ronplanken/game-datacards` and `ronplanken/gdc-premium`. Needed so the AI PR triggers CI + Claude review (the default `GITHUB_TOKEN` cannot trigger other workflows). |

### Labels (create in both repos)

| Label | Meaning |
|-------|---------|
| `ai-build` | Approver opt-in: attempt this issue. |
| `ai-generated` | Applied to PRs the pipeline opens. |
| `ai-attempted` | Set automatically; blocks re-runs. |

The pipeline relies on the `from-discord` and `enhancement` labels the idea-bot
already applies.

## Tuning

- **Prompt**: edit `prompt.md` — it is the agent's task brief. The workflow
  appends the issue title/body to it at runtime.
- **Model**: change `--model` in `issue-to-pr.yml` and the `models` block in
  `opencode.json` (e.g. to `deepseek-v4-flash` to cut cost).
- **Guardrails**: `opencode.json` `permission` fences what the agent may edit
  (only `src/` + `docs/` in both repos) and blocks network/destructive shell. The
  `if:` in the workflow controls which issues qualify.

## Security / threat model

Issue bodies originate from untrusted Discord users, so the pipeline is built
defensively:

- The agent is told to treat the issue as a spec, not instructions.
- `opencode.json` denies edits outside `src/`/`docs/`, denies `curl`/`wget`/
  `ssh`/`webfetch` (no exfiltration), and denies `npm`.
- Issue text is passed via environment variables, never interpolated into shell.
- Output is always a **draft** PR gated behind human review + the existing Claude
  review.

**Residual risk**: `DEEPSEEK_API_KEY` is present in the job environment for the
model call, so it is technically reachable by the agent's shell. The draft-PR +
review gate is the backstop. Use a dedicated, rotatable DeepSeek key for this
pipeline.

## Gotchas

- OpenCode auto-installs the `@ai-sdk/openai-compatible` provider package named in
  `opencode.json`. If a run fails at provider load, install it in the workflow.
- If DeepSeek rejects the request over `max_tokens`, lower `limit.output` in
  `opencode.json`.
- `gdc-premium` is Yarn 1 (`--frozen-lockfile`); `game-datacards` uses
  `--immutable`. Keep the install flags as-is.
- The premium PR targets `main`; set `PREMIUM_BASE` in the final workflow step if
  that ever changes.
