import React from "react";
import { Cloud, RefreshCw, Monitor } from "lucide-react";
import { MockTreeRow } from "../../../WelcomeWizard/demos";

/**
 * StepCloudSync - Cloud Sync step for mobile v3.2.0
 *
 * Highlights how to enable sync, automatic updates, and cross-device access.
 *
 * @returns {JSX.Element} Cloud Sync step content
 */
export const StepCloudSync = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Cloud size={28} />
      </div>
      <h2 className="mwnw-features-title">Cloud Sync</h2>
    </header>

    <div className="mwnw-mock-preview">
      <MockTreeRow compact />
    </div>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Cloud size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Enable Sync</span>
          <span className="mwnw-feature-item-desc">
            Tap the cloud icon on a category to start syncing it to the cloud
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <RefreshCw size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Automatic Updates</span>
          <span className="mwnw-feature-item-desc">Changes are synced automatically in the background as you edit</span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Monitor size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Cross-Device Access</span>
          <span className="mwnw-feature-item-desc">
            Sign in on any device to access your synced datacards instantly
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepCloudSync;
