-- =====================================================
-- Game Datacards - Creem Payment Integration
-- Migration 004: Replace Polar.sh with Creem
-- =====================================================

-- =====================================================
-- Rename Polar columns to Creem
-- =====================================================

-- Rename customer ID column
ALTER TABLE public.user_profiles
  RENAME COLUMN polar_customer_id TO creem_customer_id;

-- Rename subscription ID column
ALTER TABLE public.user_profiles
  RENAME COLUMN polar_subscription_id TO creem_subscription_id;

-- =====================================================
-- Update Indexes
-- =====================================================

-- Drop old Polar indexes
DROP INDEX IF EXISTS idx_user_profiles_polar_customer_id;
DROP INDEX IF EXISTS idx_user_profiles_polar_subscription_id;

-- Create new Creem indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_creem_customer_id
  ON public.user_profiles(creem_customer_id)
  WHERE creem_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_creem_subscription_id
  ON public.user_profiles(creem_subscription_id)
  WHERE creem_subscription_id IS NOT NULL;

-- =====================================================
-- Update Comments
-- =====================================================

COMMENT ON COLUMN public.user_profiles.creem_customer_id IS 'Creem customer ID for payment management';
COMMENT ON COLUMN public.user_profiles.creem_subscription_id IS 'Creem subscription ID for active subscription';

-- Re-analyze the table for query planner
ANALYZE public.user_profiles;
