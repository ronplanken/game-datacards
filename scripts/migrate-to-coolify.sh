#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Migrate Supabase Cloud to Self-Hosted (Coolify)
# =============================================================================
# This script guides you through migrating the database and edge functions
# from Supabase Cloud to a self-hosted Supabase instance on Coolify.
#
# Prerequisites:
#   - Supabase CLI installed (https://supabase.com/docs/guides/cli)
#   - SSH access to the Coolify server (key via 1Password SSH agent)
#   - Coolify Supabase stack deployed and running
#   - gdc-premium repo cloned alongside game-datacards
#
# Usage:
#   ./scripts/migrate-to-coolify.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PREMIUM_DIR="$(dirname "$PROJECT_DIR")/gdc-premium"
FUNCTIONS_SRC="$PREMIUM_DIR/supabase/functions"

# Server defaults
DEFAULT_SERVER="89.167.42.14"
DEFAULT_SSH_USER="root"
LOCAL_PG_PORT=54322  # Local port for SSH tunnel (avoids conflict with local Postgres)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${GREEN}=== Step $1 ===${NC}"; }

# Cleanup function to tear down SSH tunnel on exit
SSH_TUNNEL_PID=""
cleanup() {
  if [ -n "$SSH_TUNNEL_PID" ]; then
    log_info "Closing SSH tunnel (PID $SSH_TUNNEL_PID)..."
    kill "$SSH_TUNNEL_PID" 2>/dev/null || true
    wait "$SSH_TUNNEL_PID" 2>/dev/null || true
    log_ok "SSH tunnel closed"
  fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
log_info "Running pre-flight checks..."

if ! command -v supabase &>/dev/null; then
  log_error "Supabase CLI not found. Install it: https://supabase.com/docs/guides/cli"
  exit 1
fi
log_ok "Supabase CLI found: $(supabase --version 2>/dev/null || echo 'unknown')"

MIGRATION_DIR="$PROJECT_DIR/supabase/migrations"
MIGRATION_COUNT=$(ls -1 "$MIGRATION_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')
if [ "$MIGRATION_COUNT" -eq 0 ]; then
  log_error "No migration files found in $MIGRATION_DIR"
  exit 1
fi
log_ok "Found $MIGRATION_COUNT migration files"

if [ ! -d "$FUNCTIONS_SRC" ]; then
  log_warn "gdc-premium edge functions not found at $FUNCTIONS_SRC"
  log_warn "Edge function deployment will be skipped"
  HAS_FUNCTIONS=false
else
  FUNC_COUNT=$(ls -1d "$FUNCTIONS_SRC"/*/ 2>/dev/null | wc -l | tr -d ' ')
  log_ok "Found $FUNC_COUNT edge functions in gdc-premium"
  HAS_FUNCTIONS=true
fi

# ---------------------------------------------------------------------------
# Collect connection details
# ---------------------------------------------------------------------------
echo ""
log_info "Collecting connection details..."
echo ""

# SSH target
COOLIFY_SSH="${COOLIFY_SSH:-}"
if [ -z "$COOLIFY_SSH" ]; then
  read -rp "SSH target [$DEFAULT_SSH_USER@$DEFAULT_SERVER]: " COOLIFY_SSH
  COOLIFY_SSH="${COOLIFY_SSH:-$DEFAULT_SSH_USER@$DEFAULT_SERVER}"
fi
log_ok "SSH target: $COOLIFY_SSH"

# Postgres password (needed for the tunneled connection)
if [ -z "${DB_PASSWORD:-}" ]; then
  read -rsp "Postgres password for the Coolify Supabase instance: " DB_PASSWORD
  echo ""
fi

# Functions volume path
if [ -z "${FUNCTIONS_VOLUME_PATH:-}" ]; then
  log_info "The functions volume path is typically /data/coolify/services/<service-id>/volumes/functions/"
  log_info "Attempting to find it on the server..."
  DETECTED_PATH=$(ssh "$COOLIFY_SSH" "find /data/coolify -path '*/volumes/functions' -type d 2>/dev/null | head -1" || true)
  if [ -n "$DETECTED_PATH" ]; then
    log_ok "Detected functions volume: $DETECTED_PATH"
    read -rp "Use this path? (Y/n): " USE_DETECTED
    if [[ ! "$USE_DETECTED" =~ ^[Nn]$ ]]; then
      FUNCTIONS_VOLUME_PATH="$DETECTED_PATH"
    fi
  fi
  if [ -z "${FUNCTIONS_VOLUME_PATH:-}" ]; then
    read -rp "Functions volume path on server (or 'skip'): " FUNCTIONS_VOLUME_PATH
  fi
fi

# ---------------------------------------------------------------------------
# Step 1: Open SSH tunnel and apply database migrations
# ---------------------------------------------------------------------------
log_step "1: Apply Database Migrations (via SSH Tunnel)"

log_info "Opening SSH tunnel: localhost:$LOCAL_PG_PORT -> server:5432"
ssh -f -N -L "$LOCAL_PG_PORT:localhost:5432" "$COOLIFY_SSH"
SSH_TUNNEL_PID=$(lsof -ti "tcp:$LOCAL_PG_PORT" -sTCP:LISTEN 2>/dev/null || true)

if [ -z "$SSH_TUNNEL_PID" ]; then
  log_error "Failed to open SSH tunnel. Check your SSH access to $COOLIFY_SSH"
  exit 1
fi
log_ok "SSH tunnel open (PID $SSH_TUNNEL_PID)"

# Build the tunneled DB URL
TUNNEL_DB_URL="postgres://postgres:${DB_PASSWORD}@localhost:${LOCAL_PG_PORT}/postgres"

log_info "Testing database connection..."
if supabase migration list --db-url "$TUNNEL_DB_URL" 2>/dev/null; then
  log_ok "Database connection successful"
else
  log_warn "Could not list migrations (this is normal for a fresh database)"
fi

echo ""
read -rp "Apply all $MIGRATION_COUNT migrations to the database? (y/N): " CONFIRM_MIGRATE
if [[ "$CONFIRM_MIGRATE" =~ ^[Yy]$ ]]; then
  log_info "Applying migrations..."
  cd "$PROJECT_DIR"
  supabase db push --db-url "$TUNNEL_DB_URL"
  log_ok "Migrations applied successfully"

  log_info "Verifying migration status..."
  supabase migration list --db-url "$TUNNEL_DB_URL"
else
  log_warn "Skipping database migrations"
fi

# ---------------------------------------------------------------------------
# Step 2: Deploy edge functions
# ---------------------------------------------------------------------------
log_step "2: Deploy Edge Functions"

if [ "$HAS_FUNCTIONS" = false ]; then
  log_warn "Skipping edge functions (gdc-premium not found)"
elif [ "${FUNCTIONS_VOLUME_PATH:-}" = "skip" ]; then
  log_warn "Skipping edge functions (user chose to skip)"
else
  log_info "Deploying edge functions to $COOLIFY_SSH:$FUNCTIONS_VOLUME_PATH"
  echo ""
  echo "Functions to deploy:"
  for func_dir in "$FUNCTIONS_SRC"/*/; do
    func_name=$(basename "$func_dir")
    echo "  - $func_name/index.ts"
  done
  echo ""

  read -rp "Deploy edge functions via SCP? (y/N): " CONFIRM_FUNCTIONS
  if [[ "$CONFIRM_FUNCTIONS" =~ ^[Yy]$ ]]; then
    for func_dir in "$FUNCTIONS_SRC"/*/; do
      func_name=$(basename "$func_dir")
      log_info "Deploying $func_name..."
      ssh "$COOLIFY_SSH" "mkdir -p $FUNCTIONS_VOLUME_PATH/$func_name"
      scp "$func_dir/index.ts" "$COOLIFY_SSH:$FUNCTIONS_VOLUME_PATH/$func_name/index.ts"
      log_ok "$func_name deployed"
    done

    echo ""
    log_info "Restarting Edge Runtime container..."
    read -rp "Restart the functions container now? (y/N): " CONFIRM_RESTART
    if [[ "$CONFIRM_RESTART" =~ ^[Yy]$ ]]; then
      ssh "$COOLIFY_SSH" "docker compose -f /data/coolify/services/*/docker-compose.yml restart functions --no-deps 2>/dev/null || echo 'Could not auto-restart. Please restart the functions service manually in Coolify.'"
      log_ok "Functions container restart requested"
    else
      log_warn "Remember to restart the functions container in Coolify"
    fi
  else
    log_warn "Skipping edge function deployment"
  fi
fi

# ---------------------------------------------------------------------------
# Step 3: Reminder checklist
# ---------------------------------------------------------------------------
log_step "3: Post-Migration Checklist"

echo ""
echo "Complete these steps manually:"
echo ""
echo "  [ ] Configure edge function secrets in Coolify (functions service env vars):"
echo "      - CREEM_API_KEY"
echo "      - CREEM_WEBHOOK_SECRET"
echo "      - CREEM_TEST_MODE=true"
echo "      - CREEM_PRODUCT_ID_PREMIUM"
echo "      - CREEM_PRODUCT_ID_CREATOR"
echo "      - APP_URL=https://game-datacards.eu"
echo ""
echo "  [ ] Update Creem webhook URL in Creem dashboard to:"
echo "      https://<your-supabase-url>/functions/v1/creem-webhook"
echo ""
echo "  [ ] Update frontend environment variables:"
echo "      VITE_SUPABASE_URL=https://<your-supabase-url>"
echo "      VITE_SUPABASE_ANON_KEY=<your-anon-key>"
echo ""
echo "  [ ] Configure auth (GoTrue) in Coolify:"
echo "      - SMTP settings for email confirmation/password reset"
echo "      - OAuth providers (update redirect URLs)"
echo "      - Site URL and redirect URLs"
echo ""
echo "  [ ] Verify:"
echo "      - curl https://<url>/functions/v1/get-products"
echo "      - Create a test account and verify email flow"
echo "      - Test checkout flow with Creem test mode"
echo "      - Rebuild and deploy the frontend app"
echo ""

log_ok "Migration script complete"
