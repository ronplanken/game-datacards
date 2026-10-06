-- =====================================================
-- Game Datacards - Realtime Sync Setup
-- Migration 007: Enable realtime for user_categories
-- =====================================================

-- Add device_id column to track which device made changes
-- This allows us to ignore our own changes in realtime subscriptions
ALTER TABLE user_categories ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Enable REPLICA IDENTITY FULL for the user_categories table
-- This ensures DELETE events include the full row data (not just the primary key)
-- Required for proper handling of deleted categories in realtime subscriptions
ALTER TABLE user_categories REPLICA IDENTITY FULL;

-- Create index on device_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_categories_device_id ON user_categories(device_id);

-- Enable Realtime for user_categories table
-- This adds the table to Supabase's realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_categories;
