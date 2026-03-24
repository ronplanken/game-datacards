import React from "react";
import { Crown, Star, Check, Cloud, Upload, Layers, Share2, Zap, Tag } from "lucide-react";
import { SUBSCRIPTION_LIMITS, useProducts } from "../../../../Premium";

// Fallback prices if API fails
const FALLBACK_PRICES = {
  premium: "€3.99/mo",
  creator: "€7.99/mo",
};

/**
 * StepPremiumAnnouncement - Mobile premium announcement for v3.6.0
 *
 * Matches the WelcomeWizard StepSubscription look: green free-tier box
 * with tier cards below. Pricing fetched from Creem.
 *
 * @returns {JSX.Element} Premium announcement step content
 */
export const StepPremiumAnnouncement = () => {
  const { products, loading, getDiscountForProduct, getActivePromoCode, formatDiscountedPrice } = useProducts();

  const activePromo = getActivePromoCode();

  // Get formatted price for a tier
  const getPrice = (tier) => {
    if (loading) return null;
    const price = products?.tiers?.[tier]?.prices?.month?.formatted;
    return price ? `${price}/mo` : FALLBACK_PRICES[tier];
  };

  // Get discount info for a tier
  const getDiscount = (tier) => {
    const productId = products?.tiers?.[tier]?.prices?.month?.productId;
    if (!productId) return null;
    const discount = getDiscountForProduct(productId);
    if (!discount) return null;
    const amount = products.tiers[tier].prices.month.amount;
    const currency = products.tiers[tier].prices.month.currency;
    const discountedPrice = formatDiscountedPrice(amount, currency, discount);
    return { discount, discountedPrice };
  };

  const premiumDiscount = getDiscount("premium");
  const creatorDiscount = getDiscount("creator");

  return (
    <div className="mwnw-features">
      <header className="mwnw-features-header">
        <div className="mwnw-features-icon">
          <Crown size={28} />
        </div>
        <h2 className="mwnw-features-title">Free Forever, Premium Optional</h2>
        <p className="mwnw-features-subtitle">
          Support Game Datacards development with an optional premium account. All existing features remain completely
          free.
        </p>
      </header>

      {/* Free tier emphasis */}
      <div className="mwnw-sub-free-box">
        <div className="mwnw-sub-free-header">
          <Check size={18} />
          <span>All core features are completely free</span>
        </div>
        <p className="mwnw-sub-free-text">
          Unlimited cards, categories, import/export, and printing without signing up or paying anything.
        </p>
      </div>

      {/* Promo Banner */}
      {activePromo && (
        <div className="mwnw-sub-promo-banner">
          <Tag size={14} />
          <span>
            {activePromo.type === "percentage" && activePromo.percentage
              ? `${activePromo.percentage}% off`
              : activePromo.type === "fixed" && activePromo.amount
                ? `€${(activePromo.amount / 100).toFixed(2)} off`
                : "Discount available"}{" "}
            with code <strong>{activePromo.code}</strong>
          </span>
        </div>
      )}

      {/* Paid tiers */}
      <div className="mwnw-features-list">
        <div className="mwnw-feature-item mwnw-feature-item--premium">
          <div className="mwnw-feature-item-icon mwnw-feature-item-icon--premium">
            <Crown size={20} />
          </div>
          <div className="mwnw-feature-item-content">
            <span className="mwnw-feature-item-title">
              Premium{" "}
              {loading ? (
                <span className="mwnw-sub-price-skeleton" />
              ) : premiumDiscount ? (
                <span className="mwnw-feature-item-price">
                  <span className="mwnw-feature-item-price-original">{getPrice("premium")}</span>{" "}
                  {premiumDiscount.discountedPrice}/mo
                </span>
              ) : (
                <span className="mwnw-feature-item-price">{getPrice("premium")}</span>
              )}
            </span>
            <span className="mwnw-feature-item-desc">
              {SUBSCRIPTION_LIMITS.premium.categories} cloud categories, {SUBSCRIPTION_LIMITS.premium.datasources}{" "}
              custom datasources, {SUBSCRIPTION_LIMITS.premium.templates} templates, community sharing
            </span>
          </div>
        </div>

        <div className="mwnw-feature-item mwnw-feature-item--creator">
          <div className="mwnw-feature-item-icon mwnw-feature-item-icon--creator">
            <Star size={20} />
          </div>
          <div className="mwnw-feature-item-content">
            <span className="mwnw-feature-item-title">
              Creator{" "}
              {loading ? (
                <span className="mwnw-sub-price-skeleton" />
              ) : creatorDiscount ? (
                <span className="mwnw-feature-item-price">
                  <span className="mwnw-feature-item-price-original">{getPrice("creator")}</span>{" "}
                  {creatorDiscount.discountedPrice}/mo
                </span>
              ) : (
                <span className="mwnw-feature-item-price">{getPrice("creator")}</span>
              )}
            </span>
            <span className="mwnw-feature-item-desc">
              {SUBSCRIPTION_LIMITS.creator.categories} cloud categories, {SUBSCRIPTION_LIMITS.creator.datasources}{" "}
              custom datasources, {SUBSCRIPTION_LIMITS.creator.templates} templates, priority feature requests
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPremiumAnnouncement;
