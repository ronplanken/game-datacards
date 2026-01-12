-- =====================================================
-- Game Datacards - Combined Database Schema
-- Fresh Install Migration (Consolidates migrations 001-013)
-- =====================================================

-- =====================================================
-- SECTION 1: Extensions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 2: Tables
-- =====================================================

-- -----------------------------------------------------
-- User Profiles Table
-- Extended user information beyond auth.users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'creator', 'lifetime', 'admin')),
  creem_customer_id TEXT,
  creem_subscription_id TEXT,
  creem_product_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- User Categories Table (Cloud Backup)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uuid TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('category', 'list')),
  parent_id TEXT,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  closed BOOLEAN DEFAULT false,
  device_id TEXT,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE(user_id, uuid)
);

-- -----------------------------------------------------
-- User Datasources Table (Paid Feature)
-- Includes sharing, edit/publish workflow, and soft delete
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_datasources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datasource_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_format TEXT,
  version TEXT,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  downloads INTEGER DEFAULT 0,
  -- Sharing columns
  author_name TEXT,
  description TEXT,
  game_system TEXT,
  version_number INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  subscriber_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  device_id TEXT,
  -- Edit/publish workflow columns
  edit_data JSONB,
  published_data JSONB,
  is_uploaded BOOLEAN DEFAULT false,
  edit_version INTEGER DEFAULT 1,
  last_edit_sync TIMESTAMPTZ,
  -- Soft delete columns
  deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraints
  CONSTRAINT unique_user_datasource UNIQUE(user_id, datasource_id),
  CONSTRAINT valid_game_system CHECK (game_system IS NULL OR game_system IN (
    '40k-10e', '40k', 'aos', 'necromunda', 'basic', 'horus-heresy', 'other'
  ))
);

-- -----------------------------------------------------
-- Category Shares Table (Public Sharing)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.category_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_id TEXT UNIQUE NOT NULL,
  category JSONB NOT NULL,
  description TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Sync Metadata Table (For Conflict Resolution)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  device_id TEXT,
  sync_version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Datasource Subscriptions Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.datasource_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datasource_id UUID REFERENCES public.user_datasources(id) ON DELETE CASCADE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_version INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_subscription UNIQUE(user_id, datasource_id)
);

-- =====================================================
-- SECTION 3: Trigger Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_modified timestamp (for user_categories)
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update subscriber count
CREATE OR REPLACE FUNCTION update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_datasources
    SET subscriber_count = subscriber_count + 1
    WHERE id = NEW.datasource_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_datasources
    SET subscriber_count = GREATEST(subscriber_count - 1, 0)
    WHERE id = OLD.datasource_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 4: Table Triggers
-- =====================================================

-- User profiles updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User categories last_modified trigger
CREATE TRIGGER update_user_categories_last_modified
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_last_modified_column();

-- User datasources updated_at trigger
CREATE TRIGGER update_user_datasources_updated_at
  BEFORE UPDATE ON public.user_datasources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sync metadata updated_at trigger
CREATE TRIGGER update_sync_metadata_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Subscriber count trigger
CREATE TRIGGER trigger_update_subscriber_count
  AFTER INSERT OR DELETE ON public.datasource_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriber_count();

-- =====================================================
-- SECTION 5: Helper Functions
-- =====================================================

-- Function to generate short share codes
CREATE OR REPLACE FUNCTION public.generate_share_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 6: Auth Trigger (New User Handler)
-- =====================================================

-- Function to automatically create user_profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.sync_metadata (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 7: Row Level Security
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_datasources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasource_subscriptions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- User Profiles Policies
-- -----------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- -----------------------------------------------------
-- User Categories Policies
-- -----------------------------------------------------
CREATE POLICY "Users can view own categories"
  ON public.user_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.user_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.user_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.user_categories FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- User Datasources Policies (with soft delete support)
-- -----------------------------------------------------
CREATE POLICY "Users can view own datasources"
  ON public.user_datasources FOR SELECT
  USING (user_id = auth.uid() AND deleted = false);

CREATE POLICY "Anyone can view public datasources"
  ON public.user_datasources FOR SELECT
  USING (is_public = true AND deleted = false);

CREATE POLICY "Users can insert own datasources"
  ON public.user_datasources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasources"
  ON public.user_datasources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasources"
  ON public.user_datasources FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Category Shares Policies
-- -----------------------------------------------------
CREATE POLICY "Anyone can view shares"
  ON public.category_shares FOR SELECT
  USING (true);

CREATE POLICY "Users can create shares"
  ON public.category_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own shares"
  ON public.category_shares FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
  ON public.category_shares FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Sync Metadata Policies
-- -----------------------------------------------------
CREATE POLICY "Users can view own sync metadata"
  ON public.sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sync metadata"
  ON public.sync_metadata FOR UPDATE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Datasource Subscriptions Policies
-- -----------------------------------------------------
CREATE POLICY "Users can view own subscriptions"
  ON public.datasource_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to public datasources"
  ON public.datasource_subscriptions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_datasources ud
      WHERE ud.id = public.datasource_subscriptions.datasource_id AND ud.is_public = true
    )
  );

CREATE POLICY "Users can update own subscriptions"
  ON public.datasource_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.datasource_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 8: Indexes
-- =====================================================

-- -----------------------------------------------------
-- User Profiles Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_profiles_creem_customer_id
  ON public.user_profiles(creem_customer_id)
  WHERE creem_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_creem_subscription_id
  ON public.user_profiles(creem_subscription_id)
  WHERE creem_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier
  ON public.user_profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expires
  ON public.user_profiles(subscription_expires_at)
  WHERE subscription_expires_at IS NOT NULL;

-- -----------------------------------------------------
-- User Categories Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id
  ON public.user_categories(user_id);

CREATE INDEX IF NOT EXISTS idx_user_categories_user_last_modified
  ON public.user_categories(user_id, last_modified DESC);

CREATE INDEX IF NOT EXISTS idx_user_categories_uuid
  ON public.user_categories(uuid);

CREATE INDEX IF NOT EXISTS idx_user_categories_user_uuid
  ON public.user_categories(user_id, uuid);

CREATE INDEX IF NOT EXISTS idx_user_categories_parent_id
  ON public.user_categories(parent_id)
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_categories_device_id
  ON public.user_categories(device_id);

-- -----------------------------------------------------
-- User Datasources Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_datasources_user_id
  ON public.user_datasources(user_id);

CREATE INDEX IF NOT EXISTS idx_user_datasources_public
  ON public.user_datasources(is_public)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_share_code
  ON public.user_datasources(share_code)
  WHERE share_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_datasources_user_datasource_id
  ON public.user_datasources(user_id, datasource_id);

CREATE INDEX IF NOT EXISTS idx_user_datasources_downloads
  ON public.user_datasources(downloads DESC)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_game_system
  ON public.user_datasources(game_system)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_featured
  ON public.user_datasources(featured)
  WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_published_at
  ON public.user_datasources(published_at DESC)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_uploaded
  ON public.user_datasources(is_uploaded)
  WHERE is_uploaded = true AND is_public = false;

CREATE INDEX IF NOT EXISTS idx_user_datasources_not_deleted
  ON public.user_datasources(user_id)
  WHERE deleted = false;

-- -----------------------------------------------------
-- Category Shares Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_category_shares_share_id
  ON public.category_shares(share_id);

CREATE INDEX IF NOT EXISTS idx_category_shares_user_id
  ON public.category_shares(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_category_shares_views
  ON public.category_shares(views DESC);

CREATE INDEX IF NOT EXISTS idx_category_shares_created_at
  ON public.category_shares(created_at DESC);

-- -----------------------------------------------------
-- Sync Metadata Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sync_metadata_user_id
  ON public.sync_metadata(user_id);

CREATE INDEX IF NOT EXISTS idx_sync_metadata_last_sync
  ON public.sync_metadata(last_sync_at DESC)
  WHERE last_sync_at IS NOT NULL;

-- -----------------------------------------------------
-- Datasource Subscriptions Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.datasource_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_datasource_id
  ON public.datasource_subscriptions(datasource_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_outdated
  ON public.datasource_subscriptions(datasource_id, last_synced_version);

-- =====================================================
-- SECTION 9: Realtime Configuration
-- =====================================================

-- Enable REPLICA IDENTITY FULL for realtime tables
ALTER TABLE public.user_categories REPLICA IDENTITY FULL;
ALTER TABLE public.datasource_subscriptions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_categories;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.datasource_subscriptions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- SECTION 10: Subscription Limit Functions
-- =====================================================

-- Function to get effective subscription tier (accounts for expiry)
CREATE OR REPLACE FUNCTION get_effective_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
  v_expires_at TIMESTAMPTZ;
  v_status TEXT;
BEGIN
  SELECT
    subscription_tier,
    subscription_expires_at,
    subscription_status
  INTO v_tier, v_expires_at, v_status
  FROM public.user_profiles
  WHERE id = p_user_id;

  IF v_tier IS NULL THEN
    RETURN 'free';
  END IF;

  -- Lifetime and admin tiers never expire
  IF v_tier IN ('lifetime', 'admin') THEN
    RETURN v_tier;
  END IF;

  IF v_tier IN ('premium', 'creator') THEN
    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
      RETURN 'free';
    END IF;
    IF v_status = 'expired' THEN
      RETURN 'free';
    END IF;
  END IF;

  RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get tier limits
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
    ELSE
      RETURN jsonb_build_object(
        'categories', 2,
        'datasources', 0
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validation function for category limits
CREATE OR REPLACE FUNCTION validate_category_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_categories INT;
  v_current_count INT;
BEGIN
  v_effective_tier := get_effective_tier(NEW.user_id);
  v_limits := get_tier_limits(v_effective_tier);
  v_max_categories := (v_limits->>'categories')::INT;

  SELECT COUNT(*) INTO v_current_count
  FROM public.user_categories
  WHERE user_id = NEW.user_id;

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

-- Validation function for datasource limits (excludes deleted)
CREATE OR REPLACE FUNCTION validate_datasource_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  v_effective_tier := get_effective_tier(NEW.user_id);
  v_limits := get_tier_limits(v_effective_tier);
  v_max_datasources := (v_limits->>'datasources')::INT;

  IF v_max_datasources = 0 THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:datasources:0:0;%',
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade to Premium or Creator tier to upload custom datasources';
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.user_datasources
  WHERE user_id = NEW.user_id AND deleted = false;

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

-- Limit enforcement triggers
CREATE TRIGGER enforce_category_limit
  BEFORE INSERT ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_limit();

CREATE TRIGGER enforce_datasource_limit
  BEFORE INSERT ON public.user_datasources
  FOR EACH ROW
  EXECUTE FUNCTION validate_datasource_limit();

-- Client-callable function to check limits (excludes deleted)
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
  IF p_resource NOT IN ('categories', 'datasources') THEN
    RETURN jsonb_build_object(
      'error', 'Invalid resource type. Use ''categories'' or ''datasources'''
    );
  END IF;

  v_effective_tier := get_effective_tier(p_user_id);
  v_limits := get_tier_limits(v_effective_tier);
  v_max_count := (v_limits->>p_resource)::INT;

  IF p_resource = 'categories' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_categories
    WHERE user_id = p_user_id;
  ELSE
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = p_user_id AND deleted = false;
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

GRANT EXECUTE ON FUNCTION check_subscription_limit(TEXT, UUID) TO authenticated;

-- Get subscription usage (excludes deleted)
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
  v_effective_tier := get_effective_tier(p_user_id);
  v_limits := get_tier_limits(v_effective_tier);

  SELECT COUNT(*) INTO v_category_count
  FROM public.user_categories
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_datasource_count
  FROM public.user_datasources
  WHERE user_id = p_user_id AND deleted = false;

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

GRANT EXECUTE ON FUNCTION get_subscription_usage(UUID) TO authenticated;

-- =====================================================
-- SECTION 11: Datasource Sharing RPC Functions
-- =====================================================

-- Browse public datasources (excludes deleted)
CREATE OR REPLACE FUNCTION browse_public_datasources(
  p_game_system TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'popular',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  game_system TEXT,
  display_format TEXT,
  version TEXT,
  version_number INT,
  downloads INT,
  subscriber_count BIGINT,
  share_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_subscribed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.game_system,
    d.display_format,
    d.version,
    d.version_number,
    d.downloads,
    (SELECT COUNT(*) FROM public.datasource_subscriptions WHERE datasource_id = d.id) as subscriber_count,
    d.share_code,
    d.created_at,
    d.updated_at,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions
      WHERE datasource_id = d.id AND user_id = auth.uid()
    ) as is_subscribed
  FROM public.user_datasources d
  WHERE
    d.is_public = true
    AND d.deleted = false
    AND (p_game_system IS NULL OR d.game_system = p_game_system)
    AND (p_search_query IS NULL OR d.name ILIKE '%' || p_search_query || '%' OR d.description ILIKE '%' || p_search_query || '%')
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN d.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'subscribers' THEN (SELECT COUNT(*) FROM public.datasource_subscriptions WHERE datasource_id = d.id) END DESC NULLS LAST,
    d.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO anon;

-- Get datasource by share code
CREATE OR REPLACE FUNCTION get_datasource_by_share_code(p_share_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  author_id UUID,
  game_system TEXT,
  version TEXT,
  version_number INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  published_data JSONB,
  is_subscribed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.user_id AS author_id,
    d.game_system,
    d.version,
    d.version_number,
    d.downloads,
    d.subscriber_count,
    d.published_data,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions s
      WHERE s.datasource_id = d.id AND s.user_id = auth.uid()
    ) AS is_subscribed
  FROM public.user_datasources d
  WHERE d.share_code = p_share_code AND d.is_public = true AND d.deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_datasource_by_share_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_datasource_by_share_code(TEXT) TO anon;

-- Subscribe to datasource
CREATE OR REPLACE FUNCTION subscribe_to_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
  v_existing_sub RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_id AND is_public = true AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not public');
  END IF;

  IF v_datasource.user_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot subscribe to your own datasource');
  END IF;

  SELECT * INTO v_existing_sub
  FROM public.datasource_subscriptions
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_existing_sub IS NOT NULL THEN
    UPDATE public.datasource_subscriptions
    SET last_synced_version = v_datasource.version_number,
        last_synced_at = NOW()
    WHERE id = v_existing_sub.id;

    RETURN jsonb_build_object(
      'success', true,
      'datasource_id', p_datasource_id,
      'version_number', v_datasource.version_number,
      'already_subscribed', true
    );
  END IF;

  INSERT INTO public.datasource_subscriptions (user_id, datasource_id, last_synced_version, last_synced_at)
  VALUES (v_user_id, p_datasource_id, v_datasource.version_number, NOW());

  UPDATE public.user_datasources
  SET downloads = downloads + 1
  WHERE id = p_datasource_id;

  RETURN jsonb_build_object(
    'success', true,
    'datasource_id', p_datasource_id,
    'version_number', v_datasource.version_number,
    'already_subscribed', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION subscribe_to_datasource(UUID) TO authenticated;

-- Unsubscribe from datasource
CREATE OR REPLACE FUNCTION unsubscribe_from_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  DELETE FROM public.datasource_subscriptions
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unsubscribe_from_datasource(UUID) TO authenticated;

-- Get user's subscriptions
CREATE OR REPLACE FUNCTION get_my_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  datasource_id UUID,
  datasource_name TEXT,
  author_name TEXT,
  game_system TEXT,
  version TEXT,
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
    d.id AS datasource_id,
    d.name AS datasource_name,
    d.author_name,
    d.game_system,
    d.version,
    d.version_number AS current_version,
    s.last_synced_version AS subscribed_version,
    (d.version_number > s.last_synced_version) AS has_update,
    s.subscribed_at,
    s.last_synced_at
  FROM public.datasource_subscriptions s
  JOIN public.user_datasources d ON d.id = s.datasource_id
  WHERE s.user_id = auth.uid() AND d.deleted = false
  ORDER BY s.subscribed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_subscriptions() TO authenticated;

-- Get subscription updates
CREATE OR REPLACE FUNCTION get_subscription_updates()
RETURNS TABLE (
  subscription_id UUID,
  datasource_id UUID,
  datasource_name TEXT,
  current_version INTEGER,
  subscribed_version INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    d.id AS datasource_id,
    d.name AS datasource_name,
    d.version_number AS current_version,
    s.last_synced_version AS subscribed_version,
    d.updated_at
  FROM public.datasource_subscriptions s
  JOIN public.user_datasources d ON d.id = s.datasource_id
  WHERE
    s.user_id = auth.uid()
    AND d.version_number > s.last_synced_version
    AND d.deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_subscription_updates() TO authenticated;

-- Mark subscription synced
CREATE OR REPLACE FUNCTION mark_subscription_synced(
  p_subscription_id UUID,
  p_version INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.datasource_subscriptions
  SET last_synced_version = p_version,
      last_synced_at = NOW()
  WHERE id = p_subscription_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_subscription_synced(UUID, INTEGER) TO authenticated;

-- Publish datasource
CREATE OR REPLACE FUNCTION publish_datasource(
  p_datasource_db_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_share_code TEXT;
  v_datasource RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  IF v_datasource.share_code IS NOT NULL THEN
    v_share_code := v_datasource.share_code;
  ELSE
    v_share_code := public.generate_share_code(8);
    WHILE EXISTS (SELECT 1 FROM public.user_datasources WHERE share_code = v_share_code) LOOP
      v_share_code := public.generate_share_code(8);
    END LOOP;
  END IF;

  UPDATE public.user_datasources
  SET
    is_public = true,
    share_code = v_share_code,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW())
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'share_code', v_share_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION publish_datasource(UUID, TEXT, TEXT) TO authenticated;

-- Unpublish datasource
CREATE OR REPLACE FUNCTION unpublish_datasource(p_datasource_db_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_datasources
    WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  SELECT COUNT(*) INTO v_sub_count
  FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  DELETE FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  UPDATE public.user_datasources
  SET is_public = false,
      subscriber_count = 0
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unpublish_datasource(UUID) TO authenticated;

-- Update published datasource
CREATE OR REPLACE FUNCTION update_published_datasource(
  p_datasource_db_id UUID,
  p_data JSONB,
  p_version TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_old_version INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT version_number INTO v_old_version
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false;

  IF v_old_version IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  UPDATE public.user_datasources
  SET
    published_data = p_data,
    version = p_version,
    version_number = v_old_version + 1,
    updated_at = NOW()
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_version_number', v_old_version + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_published_datasource(UUID, JSONB, TEXT) TO authenticated;

-- Get my datasources (excludes deleted)
CREATE OR REPLACE FUNCTION get_my_datasources()
RETURNS SETOF public.user_datasources AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.user_datasources
  WHERE user_id = auth.uid() AND deleted = false
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_datasources() TO authenticated;

-- Get featured datasources
CREATE OR REPLACE FUNCTION get_featured_datasources(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  game_system TEXT,
  downloads INTEGER,
  subscriber_count INTEGER,
  share_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.game_system,
    d.downloads,
    d.subscriber_count,
    d.share_code
  FROM public.user_datasources d
  WHERE d.is_public = true AND d.featured = true AND d.deleted = false
  ORDER BY d.downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_featured_datasources(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_datasources(INTEGER) TO anon;

-- =====================================================
-- SECTION 12: Local Datasource Functions
-- =====================================================

-- Sync local datasource edit data
CREATE OR REPLACE FUNCTION sync_local_datasource(
  p_datasource_id TEXT,
  p_name TEXT,
  p_edit_data JSONB,
  p_edit_version INTEGER,
  p_version TEXT,
  p_author_name TEXT DEFAULT NULL,
  p_display_format TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing RECORD;
  v_new_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_existing
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id AND deleted = false;

  IF v_existing IS NOT NULL THEN
    IF v_existing.edit_version > p_edit_version AND v_existing.device_id != p_device_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'version_conflict',
        'cloud_version', v_existing.edit_version,
        'local_version', p_edit_version,
        'cloud_data', v_existing.edit_data
      );
    END IF;

    UPDATE public.user_datasources
    SET
      name = p_name,
      edit_data = p_edit_data,
      edit_version = p_edit_version,
      version = p_version,
      author_name = COALESCE(p_author_name, author_name),
      display_format = COALESCE(p_display_format, display_format),
      game_system = COALESCE(p_game_system, game_system),
      device_id = p_device_id,
      last_edit_sync = NOW(),
      is_uploaded = true,
      updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing.id,
      'edit_version', p_edit_version
    );
  ELSE
    INSERT INTO public.user_datasources (
      user_id,
      datasource_id,
      name,
      edit_data,
      edit_version,
      version,
      author_name,
      display_format,
      game_system,
      device_id,
      last_edit_sync,
      is_uploaded,
      is_public
    ) VALUES (
      v_user_id,
      p_datasource_id,
      p_name,
      p_edit_data,
      p_edit_version,
      p_version,
      p_author_name,
      p_display_format,
      p_game_system,
      p_device_id,
      NOW(),
      true,
      false
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_new_id,
      'edit_version', p_edit_version
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sync_local_datasource(TEXT, TEXT, JSONB, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Publish local datasource
CREATE OR REPLACE FUNCTION publish_local_datasource(
  p_datasource_db_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_share_code TEXT;
  v_datasource RECORD;
  v_new_version INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  IF v_datasource.edit_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No edit data to publish');
  END IF;

  v_new_version := COALESCE(v_datasource.version_number, 0) + 1;

  IF v_datasource.share_code IS NOT NULL THEN
    v_share_code := v_datasource.share_code;
  ELSE
    v_share_code := public.generate_share_code(8);
    WHILE EXISTS (SELECT 1 FROM public.user_datasources WHERE share_code = v_share_code) LOOP
      v_share_code := public.generate_share_code(8);
    END LOOP;
  END IF;

  UPDATE public.user_datasources
  SET
    published_data = edit_data,
    is_public = true,
    share_code = v_share_code,
    version_number = v_new_version,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW()),
    updated_at = NOW()
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'share_code', v_share_code,
    'version_number', v_new_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION publish_local_datasource(UUID, TEXT, TEXT) TO authenticated;

-- Push datasource update
CREATE OR REPLACE FUNCTION push_datasource_update(
  p_datasource_db_id UUID,
  p_new_version TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
  v_new_version_number INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  IF NOT v_datasource.is_public THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource is not published');
  END IF;

  IF v_datasource.edit_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No edit data to push');
  END IF;

  v_new_version_number := COALESCE(v_datasource.version_number, 1) + 1;

  UPDATE public.user_datasources
  SET
    published_data = edit_data,
    version = COALESCE(p_new_version, version),
    version_number = v_new_version_number,
    updated_at = NOW()
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'version_number', v_new_version_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION push_datasource_update(UUID, TEXT) TO authenticated;

-- Get local datasource edit data
CREATE OR REPLACE FUNCTION get_local_datasource_edit(p_datasource_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_datasource.id,
    'datasource_id', v_datasource.datasource_id,
    'name', v_datasource.name,
    'edit_data', v_datasource.edit_data,
    'edit_version', v_datasource.edit_version,
    'version', v_datasource.version,
    'is_public', v_datasource.is_public,
    'is_uploaded', v_datasource.is_uploaded,
    'share_code', v_datasource.share_code,
    'version_number', v_datasource.version_number,
    'last_edit_sync', v_datasource.last_edit_sync
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_local_datasource_edit(TEXT) TO authenticated;

-- Delete local datasource (soft delete)
CREATE OR REPLACE FUNCTION delete_local_datasource(p_datasource_db_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_datasources
    WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  SELECT COUNT(*) INTO v_sub_count
  FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  UPDATE public.user_datasources
  SET
    deleted = true,
    deleted_at = NOW(),
    is_public = false,
    updated_at = NOW()
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  DELETE FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_local_datasource(UUID) TO authenticated;

-- Admin function to view deleted datasources
CREATE OR REPLACE FUNCTION admin_get_deleted_datasources(
  p_user_id UUID DEFAULT NULL
)
RETURNS SETOF public.user_datasources AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT *
    FROM public.user_datasources
    WHERE user_id = p_user_id AND deleted = true
    ORDER BY deleted_at DESC;
  ELSE
    RETURN QUERY
    SELECT *
    FROM public.user_datasources
    WHERE deleted = true
    ORDER BY deleted_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

REVOKE ALL ON FUNCTION admin_get_deleted_datasources(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_get_deleted_datasources(UUID) FROM authenticated;

-- =====================================================
-- SECTION 13: Comments for Documentation
-- =====================================================

-- Table comments
COMMENT ON TABLE public.user_profiles IS 'Extended user information and subscription details';
COMMENT ON TABLE public.user_categories IS 'User categories backed up to cloud (2 for free, 50 for premium, 250 for creator)';
COMMENT ON TABLE public.user_datasources IS 'Custom datasources uploaded by paid users';
COMMENT ON TABLE public.category_shares IS 'Publicly shared categories';
COMMENT ON TABLE public.sync_metadata IS 'Sync state tracking for conflict resolution';
COMMENT ON TABLE public.datasource_subscriptions IS 'Tracks user subscriptions to public datasources';

-- Column comments
COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'Subscription tier: free (2 categories), premium (50 categories, 2 datasources), creator (250 categories, 10 datasources), lifetime (999 categories, 99 datasources - non-purchasable), admin (999 categories, 99 datasources - non-purchasable)';
COMMENT ON COLUMN public.user_profiles.creem_customer_id IS 'Creem customer ID for payment management';
COMMENT ON COLUMN public.user_profiles.creem_subscription_id IS 'Creem subscription ID for active subscription';
COMMENT ON COLUMN public.user_profiles.creem_product_id IS 'Creem product ID for the current subscription';
COMMENT ON COLUMN public.user_categories.version IS 'Incremented on each update for conflict detection';
COMMENT ON COLUMN public.user_categories.uuid IS 'Matches client-side category UUID for syncing';
COMMENT ON COLUMN public.user_datasources.share_code IS 'Short code for public sharing';
COMMENT ON COLUMN public.user_datasources.author_name IS 'Display name of the datasource author';
COMMENT ON COLUMN public.user_datasources.description IS 'User-provided description of the datasource';
COMMENT ON COLUMN public.user_datasources.game_system IS 'Game system category (40k-10e, aos, necromunda, etc.)';
COMMENT ON COLUMN public.user_datasources.version_number IS 'Integer version counter, increments on each update';
COMMENT ON COLUMN public.user_datasources.published_at IS 'Timestamp when datasource was first made public';
COMMENT ON COLUMN public.user_datasources.subscriber_count IS 'Cached count of subscribers (maintained by trigger)';
COMMENT ON COLUMN public.user_datasources.featured IS 'Admin-controlled flag for featured datasources';
COMMENT ON COLUMN public.user_datasources.edit_data IS 'Owner working copy of datasource data (syncs like categories)';
COMMENT ON COLUMN public.user_datasources.published_data IS 'Public version for subscribers (snapshot at time of publish)';
COMMENT ON COLUMN public.user_datasources.is_uploaded IS 'Whether datasource has been uploaded to cloud (may not be public)';
COMMENT ON COLUMN public.user_datasources.edit_version IS 'Version counter for edit_data (increments on each sync)';
COMMENT ON COLUMN public.user_datasources.last_edit_sync IS 'Timestamp of last edit_data sync';
COMMENT ON COLUMN public.user_datasources.deleted IS 'Soft delete flag - true means datasource is deleted but retained for admin';
COMMENT ON COLUMN public.user_datasources.deleted_at IS 'Timestamp when datasource was soft deleted';
COMMENT ON COLUMN public.datasource_subscriptions.last_synced_version IS 'Version number user last synced, for update detection';

-- Function comments
COMMENT ON FUNCTION get_effective_tier(UUID) IS 'Returns the effective subscription tier for a user, accounting for expiry';
COMMENT ON FUNCTION get_tier_limits(TEXT) IS 'Returns the resource limits for a given subscription tier as JSONB';
COMMENT ON FUNCTION validate_category_limit() IS 'Trigger function that enforces category limits based on subscription tier';
COMMENT ON FUNCTION validate_datasource_limit() IS 'Trigger function that enforces datasource limits based on subscription tier';
COMMENT ON FUNCTION check_subscription_limit(TEXT, UUID) IS 'Client-callable function to check if a user can add more of a resource';
COMMENT ON FUNCTION get_subscription_usage(UUID) IS 'Returns comprehensive usage statistics for a user subscription';
COMMENT ON FUNCTION browse_public_datasources IS 'Browse public datasources with filtering, sorting, and pagination';
COMMENT ON FUNCTION get_datasource_by_share_code IS 'Get a public datasource by its share code';
COMMENT ON FUNCTION subscribe_to_datasource IS 'Subscribe to a public datasource (increments download count)';
COMMENT ON FUNCTION unsubscribe_from_datasource IS 'Unsubscribe from a datasource';
COMMENT ON FUNCTION get_my_subscriptions IS 'Get all datasources the user is subscribed to';
COMMENT ON FUNCTION get_subscription_updates IS 'Get subscriptions that have newer versions available';
COMMENT ON FUNCTION mark_subscription_synced IS 'Mark a subscription as synced to a specific version';
COMMENT ON FUNCTION publish_datasource IS 'Make a datasource public with share code';
COMMENT ON FUNCTION unpublish_datasource IS 'Make a datasource private and remove all subscriptions';
COMMENT ON FUNCTION update_published_datasource IS 'Update datasource data and increment version';
COMMENT ON FUNCTION get_my_datasources IS 'Get all datasources owned by the current user';
COMMENT ON FUNCTION get_featured_datasources IS 'Get featured datasources for homepage display';
COMMENT ON FUNCTION sync_local_datasource IS 'Sync local datasource edit_data to cloud with conflict detection';
COMMENT ON FUNCTION publish_local_datasource IS 'Publish local datasource by copying edit_data to published_data';
COMMENT ON FUNCTION push_datasource_update IS 'Push update to published datasource from edit_data';
COMMENT ON FUNCTION get_local_datasource_edit IS 'Get local datasource edit data for owner';
COMMENT ON FUNCTION delete_local_datasource IS 'Soft deletes a datasource (sets deleted=true) instead of removing from database';
COMMENT ON FUNCTION admin_get_deleted_datasources IS 'Admin-only function to view soft-deleted datasources';

-- =====================================================
-- SECTION 14: Analyze Tables
-- =====================================================

ANALYZE public.user_profiles;
ANALYZE public.user_categories;
ANALYZE public.user_datasources;
ANALYZE public.category_shares;
ANALYZE public.sync_metadata;
ANALYZE public.datasource_subscriptions;
