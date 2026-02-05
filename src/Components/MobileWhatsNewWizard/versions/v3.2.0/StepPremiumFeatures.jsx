import React from "react";
import { Crown, Check, Folder, Database } from "lucide-react";

/**
 * StepPremiumFeatures - Premium features step for v3.2.0
 *
 * Highlights the new premium subscription tiers while emphasizing
 * that all core features remain free.
 *
 * @returns {JSX.Element} Premium features step content
 */
export const StepPremiumFeatures = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Crown size={28} />
      </div>
      <h2 className="mwnw-features-title">Free Forever</h2>
      <p className="mwnw-features-subtitle">
        All core features remain completely free. Premium is optional for expanded storage.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon mwnw-feature-item-icon--free">
          <Check size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Free Tier</span>
          <span className="mwnw-feature-item-desc">
            Sync 2 categories to cloud, unlimited local, full card editing, print and export
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
            Sync 10 categories, unlimited local and 2 custom datasources for &euro;3.99/mo
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
            Sync 50 categories, unlimited local and 10 custom datasources for &euro;7.99/mo
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPremiumFeatures;
