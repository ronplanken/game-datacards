import React from "react";
import { Crown, Check, Folder, Database } from "lucide-react";
import { SUBSCRIPTION_LIMITS } from "../../../../Premium";

/**
 * StepPremiumAnnouncement - Mobile premium announcement for v3.6.0
 *
 * Announces premium accounts to existing users while emphasizing
 * that all core features remain free.
 *
 * @returns {JSX.Element} Premium announcement step content
 */
export const StepPremiumAnnouncement = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Crown size={28} />
      </div>
      <h2 className="mwnw-features-title">Premium Accounts</h2>
      <p className="mwnw-features-subtitle">
        Support Game Datacards development with an optional premium account. All existing features remain completely
        free.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--free">
          <Check size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Free Forever</span>
          <span className="mwnw-feature-item-desc">
            Unlimited local storage, full editing, print and export, {SUBSCRIPTION_LIMITS.free.categories} cloud-synced
            categories
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--premium">
          <Folder size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Premium</span>
          <span className="mwnw-feature-item-desc">
            Sync {SUBSCRIPTION_LIMITS.premium.categories} categories, {SUBSCRIPTION_LIMITS.premium.datasources} custom
            datasources, and {SUBSCRIPTION_LIMITS.premium.templates} templates for &euro;3.99/mo
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--creator">
          <Database size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Creator</span>
          <span className="mwnw-feature-item-desc">
            Sync {SUBSCRIPTION_LIMITS.creator.categories} categories, {SUBSCRIPTION_LIMITS.creator.datasources} custom
            datasources, and {SUBSCRIPTION_LIMITS.creator.templates} templates for &euro;7.99/mo
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPremiumAnnouncement;
