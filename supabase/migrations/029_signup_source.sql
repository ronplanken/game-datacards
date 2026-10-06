-- =====================================================
-- Migration 029: track which app an account first signed in on
-- =====================================================
-- The two apps (game-datacards, game-datamissions) share this auth instance,
-- and GoTrue does not record which app a user registered from. This adds a
-- nullable signup_source on user_profiles plus a claim-once RPC: the first app
-- a user authenticates on stamps the source, and it is never overwritten.
--
-- For new registrations this is exactly the app they signed up on (email or
-- OAuth). Pre-existing accounts stay NULL until their next login, then get an
-- approximate value from whichever app they open first.
--
-- Defense in depth: the "Users can update own profile" RLS policy (002) would
-- otherwise let a client write signup_source directly, bypassing the RPC. A
-- CHECK constraint pins the allowed values, and a BEFORE UPDATE trigger (same
-- approach as protect_subscription_fields in 027) reverts any change that does
-- not originate from claim_signup_source, so claim-once truly holds.

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS signup_source TEXT;

COMMENT ON COLUMN public.user_profiles.signup_source IS 'App the account first authenticated on (claim-once, RPC-only): game-datacards | game-datamissions';

-- Allowlist the stored values (NULL = not yet claimed).
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_signup_source_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_signup_source_check
  CHECK (signup_source IS NULL OR signup_source IN ('game-datacards', 'game-datamissions'));

-- Gate writes to claim_signup_source only. Direct profile updates leave the
-- stored value untouched; the RPC opts in via a transaction-local GUC.
CREATE OR REPLACE FUNCTION public.protect_signup_source()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.signup_source IS DISTINCT FROM OLD.signup_source
     AND current_setting('app.claiming_signup_source', true) IS DISTINCT FROM 'on' THEN
    NEW.signup_source := OLD.signup_source;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_signup_source ON public.user_profiles;
CREATE TRIGGER protect_signup_source
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_signup_source();

-- Claim-once: sets the source only when still unset, for the calling user.
-- SECURITY DEFINER so it can write the row regardless of RLS; the WHERE clause
-- scopes it to auth.uid(), the known-values check keeps the column clean, and
-- the GUC lets the protect_signup_source trigger admit this one write.
CREATE OR REPLACE FUNCTION public.claim_signup_source(p_source TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_updated INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_source IS NULL OR p_source NOT IN ('game-datacards', 'game-datamissions') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid source');
  END IF;

  -- Transaction-local opt-in read by protect_signup_source (resets at commit).
  PERFORM set_config('app.claiming_signup_source', 'on', true);

  UPDATE public.user_profiles
  SET signup_source = p_source
  WHERE id = v_user_id AND signup_source IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- claimed = true only when this call set it (first app wins).
  RETURN jsonb_build_object('success', true, 'claimed', v_updated > 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_signup_source(TEXT) TO authenticated;
