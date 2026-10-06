-- =====================================================
-- Game Datacards - Lifetime and Admin Subscription Tiers
-- Migration 013: Add non-purchasable lifetime and admin tiers
-- =====================================================

-- =====================================================
-- 1. Update subscription_tier constraint
-- =====================================================
-- Add 'lifetime' and 'admin' to allowed tier values

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'premium', 'creator', 'lifetime', 'admin'));

-- =====================================================
-- 2. Update get_effective_tier function
-- =====================================================
-- Lifetime and admin tiers never expire

CREATE OR REPLACE FUNCTION get_effective_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
  v_expires_at TIMESTAMPTZ;
  v_status TEXT;
BEGIN
  -- Get user's subscription info
  SELECT
    subscription_tier,
    subscription_expires_at,
    subscription_status
  INTO v_tier, v_expires_at, v_status
  FROM public.user_profiles
  WHERE id = p_user_id;

  -- Default to 'free' if no profile found
  IF v_tier IS NULL THEN
    RETURN 'free';
  END IF;

  -- Lifetime and admin tiers never expire
  IF v_tier IN ('lifetime', 'admin') THEN
    RETURN v_tier;
  END IF;

  -- Check if paid tier but expired
  IF v_tier IN ('premium', 'creator') THEN
    -- If there's an expiry date and it's in the past, treat as free
    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
      RETURN 'free';
    END IF;

    -- If status is 'expired', treat as free
    IF v_status = 'expired' THEN
      RETURN 'free';
    END IF;
  END IF;

  RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 3. Update get_tier_limits function
-- =====================================================
-- Add limits for lifetime and admin tiers

CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE p_tier
    WHEN 'lifetime' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99
      );
    WHEN 'admin' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99
      );
    WHEN 'creator' THEN
      RETURN jsonb_build_object(
        'categories', 250,
        'datasources', 10
      );
    WHEN 'premium' THEN
      RETURN jsonb_build_object(
        'categories', 50,
        'datasources', 2
      );
    ELSE -- 'free' or any other value
      RETURN jsonb_build_object(
        'categories', 2,
        'datasources', 0
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 4. Update comments
-- =====================================================

COMMENT ON COLUMN public.user_profiles.subscription_tier IS
  'Subscription tier: free (2 categories), premium (50 categories, 2 datasources), creator (250 categories, 10 datasources), lifetime (999 categories, 99 datasources - non-purchasable), admin (999 categories, 99 datasources - non-purchasable)';

-- =====================================================
-- 5. Re-analyze affected tables
-- =====================================================

ANALYZE public.user_profiles;
