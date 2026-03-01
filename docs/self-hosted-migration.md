---
title: Self-Hosted Supabase Migration (Coolify)
description: Guide for migrating the Game Datacards backend from Supabase Cloud to a self-hosted instance on Coolify
category: infrastructure
tags: [supabase, coolify, migration, deployment, self-hosted]
prerequisites:
  - Coolify server with Supabase template deployed
  - Supabase CLI installed locally
  - SSH access to the Coolify server
  - gdc-premium repository cloned alongside game-datacards
file_locations:
  migration_script: scripts/migrate-to-coolify.sh
  migrations_dir: supabase/migrations/
  edge_functions: ../gdc-premium/supabase/functions/
---

# Migrating to Self-Hosted Supabase (Coolify)

Guide for migrating the Game Datacards backend from Supabase Cloud to a self-hosted Supabase instance running on Coolify.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step 1: Apply Database Migrations](#step-1-apply-database-migrations)
- [Step 2: Deploy Edge Functions](#step-2-deploy-edge-functions)
- [Step 3: Configure Edge Function Secrets](#step-3-configure-edge-function-secrets)
- [Step 4: Update Creem Webhook URL](#step-4-update-creem-webhook-url)
- [Step 5: Update Frontend Environment Variables](#step-5-update-frontend-environment-variables)
- [Step 6: Configure Auth (GoTrue)](#step-6-configure-auth-gotrue)
- [Verification Checklist](#verification-checklist)
- [Notes](#notes)

## Prerequisites

- Coolify server with the Supabase template deployed (includes Postgres, GoTrue Auth, Realtime, Kong, Edge Runtime)
- Supabase CLI installed locally
- SSH access to the Coolify server
- The `gdc-premium` repository cloned alongside `game-datacards`

## Quick Start

Run the interactive migration script:

```bash
./scripts/migrate-to-coolify.sh
```

Or follow the manual steps below.

## Step 1: Apply Database Migrations

All 18 migrations are in `supabase/migrations/`. Since the Hetzner firewall only exposes ports 80/443, Postgres (port 5432) is not directly reachable. Use an SSH tunnel to connect.

### Migrations

| # | File | Purpose |
|---|------|---------|
| 001 | `initial_schema.sql` | Base tables and schema |
| 002 | `rls_policies.sql` | Row-level security policies |
| 003 | `indexes.sql` | Performance indexes |
| 004 | `creem_integration.sql` | Payment integration |
| 005 | `tier_support.sql` | Subscription tier tables |
| 006 | `fix_user_categories_trigger.sql` | Trigger fix |
| 007 | `realtime_setup.sql` | Realtime channel config |
| 008 | `subscription_limit_enforcement.sql` | Tier limit enforcement |
| 009 | `datasource_sharing.sql` | Datasource sharing |
| 010 | `datasource_rpc.sql` | Datasource stored procedures |
| 011 | `local_datasource_support.sql` | Local datasource support |
| 012 | `soft_delete_datasources.sql` | Soft delete for datasources |
| 013 | `lifetime_admin_tiers.sql` | Lifetime and admin tier support |
| 014 | `user_templates.sql` | User template tables |
| 015 | `template_publishing.sql` | Template publishing |
| 016 | `fix_search_path.sql` | Search path fix |
| 017 | `fix_rls_initplan.sql` | RLS init plan fix |
| 018 | `category_sharing.sql` | Category sharing |

### Open an SSH tunnel

```bash
# Opens a tunnel: localhost:54322 -> server's localhost:5432
ssh -f -N -L 54322:localhost:5432 root@89.167.42.14
```

Port 54322 is used locally to avoid conflicts with any local Postgres. The SSH key is resolved automatically via 1Password SSH agent.

### Apply migrations through the tunnel

```bash
supabase db push --db-url "postgres://postgres:<password>@localhost:54322/postgres"
```

This creates all tables, RLS policies, indexes, RPC functions, triggers, and realtime configuration.

Verify with:

```bash
supabase migration list --db-url "postgres://postgres:<password>@localhost:54322/postgres"
```

### Close the tunnel when done

```bash
# Find and kill the tunnel process
lsof -ti tcp:54322 -sTCP:LISTEN | xargs kill
```

### What gets created

| Type | Examples |
|------|---------|
| Tables | `user_profiles`, `user_categories`, `user_datasources`, `user_templates` |
| RLS policies | Row-level security on all user tables |
| RPC functions | 14+ stored procedures for datasource operations |
| Triggers | Auth user creation, subscription enforcement, timestamps |
| Realtime | Channel configuration for live updates |

## Step 2: Deploy Edge Functions

Coolify mounts `./volumes/functions/` into the Edge Runtime container at `/home/deno/functions/`. Copy the 4 functions from `gdc-premium/supabase/functions/` into this volume.

### Functions to deploy

| Function | Purpose |
|----------|---------|
| `creem-webhook/index.ts` | Handles Creem payment webhook events |
| `create-checkout/index.ts` | Creates Creem checkout sessions |
| `get-products/index.ts` | Fetches subscription products from Creem API |
| `get-portal-url/index.ts` | Generates Creem customer portal URL |

### Option A: SCP (recommended)

```bash
# Find the Coolify functions volume path
ssh root@89.167.42.14 "find /data/coolify -path '*/volumes/functions' -type d 2>/dev/null"

# Copy all functions
scp -r ../gdc-premium/supabase/functions/* root@89.167.42.14:/data/coolify/services/<id>/volumes/functions/
```

### Option B: Docker cp (via SSH)

```bash
# SSH into the server, then copy into the running container
ssh root@89.167.42.14
docker cp ./creem-webhook <container-id>:/home/deno/functions/creem-webhook
docker cp ./create-checkout <container-id>:/home/deno/functions/create-checkout
docker cp ./get-products <container-id>:/home/deno/functions/get-products
docker cp ./get-portal-url <container-id>:/home/deno/functions/get-portal-url
```

Note: `docker cp` only persists across restarts if backed by a persistent volume. Prefer SCP to the host volume path.

### After deploying, restart the Edge Runtime

```bash
docker compose restart functions --no-deps
```

Functions become accessible at `https://<supabase-url>/functions/v1/<function-name>`.

## Step 3: Configure Edge Function Secrets

Add these environment variables to the Coolify `functions` service:

| Variable | Description |
|----------|-------------|
| `CREEM_API_KEY` | Creem API authentication key |
| `CREEM_WEBHOOK_SECRET` | HMAC signing secret for webhook verification |
| `CREEM_TEST_MODE` | `true` for test, `false` for production |
| `CREEM_PRODUCT_ID_PREMIUM` | Legacy product ID fallback |
| `CREEM_PRODUCT_ID_CREATOR` | Legacy product ID fallback |
| `APP_URL` | App URL for checkout redirect (e.g., `https://game-datacards.eu`) |

These are auto-populated by the Supabase stack (do NOT set manually):
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `JWT_SECRET`

## Step 4: Update Creem Webhook URL

In the Creem dashboard, update the webhook endpoint to:

```
https://<your-supabase-url>/functions/v1/creem-webhook
```

## Step 5: Update Frontend Environment Variables

Update your `.env` (local) or Cloudflare Pages environment variables:

```
VITE_SUPABASE_URL=https://<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Generate new keys for self-hosted from your `JWT_SECRET`. Do not reuse Supabase Cloud keys. See: https://supabase.com/docs/guides/self-hosting#api-keys

## Step 6: Configure Auth (GoTrue)

In the Coolify environment for the GoTrue/Auth service, configure:

- **SMTP**: Settings for email confirmation and password reset
- **OAuth providers**: Google, GitHub - update redirect URLs to point to the self-hosted instance
- **Site URL**: Set to your app URL (e.g., `https://game-datacards.eu`)
- **Redirect URLs**: Allowed redirect URLs after login/signup

## Verification Checklist

1. **Database**: Connect and verify tables exist (`user_profiles`, `user_categories`, `user_datasources`, etc.)
2. **Edge Functions**: `curl https://<url>/functions/v1/get-products` returns product data
3. **Auth**: Create a test account, verify email confirmation works
4. **Subscriptions**: Test checkout flow end-to-end with Creem test mode enabled
5. **Frontend**: Rebuild with updated env vars, verify the app connects to the self-hosted instance

## Notes

- All edge functions use `Deno.serve()` and `npm:@supabase/supabase-js@2` - fully compatible with self-hosted Edge Runtime
- No code changes are needed in the functions or the frontend app
- Firebase is only used for analytics and is separate from this migration
- The `creem-webhook` function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS - this is auto-populated by the stack
- Coolify's Edge Runtime may have health check issues (known Coolify bug) - monitor after deployment
