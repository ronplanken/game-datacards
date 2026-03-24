import React from "react";
import { Crown, Heart, Check, Folder, Database } from "lucide-react";
import { SUBSCRIPTION_LIMITS } from "../../../../Premium";

/**
 * StepPremiumAnnouncement - Announces premium accounts to existing users
 *
 * @returns {JSX.Element} Premium announcement step content
 */
export const StepPremiumAnnouncement = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Crown size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Premium Accounts</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Thank you for being part of the Game Datacards community. If you&apos;d like to support ongoing development, you
      can now optionally upgrade to a premium account for expanded cloud sync limits. All existing features remain
      completely free.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Free Forever</strong>
          <p>
            Everything you use today stays free. Unlimited local storage, full card editing, printing, exporting, and{" "}
            {SUBSCRIPTION_LIMITS.free.categories} cloud-synced categories.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Premium &mdash; &euro;3.99/mo</strong>
          <p>
            Sync up to {SUBSCRIPTION_LIMITS.premium.categories} categories to cloud,{" "}
            {SUBSCRIPTION_LIMITS.premium.datasources} custom datasources, and {SUBSCRIPTION_LIMITS.premium.templates}{" "}
            designer templates.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Creator &mdash; &euro;7.99/mo</strong>
          <p>
            Sync up to {SUBSCRIPTION_LIMITS.creator.categories} categories, {SUBSCRIPTION_LIMITS.creator.datasources}{" "}
            custom datasources, and {SUBSCRIPTION_LIMITS.creator.templates} designer templates.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPremiumAnnouncement;
