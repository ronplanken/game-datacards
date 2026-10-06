-- =====================================================
-- Game Datacards - User Accounts & Online Backup
-- Migration 002: Row Level Security Policies
-- =====================================================

-- =====================================================
-- Enable RLS on all tables
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_datasources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- User Profiles Policies
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users cannot delete their own profile (handled by account deletion flow)
-- Users cannot insert profiles (handled by trigger on auth.users)

-- =====================================================
-- User Categories Policies
-- =====================================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
  ON public.user_categories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON public.user_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
  ON public.user_categories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
  ON public.user_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- User Datasources Policies
-- =====================================================

-- Users can view their own datasources
CREATE POLICY "Users can view own datasources"
  ON public.user_datasources
  FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view public datasources
CREATE POLICY "Anyone can view public datasources"
  ON public.user_datasources
  FOR SELECT
  USING (is_public = true);

-- Users can insert their own datasources
CREATE POLICY "Users can insert own datasources"
  ON public.user_datasources
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own datasources
CREATE POLICY "Users can update own datasources"
  ON public.user_datasources
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own datasources
CREATE POLICY "Users can delete own datasources"
  ON public.user_datasources
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Category Shares Policies
-- =====================================================

-- Anyone can view all shares (public sharing)
CREATE POLICY "Anyone can view shares"
  ON public.category_shares
  FOR SELECT
  USING (true);

-- Authenticated users can create shares
-- user_id can be null for backward compatibility with anonymous shares
CREATE POLICY "Users can create shares"
  ON public.category_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Users can update their own shares
CREATE POLICY "Users can update own shares"
  ON public.category_shares
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON public.category_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Sync Metadata Policies
-- =====================================================

-- Users can view their own sync metadata
CREATE POLICY "Users can view own sync metadata"
  ON public.sync_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own sync metadata
CREATE POLICY "Users can update own sync metadata"
  ON public.sync_metadata
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users cannot delete sync metadata (handled by CASCADE on user deletion)

-- =====================================================
-- Additional Security Considerations
-- =====================================================

-- Prevent users from escalating their subscription tier via direct DB access
-- This is enforced at the application level and via webhook updates only
-- The RLS policies above prevent users from modifying other users' data

-- Note: Service role key can bypass RLS (used for admin functions like user deletion)
