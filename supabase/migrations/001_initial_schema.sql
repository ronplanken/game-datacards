-- =====================================================
-- Game Datacards - User Accounts & Online Backup
-- Migration 001: Initial Schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- User Profiles Table
-- =====================================================
-- Extended user information beyond auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid')),
  polar_customer_id TEXT,
  polar_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- User Categories Table (Cloud Backup)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uuid TEXT NOT NULL, -- Client-side UUID for syncing
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('category', 'list')),
  parent_id TEXT, -- Parent category UUID (for sub-categories)
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  closed BOOLEAN DEFAULT false,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1, -- For conflict detection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE(user_id, uuid)
);

-- Trigger to update last_modified timestamp
CREATE TRIGGER update_user_categories_last_modified
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- User Datasources Table (Paid Feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_datasources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datasource_id TEXT NOT NULL, -- Client-side datasource ID
  name TEXT NOT NULL,
  data JSONB NOT NULL, -- Full datasource JSON
  display_format TEXT,
  version TEXT,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE, -- For public sharing (e.g., "abc123")
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_datasource UNIQUE(user_id, datasource_id)
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_datasources_updated_at
  BEFORE UPDATE ON public.user_datasources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Category Shares Table (Migrated from Firebase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.category_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for backward compat
  share_id TEXT UNIQUE NOT NULL, -- Public share ID (short code)
  category JSONB NOT NULL, -- Full category JSON
  description TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  version TEXT, -- App version used to create share
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Sync Metadata Table (For Conflict Resolution)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  device_id TEXT, -- Optional: Track which device last synced
  sync_version INTEGER DEFAULT 1, -- Global sync version counter
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_sync_metadata_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Functions
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
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE public.user_profiles IS 'Extended user information and subscription details';
COMMENT ON TABLE public.user_categories IS 'User categories backed up to cloud (2 for free, 50 for paid)';
COMMENT ON TABLE public.user_datasources IS 'Custom datasources uploaded by paid users';
COMMENT ON TABLE public.category_shares IS 'Publicly shared categories (migrated from Firebase Firestore)';
COMMENT ON TABLE public.sync_metadata IS 'Sync state tracking for conflict resolution';

COMMENT ON COLUMN public.user_categories.version IS 'Incremented on each update for conflict detection';
COMMENT ON COLUMN public.user_categories.uuid IS 'Matches client-side category UUID for syncing';
COMMENT ON COLUMN public.user_datasources.share_code IS 'Short code for public sharing (e.g., game-datacards.eu/d/abc123)';
