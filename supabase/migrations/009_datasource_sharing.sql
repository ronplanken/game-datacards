-- =====================================================
-- Game Datacards - Custom Datasource Sharing
-- Migration 009: Schema Changes for Sharing Feature
-- =====================================================

-- =====================================================
-- Extend user_datasources Table
-- =====================================================

-- Add new columns for sharing functionality
ALTER TABLE public.user_datasources
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS game_system TEXT,
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add constraint for valid game systems
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_game_system'
  ) THEN
    ALTER TABLE public.user_datasources
      ADD CONSTRAINT valid_game_system
      CHECK (game_system IS NULL OR game_system IN (
        '40k-10e', '40k', 'aos', 'necromunda', 'basic', 'horus-heresy', 'other'
      ));
  END IF;
END $$;

-- Indexes for efficient browsing
CREATE INDEX IF NOT EXISTS idx_user_datasources_public
  ON public.user_datasources(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_game_system
  ON public.user_datasources(game_system) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_downloads
  ON public.user_datasources(downloads DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_featured
  ON public.user_datasources(featured) WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_user_datasources_published_at
  ON public.user_datasources(published_at DESC) WHERE is_public = true;

-- =====================================================
-- New datasource_subscriptions Table
-- =====================================================

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

-- Indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.datasource_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_datasource_id
  ON public.datasource_subscriptions(datasource_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_outdated
  ON public.datasource_subscriptions(datasource_id, last_synced_version);

-- =====================================================
-- Row Level Security for datasource_subscriptions
-- =====================================================

ALTER TABLE public.datasource_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.datasource_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can subscribe to public datasources
CREATE POLICY "Users can subscribe to public datasources"
  ON public.datasource_subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_datasources ud
      WHERE ud.id = public.datasource_subscriptions.datasource_id AND ud.is_public = true
    )
  );

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON public.datasource_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can unsubscribe (delete)
CREATE POLICY "Users can delete own subscriptions"
  ON public.datasource_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Subscriber Count Trigger
-- =====================================================

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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_subscriber_count ON public.datasource_subscriptions;

CREATE TRIGGER trigger_update_subscriber_count
  AFTER INSERT OR DELETE ON public.datasource_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriber_count();

-- =====================================================
-- Realtime Configuration
-- =====================================================

-- Enable realtime for subscriptions table
ALTER TABLE public.datasource_subscriptions REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.datasource_subscriptions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON COLUMN public.user_datasources.author_name IS 'Display name of the datasource author';
COMMENT ON COLUMN public.user_datasources.description IS 'User-provided description of the datasource';
COMMENT ON COLUMN public.user_datasources.game_system IS 'Game system category (40k-10e, aos, necromunda, etc.)';
COMMENT ON COLUMN public.user_datasources.version_number IS 'Integer version counter, increments on each update';
COMMENT ON COLUMN public.user_datasources.published_at IS 'Timestamp when datasource was first made public';
COMMENT ON COLUMN public.user_datasources.subscriber_count IS 'Cached count of subscribers (maintained by trigger)';
COMMENT ON COLUMN public.user_datasources.featured IS 'Admin-controlled flag for featured datasources';

COMMENT ON TABLE public.datasource_subscriptions IS 'Tracks user subscriptions to public datasources';
COMMENT ON COLUMN public.datasource_subscriptions.last_synced_version IS 'Version number user last synced, for update detection';
