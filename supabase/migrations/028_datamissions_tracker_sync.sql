-- =====================================================
-- Migration 028: game-datamissions tracker sync
-- =====================================================
-- Cross-app tables for the game-datamissions 11th edition Game Tracker.
-- Reuses the shared auth (auth.users / user_profiles via handle_new_user);
-- no subscription-tier gating - any authenticated user may sync.
--
-- dm_tracker_games: one row per tracked game (active and finished alike).
-- Games are first-class rows with a global UUID so a future "game-sync"
-- feature (two users joining one live game via QR code) can be added
-- purely additively: a dm_game_participants table referencing
-- dm_tracker_games(id), join-code RPCs, participant SELECT/UPDATE policies,
-- and a realtime subscription on the game row. The version/device_id
-- columns and REPLICA IDENTITY FULL below are already in place for that.
--
-- dm_tracker_kv: per-user key/value store for tracker preferences.

-- =====================================================
-- dm_tracker_games
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dm_tracker_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  state JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dm_tracker_game UNIQUE (owner_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_tracker_games_owner ON public.dm_tracker_games(owner_id);

CREATE TRIGGER update_dm_tracker_games_updated_at
  BEFORE UPDATE ON public.dm_tracker_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.dm_tracker_games ENABLE ROW LEVEL SECURITY;

-- Reads and deletes go direct (RLS-scoped); writes only via the RPC below
-- (no INSERT/UPDATE policies), mirroring the hardened category sync (025).
CREATE POLICY "Users can view own dm tracker games"
  ON public.dm_tracker_games FOR SELECT
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can delete own dm tracker games"
  ON public.dm_tracker_games FOR DELETE
  USING ((select auth.uid()) = owner_id);

-- =====================================================
-- dm_tracker_kv
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dm_tracker_kv (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL CHECK (key IN ('settings')),
  value JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dm_tracker_kv UNIQUE (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_dm_tracker_kv_user ON public.dm_tracker_kv(user_id);

CREATE TRIGGER update_dm_tracker_kv_updated_at
  BEFORE UPDATE ON public.dm_tracker_kv
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.dm_tracker_kv ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dm tracker kv"
  ON public.dm_tracker_kv FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own dm tracker kv"
  ON public.dm_tracker_kv FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- sync_dm_tracker_game RPC
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_dm_tracker_game(
  p_game_id TEXT,
  p_state JSONB,
  p_is_active BOOLEAN,
  p_version INTEGER,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result_id UUID;
  v_cloud RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_game_id IS NULL OR p_game_id = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid game id');
  END IF;

  -- Atomic upsert with version guard in the ON CONFLICT WHERE clause
  -- (model: sync_category in 025). Updates only proceed if our version
  -- is current, or the row was last written by an unknown/same device.
  INSERT INTO public.dm_tracker_games (owner_id, game_id, state, is_active, version, device_id)
  VALUES (v_user_id, p_game_id, p_state, p_is_active, p_version, p_device_id)
  ON CONFLICT (owner_id, game_id) DO UPDATE SET
    state = EXCLUDED.state,
    is_active = EXCLUDED.is_active,
    version = EXCLUDED.version,
    device_id = EXCLUDED.device_id,
    updated_at = NOW()
  WHERE
    public.dm_tracker_games.version <= EXCLUDED.version
    OR public.dm_tracker_games.device_id IS NULL
    OR public.dm_tracker_games.device_id = EXCLUDED.device_id
  RETURNING id INTO v_result_id;

  IF v_result_id IS NOT NULL THEN
    -- Single-active-game invariant, enforced server-side.
    IF p_is_active THEN
      UPDATE public.dm_tracker_games
      SET is_active = false
      WHERE owner_id = v_user_id AND game_id <> p_game_id AND is_active;
    END IF;

    RETURN jsonb_build_object('success', true, 'id', v_result_id, 'version', p_version);
  END IF;

  -- Version guard rejected the update: return the cloud row so the client
  -- can reconcile in one round trip.
  SELECT version, state INTO v_cloud
  FROM public.dm_tracker_games
  WHERE owner_id = v_user_id AND game_id = p_game_id;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'version_conflict',
    'cloud_version', v_cloud.version,
    'cloud_state', v_cloud.state,
    'local_version', p_version
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_dm_tracker_game(TEXT, JSONB, BOOLEAN, INTEGER, TEXT) TO authenticated;

COMMENT ON FUNCTION public.sync_dm_tracker_game IS 'Version-guarded upsert of a game-datamissions tracker game; enforces one active game per owner';

-- =====================================================
-- sync_dm_tracker_kv RPC
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_dm_tracker_kv(
  p_key TEXT,
  p_value JSONB,
  p_version INTEGER,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result_id UUID;
  v_cloud RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_key IS NULL OR p_key NOT IN ('settings') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid key');
  END IF;

  INSERT INTO public.dm_tracker_kv (user_id, key, value, version, device_id)
  VALUES (v_user_id, p_key, p_value, p_version, p_device_id)
  ON CONFLICT (user_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    version = EXCLUDED.version,
    device_id = EXCLUDED.device_id,
    updated_at = NOW()
  WHERE
    public.dm_tracker_kv.version <= EXCLUDED.version
    OR public.dm_tracker_kv.device_id IS NULL
    OR public.dm_tracker_kv.device_id = EXCLUDED.device_id
  RETURNING id INTO v_result_id;

  IF v_result_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'id', v_result_id, 'version', p_version);
  END IF;

  SELECT version, value INTO v_cloud
  FROM public.dm_tracker_kv
  WHERE user_id = v_user_id AND key = p_key;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'version_conflict',
    'cloud_version', v_cloud.version,
    'cloud_value', v_cloud.value,
    'local_version', p_version
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_dm_tracker_kv(TEXT, JSONB, INTEGER, TEXT) TO authenticated;

COMMENT ON FUNCTION public.sync_dm_tracker_kv IS 'Version-guarded upsert of a game-datamissions per-user key/value row';

-- =====================================================
-- Realtime (future-proofing for live game-sync; no client consumes this yet)
-- =====================================================
ALTER TABLE public.dm_tracker_games REPLICA IDENTITY FULL;
ALTER TABLE public.dm_tracker_kv REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_tracker_games;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_tracker_kv;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
