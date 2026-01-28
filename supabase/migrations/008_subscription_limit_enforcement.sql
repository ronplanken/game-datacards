-- =====================================================
-- Game Datacards - Server-Side Subscription Limit Enforcement
-- Migration 008: Enforce tier limits at database level
-- =====================================================

-- =====================================================
-- 1. Create helper function to get effective subscription tier
-- =====================================================
-- Accounts for subscription expiry (expired subscriptions = free tier)

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
-- 2. Create function to get tier limits
-- =====================================================
-- Returns limits as a JSON object for flexibility

CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE p_tier
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
-- 3. Create validation function for categories
-- =====================================================

CREATE OR REPLACE FUNCTION validate_category_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_categories INT;
  v_current_count INT;
BEGIN
  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_categories := (v_limits->>'categories')::INT;

  -- Count existing categories for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_categories
  WHERE user_id = NEW.user_id;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_categories THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:categories:%:%;%',
      v_current_count,
      v_max_categories,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to add more categories';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Create validation function for datasources
-- =====================================================

CREATE OR REPLACE FUNCTION validate_datasource_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_datasources := (v_limits->>'datasources')::INT;

  -- Free tier cannot upload any datasources
  IF v_max_datasources = 0 THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:datasources:0:0;%',
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade to Premium or Creator tier to upload custom datasources';
  END IF;

  -- Count existing datasources for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_datasources
  WHERE user_id = NEW.user_id;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_datasources THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:datasources:%:%;%',
      v_current_count,
      v_max_datasources,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to upload more datasources';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Create triggers for limit enforcement
-- =====================================================

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS enforce_category_limit ON public.user_categories;
DROP TRIGGER IF EXISTS enforce_datasource_limit ON public.user_datasources;

-- Create trigger for categories (only on INSERT, not UPDATE)
CREATE TRIGGER enforce_category_limit
  BEFORE INSERT ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_limit();

-- Create trigger for datasources (only on INSERT, not UPDATE)
CREATE TRIGGER enforce_datasource_limit
  BEFORE INSERT ON public.user_datasources
  FOR EACH ROW
  EXECUTE FUNCTION validate_datasource_limit();

-- =====================================================
-- 6. Create helper function for clients to check limits
-- =====================================================
-- This allows clients to pre-check before attempting insert

CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_resource TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_count INT;
  v_current_count INT;
BEGIN
  -- Validate resource type
  IF p_resource NOT IN ('categories', 'datasources') THEN
    RETURN jsonb_build_object(
      'error', 'Invalid resource type. Use ''categories'' or ''datasources'''
    );
  END IF;

  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);
  v_max_count := (v_limits->>p_resource)::INT;

  -- Get current count
  IF p_resource = 'categories' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_categories
    WHERE user_id = p_user_id;
  ELSE
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'resource', p_resource,
    'tier', v_effective_tier,
    'current', v_current_count,
    'limit', v_max_count,
    'remaining', GREATEST(0, v_max_count - v_current_count),
    'canAdd', v_current_count < v_max_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_subscription_limit(TEXT, UUID) TO authenticated;

-- =====================================================
-- 7. Add RPC function for batch limit checking
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_usage(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_category_count INT;
  v_datasource_count INT;
BEGIN
  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);

  -- Get counts
  SELECT COUNT(*) INTO v_category_count
  FROM public.user_categories
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_datasource_count
  FROM public.user_datasources
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'tier', v_effective_tier,
    'categories', jsonb_build_object(
      'current', v_category_count,
      'limit', (v_limits->>'categories')::INT,
      'remaining', GREATEST(0, (v_limits->>'categories')::INT - v_category_count)
    ),
    'datasources', jsonb_build_object(
      'current', v_datasource_count,
      'limit', (v_limits->>'datasources')::INT,
      'remaining', GREATEST(0, (v_limits->>'datasources')::INT - v_datasource_count)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_subscription_usage(UUID) TO authenticated;

-- =====================================================
-- 8. Comments for documentation
-- =====================================================

COMMENT ON FUNCTION get_effective_tier(UUID) IS
  'Returns the effective subscription tier for a user, accounting for expiry';

COMMENT ON FUNCTION get_tier_limits(TEXT) IS
  'Returns the resource limits for a given subscription tier as JSONB';

COMMENT ON FUNCTION validate_category_limit() IS
  'Trigger function that enforces category limits based on subscription tier';

COMMENT ON FUNCTION validate_datasource_limit() IS
  'Trigger function that enforces datasource limits based on subscription tier';

COMMENT ON FUNCTION check_subscription_limit(TEXT, UUID) IS
  'Client-callable function to check if a user can add more of a resource';

COMMENT ON FUNCTION get_subscription_usage(UUID) IS
  'Returns comprehensive usage statistics for a user subscription';

-- =====================================================
-- 9. Re-analyze affected tables
-- =====================================================

ANALYZE public.user_profiles;
ANALYZE public.user_categories;
ANALYZE public.user_datasources;
