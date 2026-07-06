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

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS signup_source TEXT;

COMMENT ON COLUMN public.user_profiles.signup_source IS 'App the account first authenticated on (claim-once): game-datacards | game-datamissions';

-- Claim-once: sets the source only when still unset, for the calling user.
-- SECURITY DEFINER so it can write the row regardless of RLS; the WHERE clause
-- scopes it to auth.uid(), and the known-values check keeps the column clean.
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

  UPDATE public.user_profiles
  SET signup_source = p_source
  WHERE id = v_user_id AND signup_source IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- claimed = true only when this call set it (first app wins).
  RETURN jsonb_build_object('success', true, 'claimed', v_updated > 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_signup_source(TEXT) TO authenticated;
