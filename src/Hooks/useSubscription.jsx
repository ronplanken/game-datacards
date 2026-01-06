/**
 * useSubscription Hook
 *
 * Manages user subscription state and tier-based features:
 * - Fetches subscription data from user profile
 * - Provides tier checking utilities
 * - Handles Polar.sh checkout flow
 * - Enforces category and datasource limits
 * - Manages subscription status (active, expired, cancelled)
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "./useAuth";
import { message } from "antd";

const SubscriptionContext = createContext(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("`useSubscription` must be used within a `SubscriptionProvider`");
  }
  return context;
}

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    categories: 2,
    datasources: 0,
    canUploadDatasources: false,
    canAccessShares: true,
  },
  paid: {
    categories: 50,
    datasources: 100, // Reasonable limit to prevent abuse
    canUploadDatasources: true,
    canAccessShares: true,
  },
};

// Feature flags from environment
const FEATURES = {
  paidTierEnabled: process.env.REACT_APP_FEATURE_PAID_TIER_ENABLED === "true",
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated, profile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    categories: 0,
    datasources: 0,
  });

  /**
   * Get current subscription tier
   */
  const getTier = useCallback(() => {
    if (!isAuthenticated) return "free";
    if (!profile) return "free";

    // Check if subscription is active
    if (profile.subscription_tier === "paid") {
      // Check expiry
      if (profile.subscription_expires_at) {
        const expiryDate = new Date(profile.subscription_expires_at);
        if (expiryDate < new Date()) {
          return "free"; // Expired, downgrade to free
        }
      }
      return "paid";
    }

    return "free";
  }, [isAuthenticated, profile]);

  /**
   * Get limits for current tier
   */
  const getLimits = useCallback(() => {
    const tier = getTier();
    return SUBSCRIPTION_LIMITS[tier];
  }, [getTier]);

  /**
   * Check if user can perform an action based on tier
   */
  const canPerformAction = useCallback(
    (action) => {
      const limits = getLimits();

      switch (action) {
        case "add_category":
          return usage.categories < limits.categories;

        case "upload_datasource":
          return limits.canUploadDatasources && usage.datasources < limits.datasources;

        case "access_shares":
          return limits.canAccessShares;

        default:
          return false;
      }
    },
    [getLimits, usage]
  );

  /**
   * Get remaining quota for a resource
   */
  const getRemainingQuota = useCallback(
    (resource) => {
      const limits = getLimits();
      switch (resource) {
        case "categories":
          return Math.max(0, limits.categories - usage.categories);
        case "datasources":
          return Math.max(0, limits.datasources - usage.datasources);
        default:
          return 0;
      }
    },
    [getLimits, usage]
  );

  /**
   * Check if user is at or over quota
   */
  const isOverQuota = useCallback(
    (resource) => {
      return getRemainingQuota(resource) === 0;
    },
    [getRemainingQuota]
  );

  /**
   * Fetch current usage from database
   */
  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setUsage({ categories: 0, datasources: 0 });
      return;
    }

    try {
      // Fetch category count
      const { count: categoryCount, error: categoryError } = await supabase
        .from("user_categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (categoryError) throw categoryError;

      // Fetch datasource count
      const { count: datasourceCount, error: datasourceError } = await supabase
        .from("user_datasources")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (datasourceError) throw datasourceError;

      setUsage({
        categories: categoryCount || 0,
        datasources: datasourceCount || 0,
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  }, [user]);

  /**
   * Load subscription data
   */
  useEffect(() => {
    if (!isAuthenticated || !profile) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setSubscription({
      tier: getTier(),
      status: profile.subscription_status,
      expiresAt: profile.subscription_expires_at,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    });

    setLoading(false);
  }, [isAuthenticated, profile, getTier]);

  /**
   * Fetch usage when user changes
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUsage();
    }
  }, [isAuthenticated, user, fetchUsage]);

  /**
   * Start Polar.sh checkout flow
   */
  const startCheckout = useCallback(
    async (priceId) => {
      if (!isAuthenticated) {
        message.error("Please sign in to upgrade");
        return { success: false };
      }

      if (!FEATURES.paidTierEnabled) {
        message.info("Paid tier is not yet available. Stay tuned!");
        return { success: false };
      }

      try {
        // Call Supabase Edge Function to create Polar checkout
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            priceId,
            userId: user.id,
            email: user.email,
          },
        });

        if (error) throw error;

        // Redirect to Polar checkout
        if (data?.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return { success: true };
        }

        throw new Error("No checkout URL returned");
      } catch (error) {
        console.error("Checkout error:", error);
        message.error("Failed to start checkout. Please try again.");
        return { success: false, error: error.message };
      }
    },
    [isAuthenticated, user]
  );

  /**
   * Open customer portal (for managing subscription)
   */
  const openCustomerPortal = useCallback(async () => {
    if (!subscription?.polarCustomerId) {
      message.error("No subscription found");
      return { success: false };
    }

    try {
      // Call Supabase Edge Function to get portal URL
      const { data, error } = await supabase.functions.invoke("get-portal-url", {
        body: {
          customerId: subscription.polarCustomerId,
        },
      });

      if (error) throw error;

      if (data?.portalUrl) {
        window.open(data.portalUrl, "_blank");
        return { success: true };
      }

      throw new Error("No portal URL returned");
    } catch (error) {
      console.error("Portal error:", error);
      message.error("Failed to open customer portal");
      return { success: false, error: error.message };
    }
  }, [subscription]);

  /**
   * Refresh subscription data from database
   */
  const refreshSubscription = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();

      if (error) throw error;

      setSubscription({
        tier: data.subscription_tier === "paid" ? "paid" : "free",
        status: data.subscription_status,
        expiresAt: data.subscription_expires_at,
        polarCustomerId: data.polar_customer_id,
        polarSubscriptionId: data.polar_subscription_id,
      });

      // Also refresh usage
      await fetchUsage();
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  }, [user, fetchUsage]);

  const value = {
    // State
    subscription,
    loading,
    usage,
    // Utilities
    getTier,
    getLimits,
    canPerformAction,
    getRemainingQuota,
    isOverQuota,
    // Actions
    startCheckout,
    openCustomerPortal,
    refreshSubscription,
    fetchUsage,
    // Feature flags
    isPaidTierEnabled: FEATURES.paidTierEnabled,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export default useSubscription;
