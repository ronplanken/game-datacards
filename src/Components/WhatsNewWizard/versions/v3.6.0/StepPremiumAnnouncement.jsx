import React from "react";
import { Check, Crown, Star, Cloud, Upload, Layers, Share2, Zap, Tag } from "lucide-react";
import { SUBSCRIPTION_LIMITS, useProducts } from "../../../../Premium";

// Fallback prices if API fails
const FALLBACK_PRICES = {
  premium: "€3.99/mo",
  creator: "€7.99/mo",
};

/**
 * Small skeleton loader for price display
 */
const PriceSkeleton = () => <span className="wnw-sub-tier-price-skeleton" />;

/**
 * StepPremiumAnnouncement - Announces premium accounts to existing users
 *
 * Matches the WelcomeWizard StepSubscription layout: green free-tier box
 * with side-by-side paid tier cards. Pricing fetched from Creem.
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
    <div className="wnw-step-subscription">
      <div className="wnw-feature-header">
        <div className="wnw-feature-icon">
          <Crown size={28} />
        </div>
        <div>
          <h2 className="wnw-feature-title">Free Forever, Premium Optional</h2>
        </div>
      </div>
      <p className="wnw-feature-description">
        Thank you for being part of the Game Datacards community. If you&apos;d like to support ongoing development, you
        can now optionally upgrade to a premium account for expanded cloud sync limits. All existing features remain
        completely free.
      </p>

      {/* Free tier emphasis */}
      <div className="wnw-sub-free-box">
        <div className="wnw-sub-free-header">
          <Check className="wnw-sub-free-check" size={20} />
          <span>All core features are completely free</span>
        </div>
        <p className="wnw-sub-free-text">
          Create unlimited cards, categories, and use all import/export features without signing up or paying anything.
        </p>
      </div>

      {/* Promo Banner */}
      {activePromo && (
        <div className="wnw-sub-promo-banner">
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
      <div className="wnw-sub-tiers">
        <div className="wnw-sub-tier wnw-sub-tier--premium">
          <div className="wnw-sub-tier-header">
            <Crown size={18} className="wnw-sub-tier-icon" />
            <span className="wnw-sub-tier-name">Premium</span>
            {loading ? (
              <PriceSkeleton />
            ) : premiumDiscount ? (
              <span className="wnw-sub-tier-price">
                <span className="wnw-sub-tier-price-original">{getPrice("premium")}</span>{" "}
                {premiumDiscount.discountedPrice}/mo
                {premiumDiscount.discount.type === "percentage" && premiumDiscount.discount.percentage && (
                  <span className="wnw-sub-tier-discount-badge">-{premiumDiscount.discount.percentage}%</span>
                )}
              </span>
            ) : (
              <span className="wnw-sub-tier-price">{getPrice("premium")}</span>
            )}
          </div>
          <ul className="wnw-sub-tier-features">
            <li>
              <Cloud size={14} />
              <span>{SUBSCRIPTION_LIMITS.premium.categories} cloud-backed categories</span>
            </li>
            <li>
              <Upload size={14} />
              <span>{SUBSCRIPTION_LIMITS.premium.datasources} custom datasources</span>
            </li>
            <li>
              <Layers size={14} />
              <span>{SUBSCRIPTION_LIMITS.premium.templates} cloud templates</span>
            </li>
            <li>
              <Share2 size={14} />
              <span>Community sharing</span>
            </li>
          </ul>
        </div>

        <div className="wnw-sub-tier wnw-sub-tier--creator">
          <div className="wnw-sub-tier-badge">Popular</div>
          <div className="wnw-sub-tier-header">
            <Star size={18} className="wnw-sub-tier-icon" />
            <span className="wnw-sub-tier-name">Creator</span>
            {loading ? (
              <PriceSkeleton />
            ) : creatorDiscount ? (
              <span className="wnw-sub-tier-price">
                <span className="wnw-sub-tier-price-original">{getPrice("creator")}</span>{" "}
                {creatorDiscount.discountedPrice}/mo
                {creatorDiscount.discount.type === "percentage" && creatorDiscount.discount.percentage && (
                  <span className="wnw-sub-tier-discount-badge">-{creatorDiscount.discount.percentage}%</span>
                )}
              </span>
            ) : (
              <span className="wnw-sub-tier-price">{getPrice("creator")}</span>
            )}
          </div>
          <ul className="wnw-sub-tier-features">
            <li>
              <Cloud size={14} />
              <span>{SUBSCRIPTION_LIMITS.creator.categories} cloud-backed categories</span>
            </li>
            <li>
              <Upload size={14} />
              <span>{SUBSCRIPTION_LIMITS.creator.datasources} custom datasources</span>
            </li>
            <li>
              <Layers size={14} />
              <span>{SUBSCRIPTION_LIMITS.creator.templates} cloud templates</span>
            </li>
            <li>
              <Zap size={14} />
              <span>Priority feature requests</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepPremiumAnnouncement;
