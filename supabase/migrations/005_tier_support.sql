-- =====================================================
-- Game Datacards - Premium/Creator Tier Support
-- Migration 005: Distinguish between subscription tiers
-- =====================================================

-- =====================================================
-- Update subscription_tier constraint
-- =====================================================
-- Change from 'free'/'paid' to 'free'/'premium'/'creator'

-- Step 1: Drop the old constraint
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

-- Step 2: Migrate existing 'paid' users to 'premium' BEFORE adding new constraint
UPDATE public.user_profiles
  SET subscription_tier = 'premium'
  WHERE subscription_tier = 'paid';

-- Step 3: Add the new constraint (now all values are valid)
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'premium', 'creator'));

-- =====================================================
-- Add product tracking column
-- =====================================================
-- Store Creem product ID to track which product was purchased

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS creem_product_id TEXT;

COMMENT ON COLUMN public.user_profiles.creem_product_id IS 'Creem product ID for the current subscription';

-- =====================================================
-- Update comments
-- =====================================================

COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'Subscription tier: free (2 categories), premium (50 categories, 2 datasources), creator (250 categories, 10 datasources)';

-- Re-analyze the table for query planner
ANALYZE public.user_profiles;
