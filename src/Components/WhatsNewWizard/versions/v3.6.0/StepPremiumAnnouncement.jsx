import React from "react";
import { Check, Crown, Star, Cloud, Upload, Layers, Share2, Zap } from "lucide-react";
import { SUBSCRIPTION_LIMITS } from "../../../../Premium";

/**
 * StepPremiumAnnouncement - Announces premium accounts to existing users
 *
 * Matches the look and feel of the WelcomeWizard StepSubscription:
 * green free-tier box + side-by-side paid tier cards.
 *
 * @returns {JSX.Element} Premium announcement step content
 */
export const StepPremiumAnnouncement = () => (
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

    {/* Paid tiers */}
    <div className="wnw-sub-tiers">
      <div className="wnw-sub-tier wnw-sub-tier--premium">
        <div className="wnw-sub-tier-header">
          <Crown size={18} className="wnw-sub-tier-icon" />
          <span className="wnw-sub-tier-name">Premium</span>
          <span className="wnw-sub-tier-price">&euro;3.99/mo</span>
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
          <span className="wnw-sub-tier-price">&euro;7.99/mo</span>
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

export default StepPremiumAnnouncement;
