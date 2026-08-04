-- Migration: Enable realtime for user_datasources
-- user_datasources was previously excluded from realtime because the table is publicly
-- accessible and every change would broadcast to all users. Now that WALRUS (Write Ahead
-- Log Realtime Unified Security) applies RLS policies to filter realtime events per user,
-- we can safely enable it — only rows matching each subscriber's RLS policy are delivered.

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_datasources;
