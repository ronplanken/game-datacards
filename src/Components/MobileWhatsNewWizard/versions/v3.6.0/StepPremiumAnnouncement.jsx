import React from "react";
import { Crown, Star, Check, Cloud, Upload, Layers, Share2, Zap } from "lucide-react";
import { SUBSCRIPTION_LIMITS } from "../../../../Premium";

/**
 * StepPremiumAnnouncement - Mobile premium announcement for v3.6.0
 *
 * Matches the WelcomeWizard StepSubscription look: green free-tier box
 * with tier cards below.
 *
 * @returns {JSX.Element} Premium announcement step content
 */
export const StepPremiumAnnouncement = () => (
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

    {/* Paid tiers */}
    <div className="mwnw-features-list">
      <div className="mwnw-feature-item mwnw-feature-item--premium">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--premium">
          <Crown size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">
            Premium <span className="mwnw-feature-item-price">&euro;3.99/mo</span>
          </span>
          <span className="mwnw-feature-item-desc">
            {SUBSCRIPTION_LIMITS.premium.categories} cloud categories, {SUBSCRIPTION_LIMITS.premium.datasources} custom
            datasources, {SUBSCRIPTION_LIMITS.premium.templates} templates, community sharing
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item mwnw-feature-item--creator">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--creator">
          <Star size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">
            Creator <span className="mwnw-feature-item-price">&euro;7.99/mo</span>
          </span>
          <span className="mwnw-feature-item-desc">
            {SUBSCRIPTION_LIMITS.creator.categories} cloud categories, {SUBSCRIPTION_LIMITS.creator.datasources} custom
            datasources, {SUBSCRIPTION_LIMITS.creator.templates} templates, priority feature requests
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPremiumAnnouncement;
