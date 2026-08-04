-- Migration: Fix RLS linter warnings
-- Fixes: auth_rls_initplan (27 warnings) - wrap auth.uid() in (select auth.uid()) for InitPlan caching
-- Fixes: multiple_permissive_policies (4 warnings) - merge duplicate SELECT policies on user_datasources

-- ============================================================
-- Part 1: Fix auth_rls_initplan — wrap auth.uid() in subselect
-- ============================================================

-- user_profiles
ALTER POLICY "Users can view own profile" ON public.user_profiles
  USING ((select auth.uid()) = id);
ALTER POLICY "Users can update own profile" ON public.user_profiles
  USING ((select auth.uid()) = id);

-- user_categories
ALTER POLICY "Users can view own categories" ON public.user_categories
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can insert own categories" ON public.user_categories
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can update own categories" ON public.user_categories
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own categories" ON public.user_categories
  USING ((select auth.uid()) = user_id);

-- user_datasources (non-SELECT policies; SELECT handled in Part 2)
ALTER POLICY "Users can insert own datasources" ON public.user_datasources
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can update own datasources" ON public.user_datasources
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own datasources" ON public.user_datasources
  USING ((select auth.uid()) = user_id);

-- category_shares
ALTER POLICY "Users can create shares" ON public.category_shares
  WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);
ALTER POLICY "Users can update own shares" ON public.category_shares
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own shares" ON public.category_shares
  USING ((select auth.uid()) = user_id);

-- sync_metadata
ALTER POLICY "Users can view own sync metadata" ON public.sync_metadata
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can update own sync metadata" ON public.sync_metadata
  USING ((select auth.uid()) = user_id);

-- datasource_subscriptions
ALTER POLICY "Users can view own subscriptions" ON public.datasource_subscriptions
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can subscribe to public datasources" ON public.datasource_subscriptions
  WITH CHECK (
    (select auth.uid()) = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_datasources ud
      WHERE ud.id = public.datasource_subscriptions.datasource_id AND ud.is_public = true
    )
  );
ALTER POLICY "Users can update own subscriptions" ON public.datasource_subscriptions
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own subscriptions" ON public.datasource_subscriptions
  USING ((select auth.uid()) = user_id);

-- user_templates
ALTER POLICY "Users can view own or public templates" ON public.user_templates
  USING ((select auth.uid()) = user_id OR is_public = true);
ALTER POLICY "Users can insert own templates" ON public.user_templates
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "Users can update own templates" ON public.user_templates
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own templates" ON public.user_templates
  USING ((select auth.uid()) = user_id);

-- template_subscriptions
ALTER POLICY "Users can view own template subscriptions" ON public.template_subscriptions
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can subscribe to public templates" ON public.template_subscriptions
  WITH CHECK (
    (select auth.uid()) = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_templates t
      WHERE t.id = public.template_subscriptions.template_id AND t.is_public = true
    )
  );
ALTER POLICY "Users can update own template subscriptions" ON public.template_subscriptions
  USING ((select auth.uid()) = user_id);
ALTER POLICY "Users can delete own template subscriptions" ON public.template_subscriptions
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- Part 2: Fix multiple_permissive_policies — merge user_datasources SELECT policies
-- ============================================================

-- Drop the public-only SELECT policy
DROP POLICY "Anyone can view public datasources" ON public.user_datasources;

-- Rename and update the remaining SELECT policy to cover both own and public access
ALTER POLICY "Users can view own datasources" ON public.user_datasources
  RENAME TO "Users can view own or public datasources";
ALTER POLICY "Users can view own or public datasources" ON public.user_datasources
  USING ((user_id = (select auth.uid()) OR is_public = true) AND deleted = false);
