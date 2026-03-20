#!/usr/bin/env bash
set -euo pipefail

# Build the premium version by installing @gdc/premium from the matching
# branch in gdc-premium, falling back to main.
#
# Branch resolution order:
#   1. GDC_PREMIUM_REF env var (explicit override)
#   2. Current git branch name (convention: same name in both repos)
#   3. "main" (fallback)
#
# Requires GITHUB_TOKEN in the environment.
#
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./scripts/build-premium.sh
#   GDC_PREMIUM_REF=fix/my-branch GITHUB_TOKEN=ghp_xxx ./scripts/build-premium.sh

REPO="github.com/ronplanken/gdc-premium.git"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: GITHUB_TOKEN is not set"
  exit 1
fi

# Determine which branch/ref to use
if [ -n "${GDC_PREMIUM_REF:-}" ]; then
  CANDIDATE_REF="$GDC_PREMIUM_REF"
elif [ -n "${CF_PAGES_BRANCH:-}" ]; then
  # Cloudflare Pages sets CF_PAGES_BRANCH
  CANDIDATE_REF="$CF_PAGES_BRANCH"
else
  CANDIDATE_REF="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"
fi

# Check if the candidate branch exists in gdc-premium
branch_exists() {
  git ls-remote --heads "https://${GITHUB_TOKEN}@${REPO}" "$1" 2>/dev/null | grep -q .
}

if [ "$CANDIDATE_REF" != "main" ] && branch_exists "$CANDIDATE_REF"; then
  REF="$CANDIDATE_REF"
  echo "==> [premium] Using matching branch: $REF" >&2
else
  REF="main"
  if [ "$CANDIDATE_REF" != "main" ]; then
    echo "==> [premium] Branch '$CANDIDATE_REF' not found in gdc-premium, falling back to main" >&2
  fi
fi

echo "==> [premium] Installing @gdc/premium from $REF..." >&2
yarn add "@gdc/premium@https://${GITHUB_TOKEN}@${REPO}#${REF}"

echo "==> [premium] Building..." >&2
VITE_USE_PREMIUM_PACKAGE=true vite build
