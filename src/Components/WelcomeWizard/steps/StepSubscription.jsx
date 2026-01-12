import React from "react";
import { Check, Crown, Star, Cloud, Upload, Share2, Zap } from "lucide-react";

/**
 * Subscription step explaining the free vs paid tiers
 */
export const StepSubscription = () => {
  return (
    <div className="wz-step-subscription">
      <h2 className="wz-step-title">Free Forever, Premium Optional</h2>
      <p className="wz-step-description">
        Game Datacards is fully functional without an account. Premium tiers add cloud features for power users.
      </p>

      {/* Free tier emphasis */}
      <div className="wz-sub-free-box">
        <div className="wz-sub-free-header">
          <Check className="wz-sub-free-check" size={20} />
          <span>All core features are completely free</span>
        </div>
        <p className="wz-sub-free-text">
          Create unlimited cards, categories, and use all import/export features without signing up or paying anything.
        </p>
      </div>

      {/* Paid tiers */}
      <div className="wz-sub-tiers">
        <div className="wz-sub-tier wz-sub-tier--premium">
          <div className="wz-sub-tier-header">
            <Crown size={18} className="wz-sub-tier-icon" />
            <span className="wz-sub-tier-name">Premium</span>
            <span className="wz-sub-tier-price">€3.99/mo</span>
          </div>
          <ul className="wz-sub-tier-features">
            <li>
              <Cloud size={14} />
              <span>50 cloud-backed categories</span>
            </li>
            <li>
              <Upload size={14} />
              <span>2 custom datasources</span>
            </li>
            <li>
              <Share2 size={14} />
              <span>Community sharing</span>
            </li>
          </ul>
        </div>

        <div className="wz-sub-tier wz-sub-tier--creator">
          <div className="wz-sub-tier-badge">Popular</div>
          <div className="wz-sub-tier-header">
            <Star size={18} className="wz-sub-tier-icon" />
            <span className="wz-sub-tier-name">Creator</span>
            <span className="wz-sub-tier-price">€7.99/mo</span>
          </div>
          <ul className="wz-sub-tier-features">
            <li>
              <Cloud size={14} />
              <span>250 cloud-backed categories</span>
            </li>
            <li>
              <Upload size={14} />
              <span>10 custom datasources</span>
            </li>
            <li>
              <Zap size={14} />
              <span>Priority feature requests</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="wz-sub-note">
        Create a free account in <strong>Settings</strong> to unlock cloud sync and explore premium options.
      </p>
    </div>
  );
};
