-- =====================================================
-- Migration 018: Category Sharing Enhancement
-- Adds owner-managed sharing, soft delete, visibility controls,
-- and RPC functions for category sharing via Supabase
-- =====================================================

-- =====================================================
-- Part 1: Schema Changes to category_shares
-- =====================================================

-- Add new columns for ownership and management
ALTER TABLE public.category_shares
  ADD COLUMN IF NOT EXISTS category_uuid TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Reuse existing update_updated_at_column() trigger from migration 001
CREATE TRIGGER update_category_shares_updated_at
  BEFORE UPDATE ON public.category_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Part 2: Indexes
-- =====================================================

-- Find existing share for a category by user + category UUID
CREATE INDEX IF NOT EXISTS idx_category_shares_user_category_uuid
  ON public.category_shares (user_id, category_uuid)
  WHERE deleted = false;

-- Fast lookup of non-deleted shares by share_id
CREATE INDEX IF NOT EXISTS idx_category_shares_not_deleted
  ON public.category_shares (share_id)
  WHERE deleted = false;

-- Browse public shares
CREATE INDEX IF NOT EXISTS idx_category_shares_public
  ON public.category_shares (is_public)
  WHERE is_public = true AND deleted = false;

-- =====================================================
-- Part 3: RLS Policy Updates
-- =====================================================

-- Replace "Anyone can view shares" with visibility-aware policy
DROP POLICY IF EXISTS "Anyone can view shares" ON public.category_shares;
CREATE POLICY "Anyone can view visible shares" ON public.category_shares
  FOR SELECT
  USING (
    (is_public = true AND deleted = false)
    OR (user_id = (select auth.uid()) AND deleted = false)
  );

-- Keep existing insert policy (allows user_id IS NULL for anonymous)
-- Already fixed in migration 017

-- Add deleted check to update policy
DROP POLICY IF EXISTS "Users can update own shares" ON public.category_shares;
CREATE POLICY "Users can update own shares" ON public.category_shares
  FOR UPDATE
  USING ((select auth.uid()) = user_id AND deleted = false);

-- Add deleted check to delete policy
DROP POLICY IF EXISTS "Users can delete own shares" ON public.category_shares;
CREATE POLICY "Users can delete own shares" ON public.category_shares
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- Part 4: RPC Functions
-- =====================================================

-- Anonymous share (no auth required)
CREATE OR REPLACE FUNCTION public.share_category_anonymous(
  p_share_id TEXT,
  p_category JSONB,
  p_version TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_count INTEGER;
BEGIN
  -- Validate max 100 cards
  v_card_count := jsonb_array_length(COALESCE(p_category->'cards', '[]'::jsonb));
  IF v_card_count > 100 THEN
    RAISE EXCEPTION 'Maximum 100 cards per share (got %)', v_card_count;
  END IF;

  INSERT INTO public.category_shares (share_id, category, version, user_id, is_public, deleted, version_number)
  VALUES (p_share_id, p_category, p_version, NULL, true, false, 1);

  RETURN jsonb_build_object('success', true, 'share_id', p_share_id);
END;
$$;

-- Owned share (auth required, generates server-side share code)
CREATE OR REPLACE FUNCTION public.share_category_owned(
  p_category_uuid TEXT,
  p_category JSONB,
  p_version TEXT,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_share_id TEXT;
  v_card_count INTEGER;
  v_attempts INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate max 100 cards
  v_card_count := jsonb_array_length(COALESCE(p_category->'cards', '[]'::jsonb));
  IF v_card_count > 100 THEN
    RAISE EXCEPTION 'Maximum 100 cards per share (got %)', v_card_count;
  END IF;

  -- Generate unique share code with retry
  LOOP
    v_share_id := generate_share_code(16);
    v_attempts := v_attempts + 1;

    BEGIN
      INSERT INTO public.category_shares (
        share_id, user_id, category_uuid, category, version,
        is_public, deleted, version_number
      )
      VALUES (
        v_share_id, v_user_id, p_category_uuid, p_category, p_version,
        p_is_public, false, 1
      );
      EXIT; -- Success
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= 5 THEN
        RAISE EXCEPTION 'Failed to generate unique share code';
      END IF;
    END;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'share_id', v_share_id);
END;
$$;

-- Update shared category (full replacement, increments version)
CREATE OR REPLACE FUNCTION public.update_shared_category(
  p_share_id TEXT,
  p_category JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_card_count INTEGER;
  v_new_version INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate max 100 cards
  v_card_count := jsonb_array_length(COALESCE(p_category->'cards', '[]'::jsonb));
  IF v_card_count > 100 THEN
    RAISE EXCEPTION 'Maximum 100 cards per share (got %)', v_card_count;
  END IF;

  UPDATE public.category_shares
  SET category = p_category,
      version_number = version_number + 1
  WHERE share_id = p_share_id
    AND user_id = v_user_id
    AND deleted = false
  RETURNING version_number INTO v_new_version;

  IF v_new_version IS NULL THEN
    RAISE EXCEPTION 'Share not found or not owned by user';
  END IF;

  RETURN jsonb_build_object('success', true, 'version_number', v_new_version);
END;
$$;

-- Toggle share visibility (public/private)
CREATE OR REPLACE FUNCTION public.toggle_share_visibility(
  p_share_id TEXT,
  p_is_public BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_found BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.category_shares
  SET is_public = p_is_public
  WHERE share_id = p_share_id
    AND user_id = v_user_id
    AND deleted = false
  RETURNING true INTO v_found;

  IF v_found IS NULL THEN
    RAISE EXCEPTION 'Share not found or not owned by user';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Soft delete a shared category
CREATE OR REPLACE FUNCTION public.delete_shared_category(
  p_share_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_found BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.category_shares
  SET deleted = true,
      deleted_at = NOW(),
      is_public = false
  WHERE share_id = p_share_id
    AND user_id = v_user_id
    AND deleted = false
  RETURNING true INTO v_found;

  IF v_found IS NULL THEN
    RAISE EXCEPTION 'Share not found or not owned by user';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Get a shared category (public access, increments views)
CREATE OR REPLACE FUNCTION public.get_shared_category(
  p_share_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  SELECT share_id, category, description, views, version, version_number,
         created_at, updated_at, user_id, is_public
  INTO v_result
  FROM public.category_shares
  WHERE share_id = p_share_id
    AND deleted = false
    AND (is_public = true OR user_id = v_user_id);

  IF v_result IS NULL THEN
    RETURN NULL;
  END IF;

  -- Increment views
  UPDATE public.category_shares
  SET views = views + 1
  WHERE share_id = p_share_id AND deleted = false;

  RETURN jsonb_build_object(
    'share_id', v_result.share_id,
    'category', v_result.category,
    'description', v_result.description,
    'views', v_result.views + 1,
    'version', v_result.version,
    'version_number', v_result.version_number,
    'created_at', v_result.created_at,
    'updated_at', v_result.updated_at,
    'is_owner', v_user_id IS NOT NULL AND v_result.user_id = v_user_id,
    'is_public', v_result.is_public
  );
END;
$$;

-- Get user's own shared categories
CREATE OR REPLACE FUNCTION public.get_my_shared_categories()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'share_id', cs.share_id,
      'category_uuid', cs.category_uuid,
      'name', cs.category->>'name',
      'card_count', jsonb_array_length(COALESCE(cs.category->'cards', '[]'::jsonb)),
      'is_public', cs.is_public,
      'views', cs.views,
      'version_number', cs.version_number,
      'created_at', cs.created_at,
      'updated_at', cs.updated_at
    ) ORDER BY cs.created_at DESC
  ), '[]'::jsonb)
  INTO v_result
  FROM public.category_shares cs
  WHERE cs.user_id = v_user_id AND cs.deleted = false;

  RETURN v_result;
END;
$$;

-- Detect existing share for a category (by UUID + user)
CREATE OR REPLACE FUNCTION public.get_existing_share_for_category(
  p_category_uuid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT share_id, is_public, views, version_number, created_at, updated_at
  INTO v_result
  FROM public.category_shares
  WHERE user_id = v_user_id
    AND category_uuid = p_category_uuid
    AND deleted = false
  LIMIT 1;

  IF v_result IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'share_id', v_result.share_id,
    'is_public', v_result.is_public,
    'views', v_result.views,
    'version_number', v_result.version_number,
    'created_at', v_result.created_at,
    'updated_at', v_result.updated_at
  );
END;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.share_category_anonymous(TEXT, JSONB, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.share_category_owned(TEXT, JSONB, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_shared_category(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_share_visibility(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_shared_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_category(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_shared_categories() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_existing_share_for_category(TEXT) TO authenticated;
