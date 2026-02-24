-- =====================================================
-- Game Datacards - Template Publishing & Community Sharing
-- Migration 015: Add publishing columns and subscriptions table
-- =====================================================

-- =====================================================
-- 1. Extend user_templates Table for Publishing
-- =====================================================

ALTER TABLE public.user_templates
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_code VARCHAR(8) UNIQUE,
  ADD COLUMN IF NOT EXISTS published_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS game_system TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_data JSONB,
  ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Add constraint for valid game systems (reusing same systems as datasources)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_template_game_system'
  ) THEN
    ALTER TABLE public.user_templates
      ADD CONSTRAINT valid_template_game_system
      CHECK (game_system IS NULL OR game_system IN (
        '40k-10e', '40k', 'aos', 'necromunda', 'basic', 'horus-heresy', 'other'
      ));
  END IF;
END $$;

-- Indexes for efficient browsing
CREATE INDEX IF NOT EXISTS idx_user_templates_public
  ON public.user_templates(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_templates_game_system
  ON public.user_templates(game_system) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_templates_downloads
  ON public.user_templates(downloads DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_templates_featured
  ON public.user_templates(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_user_templates_published_at
  ON public.user_templates(published_at DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_templates_share_code
  ON public.user_templates(share_code) WHERE share_code IS NOT NULL;

-- =====================================================
-- 2. Create template_subscriptions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.template_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.user_templates(id) ON DELETE CASCADE NOT NULL,
  subscribed_version INTEGER DEFAULT 0,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_template_subscription UNIQUE(user_id, template_id)
);

-- Indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_template_subscriptions_user_id
  ON public.template_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_template_subscriptions_template_id
  ON public.template_subscriptions(template_id);

CREATE INDEX IF NOT EXISTS idx_template_subscriptions_outdated
  ON public.template_subscriptions(template_id, subscribed_version);

-- =====================================================
-- 3. Row Level Security for template_subscriptions
-- =====================================================

ALTER TABLE public.template_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own template subscriptions"
  ON public.template_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can subscribe to public templates
CREATE POLICY "Users can subscribe to public templates"
  ON public.template_subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_templates t
      WHERE t.id = public.template_subscriptions.template_id AND t.is_public = true
    )
  );

-- Users can update their own subscriptions
CREATE POLICY "Users can update own template subscriptions"
  ON public.template_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can unsubscribe (delete)
CREATE POLICY "Users can delete own template subscriptions"
  ON public.template_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. Update RLS for user_templates (allow public read)
-- =====================================================

-- Drop existing read policy to recreate with public access
DROP POLICY IF EXISTS "Users can view own templates" ON public.user_templates;

-- Users can view their own templates OR public templates
CREATE POLICY "Users can view own or public templates"
  ON public.user_templates
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- =====================================================
-- 5. Subscriber Count Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_template_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_templates
    SET subscriber_count = subscriber_count + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_templates
    SET subscriber_count = GREATEST(subscriber_count - 1, 0)
    WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_template_subscriber_count ON public.template_subscriptions;

CREATE TRIGGER trigger_update_template_subscriber_count
  AFTER INSERT OR DELETE ON public.template_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_template_subscriber_count();

-- =====================================================
-- 6. Realtime Configuration
-- =====================================================

-- Enable realtime for subscriptions table
ALTER TABLE public.template_subscriptions REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.template_subscriptions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 7. RPC Functions for Template Sharing
-- =====================================================

-- Browse Public Templates
CREATE OR REPLACE FUNCTION browse_public_templates(
  p_game_system TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'popular',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  template_uuid TEXT,
  name TEXT,
  description TEXT,
  author_name TEXT,
  author_id UUID,
  game_system TEXT,
  target_format TEXT,
  canvas_width INTEGER,
  canvas_height INTEGER,
  element_count INTEGER,
  published_version INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  created_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  is_subscribed BOOLEAN,
  is_featured BOOLEAN,
  share_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.uuid AS template_uuid,
    t.name,
    t.description,
    t.author_name,
    t.user_id AS author_id,
    t.game_system,
    t.target_format,
    (t.canvas->>'width')::INTEGER AS canvas_width,
    (t.canvas->>'height')::INTEGER AS canvas_height,
    jsonb_array_length(t.elements) AS element_count,
    t.published_version,
    t.downloads,
    t.subscriber_count,
    t.created_at,
    t.published_at,
    EXISTS (
      SELECT 1 FROM public.template_subscriptions s
      WHERE s.template_id = t.id AND s.user_id = auth.uid()
    ) AS is_subscribed,
    t.is_featured,
    t.share_code
  FROM public.user_templates t
  WHERE
    t.is_public = true
    AND (p_game_system IS NULL OR t.game_system = p_game_system)
    AND (
      p_search_query IS NULL
      OR t.name ILIKE '%' || p_search_query || '%'
      OR t.description ILIKE '%' || p_search_query || '%'
      OR t.author_name ILIKE '%' || p_search_query || '%'
    )
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN t.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'subscribers' THEN t.subscriber_count END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN t.published_at END DESC NULLS LAST,
    t.is_featured DESC,
    t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION browse_public_templates(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_templates(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO anon;

-- Get Template by Share Code
CREATE OR REPLACE FUNCTION get_template_by_share_code(p_share_code TEXT)
RETURNS TABLE (
  id UUID,
  template_uuid TEXT,
  name TEXT,
  description TEXT,
  author_name TEXT,
  author_id UUID,
  game_system TEXT,
  target_format TEXT,
  canvas JSONB,
  elements JSONB,
  published_version INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  is_subscribed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.uuid AS template_uuid,
    t.name,
    t.description,
    t.author_name,
    t.user_id AS author_id,
    t.game_system,
    t.target_format,
    COALESCE(t.published_data->'canvas', t.canvas) AS canvas,
    COALESCE(t.published_data->'elements', t.elements) AS elements,
    t.published_version,
    t.downloads,
    t.subscriber_count,
    EXISTS (
      SELECT 1 FROM public.template_subscriptions s
      WHERE s.template_id = t.id AND s.user_id = auth.uid()
    ) AS is_subscribed
  FROM public.user_templates t
  WHERE t.share_code = p_share_code AND t.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_template_by_share_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_template_by_share_code(TEXT) TO anon;

-- Get Featured Templates
CREATE OR REPLACE FUNCTION get_featured_templates(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  template_uuid TEXT,
  name TEXT,
  description TEXT,
  author_name TEXT,
  game_system TEXT,
  target_format TEXT,
  canvas_width INTEGER,
  canvas_height INTEGER,
  element_count INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  share_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.uuid AS template_uuid,
    t.name,
    t.description,
    t.author_name,
    t.game_system,
    t.target_format,
    (t.canvas->>'width')::INTEGER AS canvas_width,
    (t.canvas->>'height')::INTEGER AS canvas_height,
    jsonb_array_length(t.elements) AS element_count,
    t.downloads,
    t.subscriber_count,
    t.share_code
  FROM public.user_templates t
  WHERE t.is_public = true AND t.is_featured = true
  ORDER BY t.downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_featured_templates(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_templates(INTEGER) TO anon;

-- Subscribe to Template
CREATE OR REPLACE FUNCTION subscribe_to_template(p_template_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_template RECORD;
  v_existing_sub RECORD;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get template info
  SELECT * INTO v_template
  FROM public.user_templates
  WHERE id = p_template_id AND is_public = true;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found or not public');
  END IF;

  -- Prevent subscribing to own template
  IF v_template.user_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot subscribe to your own template');
  END IF;

  -- Check if already subscribed
  SELECT * INTO v_existing_sub
  FROM public.template_subscriptions
  WHERE user_id = v_user_id AND template_id = p_template_id;

  IF v_existing_sub IS NOT NULL THEN
    -- Already subscribed, just update the sync time
    UPDATE public.template_subscriptions
    SET subscribed_version = v_template.published_version,
        last_synced_at = NOW()
    WHERE id = v_existing_sub.id;

    RETURN jsonb_build_object(
      'success', true,
      'template_id', p_template_id,
      'published_version', v_template.published_version,
      'already_subscribed', true
    );
  END IF;

  -- Insert new subscription
  INSERT INTO public.template_subscriptions (user_id, template_id, subscribed_version, last_synced_at)
  VALUES (v_user_id, p_template_id, v_template.published_version, NOW());

  -- Increment download count
  UPDATE public.user_templates
  SET downloads = downloads + 1
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'template_id', p_template_id,
    'published_version', v_template.published_version,
    'already_subscribed', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION subscribe_to_template(UUID) TO authenticated;

-- Unsubscribe from Template
CREATE OR REPLACE FUNCTION unsubscribe_from_template(p_template_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  DELETE FROM public.template_subscriptions
  WHERE user_id = v_user_id AND template_id = p_template_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unsubscribe_from_template(UUID) TO authenticated;

-- Publish Template (copy canvas/elements to published_data, make public)
CREATE OR REPLACE FUNCTION publish_template(
  p_template_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_share_code TEXT;
  v_template RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get template and verify ownership
  SELECT * INTO v_template
  FROM public.user_templates
  WHERE id = p_template_id AND user_id = v_user_id;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found or not owned by user');
  END IF;

  -- Use existing share code or generate new one
  IF v_template.share_code IS NOT NULL THEN
    v_share_code := v_template.share_code;
  ELSE
    -- Generate unique share code
    v_share_code := public.generate_share_code(8);
    WHILE EXISTS (SELECT 1 FROM public.user_templates WHERE share_code = v_share_code) LOOP
      v_share_code := public.generate_share_code(8);
    END LOOP;
  END IF;

  -- Update template with published state
  UPDATE public.user_templates
  SET
    is_public = true,
    share_code = v_share_code,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW()),
    published_version = COALESCE(published_version, 1),
    published_data = jsonb_build_object('canvas', canvas, 'elements', elements)
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'share_code', v_share_code,
    'published_version', COALESCE(v_template.published_version, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION publish_template(UUID, TEXT, TEXT) TO authenticated;

-- Push Template Update (copy current to published_data, increment version)
CREATE OR REPLACE FUNCTION push_template_update(p_template_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_template RECORD;
  v_new_version INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get template and verify ownership and published status
  SELECT * INTO v_template
  FROM public.user_templates
  WHERE id = p_template_id AND user_id = v_user_id;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found or not owned by user');
  END IF;

  IF NOT v_template.is_public THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template is not published');
  END IF;

  v_new_version := COALESCE(v_template.published_version, 1) + 1;

  -- Update template with new published data
  UPDATE public.user_templates
  SET
    published_version = v_new_version,
    published_data = jsonb_build_object('canvas', canvas, 'elements', elements),
    updated_at = NOW()
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_version_number', v_new_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION push_template_update(UUID) TO authenticated;

-- Unpublish Template
CREATE OR REPLACE FUNCTION unpublish_template(p_template_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.user_templates
    WHERE id = p_template_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found or not owned by user');
  END IF;

  -- Count subscriptions that will be removed
  SELECT COUNT(*) INTO v_sub_count
  FROM public.template_subscriptions
  WHERE template_id = p_template_id;

  -- Remove all subscriptions
  DELETE FROM public.template_subscriptions
  WHERE template_id = p_template_id;

  -- Mark as private (keep share_code for potential republish)
  UPDATE public.user_templates
  SET is_public = false,
      subscriber_count = 0
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unpublish_template(UUID) TO authenticated;

-- Get User's Template Subscriptions
CREATE OR REPLACE FUNCTION get_my_template_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  template_id UUID,
  template_name TEXT,
  author_name TEXT,
  game_system TEXT,
  target_format TEXT,
  current_version INTEGER,
  subscribed_version INTEGER,
  has_update BOOLEAN,
  subscribed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    t.id AS template_id,
    t.name AS template_name,
    t.author_name,
    t.game_system,
    t.target_format,
    t.published_version AS current_version,
    s.subscribed_version,
    (t.published_version > s.subscribed_version) AS has_update,
    s.subscribed_at,
    s.last_synced_at
  FROM public.template_subscriptions s
  JOIN public.user_templates t ON t.id = s.template_id
  WHERE s.user_id = auth.uid()
  ORDER BY s.subscribed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_template_subscriptions() TO authenticated;

-- Get My Published Templates
CREATE OR REPLACE FUNCTION get_my_published_templates()
RETURNS TABLE (
  id UUID,
  template_uuid TEXT,
  name TEXT,
  description TEXT,
  game_system TEXT,
  target_format TEXT,
  published_version INTEGER,
  is_public BOOLEAN,
  share_code TEXT,
  downloads INTEGER,
  subscriber_count INTEGER,
  created_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.uuid AS template_uuid,
    t.name,
    t.description,
    t.game_system,
    t.target_format,
    t.published_version,
    t.is_public,
    t.share_code,
    t.downloads,
    t.subscriber_count,
    t.created_at,
    t.published_at
  FROM public.user_templates t
  WHERE t.user_id = auth.uid()
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_published_templates() TO authenticated;

-- Get My Published Works (both datasources and templates)
CREATE OR REPLACE FUNCTION get_my_published_works()
RETURNS JSONB AS $$
DECLARE
  v_datasources JSONB;
  v_templates JSONB;
BEGIN
  -- Get published datasources
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'type', 'datasource',
    'name', d.name,
    'description', d.description,
    'game_system', d.game_system,
    'version_number', d.version_number,
    'is_public', d.is_public,
    'share_code', d.share_code,
    'downloads', d.downloads,
    'subscriber_count', d.subscriber_count,
    'published_at', d.published_at
  ) ORDER BY d.published_at DESC), '[]'::jsonb)
  INTO v_datasources
  FROM public.user_datasources d
  WHERE d.user_id = auth.uid() AND (d.is_public = true OR d.share_code IS NOT NULL);

  -- Get published templates
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'type', 'template',
    'name', t.name,
    'description', t.description,
    'game_system', t.game_system,
    'target_format', t.target_format,
    'published_version', t.published_version,
    'is_public', t.is_public,
    'share_code', t.share_code,
    'downloads', t.downloads,
    'subscriber_count', t.subscriber_count,
    'published_at', t.published_at
  ) ORDER BY t.published_at DESC), '[]'::jsonb)
  INTO v_templates
  FROM public.user_templates t
  WHERE t.user_id = auth.uid() AND (t.is_public = true OR t.share_code IS NOT NULL);

  RETURN jsonb_build_object(
    'datasources', v_datasources,
    'templates', v_templates
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_published_works() TO authenticated;

-- =====================================================
-- 8. Comments for Documentation
-- =====================================================

COMMENT ON COLUMN public.user_templates.is_public IS 'Whether the template is publicly browsable';
COMMENT ON COLUMN public.user_templates.share_code IS 'Unique 8-character share code for direct links';
COMMENT ON COLUMN public.user_templates.published_version IS 'Version counter for published changes';
COMMENT ON COLUMN public.user_templates.description IS 'User-provided description for public listing';
COMMENT ON COLUMN public.user_templates.game_system IS 'Game system category for filtering';
COMMENT ON COLUMN public.user_templates.is_featured IS 'Admin-controlled flag for featured templates';
COMMENT ON COLUMN public.user_templates.downloads IS 'Number of times template was subscribed/downloaded';
COMMENT ON COLUMN public.user_templates.subscriber_count IS 'Current number of active subscribers';
COMMENT ON COLUMN public.user_templates.published_at IS 'Timestamp when template was first published';
COMMENT ON COLUMN public.user_templates.published_data IS 'Snapshot of canvas/elements at publish time';
COMMENT ON COLUMN public.user_templates.author_name IS 'Display name of the template author';

COMMENT ON TABLE public.template_subscriptions IS 'Tracks user subscriptions to public templates';
COMMENT ON COLUMN public.template_subscriptions.subscribed_version IS 'Version number user last synced';

COMMENT ON FUNCTION browse_public_templates IS 'Browse public templates with filtering, sorting, and pagination';
COMMENT ON FUNCTION get_template_by_share_code IS 'Get a public template by its share code';
COMMENT ON FUNCTION subscribe_to_template IS 'Subscribe to a public template (increments download count)';
COMMENT ON FUNCTION unsubscribe_from_template IS 'Unsubscribe from a template';
COMMENT ON FUNCTION publish_template IS 'Make a template public with share code';
COMMENT ON FUNCTION push_template_update IS 'Push updated template data to subscribers';
COMMENT ON FUNCTION unpublish_template IS 'Make a template private and remove all subscriptions';
COMMENT ON FUNCTION get_my_template_subscriptions IS 'Get all templates the user is subscribed to';
COMMENT ON FUNCTION get_my_published_templates IS 'Get all templates owned by the current user';
COMMENT ON FUNCTION get_my_published_works IS 'Get both datasources and templates for My Works tab';

-- =====================================================
-- 9. Re-analyze affected tables
-- =====================================================

ANALYZE public.user_templates;
ANALYZE public.template_subscriptions;
