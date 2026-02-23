import React from "react";
import { BarChart3 } from "lucide-react";

/**
 * StepSyncStatus - Sync Status & Limits step for v3.2.0
 *
 * Describes the sync status indicator, usage bars in the account menu,
 * and tier upgrade options.
 *
 * @returns {JSX.Element} Sync Status & Limits step content
 */
export const StepSyncStatus = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <BarChart3 size={28} />
      </div>
      <h2 className="wnw-feature-title">Sync Status &amp; Limits</h2>
    </div>
    <p className="wnw-feature-description">
      Monitor your sync status and usage at a glance from the header and account menu.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Status Indicator</strong>
          <p>The cloud icon in the header shows your current sync status with a dropdown for details</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Usage Bars</strong>
          <p>Open the account menu to see how many synced categories and datasources you are using</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Upgrade Tiers</strong>
          <p>Need more space? Upgrade your subscription tier from the account menu for additional capacity</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepSyncStatus;
