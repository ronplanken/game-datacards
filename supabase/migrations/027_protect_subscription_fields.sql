-- =====================================================
-- Game Datacards - Protect Subscription Fields
-- Migration 027: Prevent users from modifying subscription/payment columns
-- =====================================================
-- Users can update their own profile (display name, etc.) but subscription
-- and payment columns must only be changed by service_role (webhook handlers)
-- or SECURITY DEFINER functions (admin RPCs).
--
-- The trigger silently resets protected columns to their original values
-- for non-service_role callers, allowing the rest of the update to proceed.

CREATE OR REPLACE FUNCTION public.prevent_subscription_field_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Service role bypasses this check (used by webhook handlers)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Admin users bypass this check (admin RPCs use SECURITY DEFINER but
  -- the role GUC remains 'authenticated', so we check is_admin() explicitly)
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Reset all protected columns to their original values
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_expires_at := OLD.subscription_expires_at;
  NEW.creem_customer_id := OLD.creem_customer_id;
  NEW.creem_subscription_id := OLD.creem_subscription_id;
  NEW.creem_product_id := OLD.creem_product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_subscription_fields ON public.user_profiles;
CREATE TRIGGER protect_subscription_fields
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_field_updates();
