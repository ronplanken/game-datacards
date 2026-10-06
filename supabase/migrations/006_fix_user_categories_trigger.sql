-- =====================================================
-- Game Datacards - Fix user_categories trigger
-- Migration 006: Fix broken trigger for user_categories
-- =====================================================

-- The original trigger uses update_updated_at_column() which tries to set
-- NEW.updated_at, but user_categories uses last_modified instead.

-- Create a new function specifically for last_modified
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old broken trigger
DROP TRIGGER IF EXISTS update_user_categories_last_modified ON public.user_categories;

-- Create the new trigger with the correct function
CREATE TRIGGER update_user_categories_last_modified
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_last_modified_column();
