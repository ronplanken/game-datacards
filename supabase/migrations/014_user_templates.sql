-- =====================================================
-- Game Datacards - Designer Template Cloud Sync
-- Migration 014: Add user_templates table for template syncing
-- =====================================================

-- =====================================================
-- 1. Create user_templates table
-- =====================================================
-- Stores designer templates synced to cloud

CREATE TABLE IF NOT EXISTS public.user_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uuid TEXT NOT NULL,
  name TEXT NOT NULL,
  target_format TEXT,
  canvas JSONB NOT NULL,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INTEGER DEFAULT 1,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_template UNIQUE(user_id, uuid)
);

-- Trigger to update updated_at and last_modified timestamps
CREATE TRIGGER update_user_templates_timestamps
  BEFORE UPDATE ON public.user_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. Enable RLS with policies
-- =====================================================

ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON public.user_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own templates
CREATE POLICY "Users can insert own templates"
  ON public.user_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON public.user_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON public.user_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. Enable Realtime
-- =====================================================

-- Enable REPLICA IDENTITY FULL for proper DELETE event handling
ALTER TABLE user_templates REPLICA IDENTITY FULL;

-- Create index on device_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_templates_device_id ON user_templates(device_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_templates;

-- =====================================================
-- 4. Update get_tier_limits function to include templates
-- =====================================================

CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE p_tier
    WHEN 'lifetime' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99,
        'templates', 99
      );
    WHEN 'admin' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99,
        'templates', 99
      );
    WHEN 'creator' THEN
      RETURN jsonb_build_object(
        'categories', 250,
        'datasources', 10,
        'templates', 5
      );
    WHEN 'premium' THEN
      RETURN jsonb_build_object(
        'categories', 50,
        'datasources', 2,
        'templates', 1
      );
    ELSE -- 'free' or any other value
      RETURN jsonb_build_object(
        'categories', 2,
        'datasources', 0,
        'templates', 0
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 5. Create validation function for templates
-- =====================================================

CREATE OR REPLACE FUNCTION validate_template_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_templates INT;
  v_current_count INT;
BEGIN
  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_templates := (v_limits->>'templates')::INT;

  -- Free tier cannot sync any templates
  IF v_max_templates = 0 THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:templates:0:0;%',
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade to Premium or Creator tier to sync templates';
  END IF;

  -- Count existing templates for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_templates
  WHERE user_id = NEW.user_id;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_templates THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:templates:%:%;%',
      v_current_count,
      v_max_templates,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to sync more templates';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Create trigger for template limit enforcement
-- =====================================================

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS enforce_template_limit ON public.user_templates;

-- Create trigger for templates (only on INSERT, not UPDATE)
CREATE TRIGGER enforce_template_limit
  BEFORE INSERT ON public.user_templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_template_limit();

-- =====================================================
-- 7. Update check_subscription_limit function
-- =====================================================

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
  IF p_resource NOT IN ('categories', 'datasources', 'templates') THEN
    RETURN jsonb_build_object(
      'error', 'Invalid resource type. Use ''categories'', ''datasources'', or ''templates'''
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
  ELSIF p_resource = 'datasources' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = p_user_id;
  ELSE -- templates
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_templates
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

-- =====================================================
-- 8. Update get_subscription_usage function
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
  v_template_count INT;
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

  SELECT COUNT(*) INTO v_template_count
  FROM public.user_templates
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
    ),
    'templates', jsonb_build_object(
      'current', v_template_count,
      'limit', (v_limits->>'templates')::INT,
      'remaining', GREATEST(0, (v_limits->>'templates')::INT - v_template_count)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 9. Comments for documentation
-- =====================================================

COMMENT ON TABLE public.user_templates IS
  'Designer templates synced to cloud (0 for free, 1 for premium, 5 for creator, 99 for lifetime/admin)';

COMMENT ON FUNCTION validate_template_limit() IS
  'Trigger function that enforces template limits based on subscription tier';

COMMENT ON COLUMN public.user_templates.version IS
  'Incremented on each update for conflict detection';

COMMENT ON COLUMN public.user_templates.uuid IS
  'Matches client-side template UUID for syncing';

COMMENT ON COLUMN public.user_templates.canvas IS
  'Canvas settings including width, height, background color';

COMMENT ON COLUMN public.user_templates.elements IS
  'Array of template elements (text, images, shapes, frames)';

-- =====================================================
-- 10. Re-analyze affected tables
-- =====================================================

ANALYZE public.user_templates;
ANALYZE public.user_profiles;
