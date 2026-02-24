import React from "react";
import { Cloud } from "lucide-react";
import { MockTreeRow } from "../../../WelcomeWizard/demos";

/**
 * StepCloudSync - Cloud Sync feature step for v3.2.0
 *
 * Explains how to enable sync, automatic syncing behavior,
 * cross-device access, and the free tier allowance.
 *
 * @returns {JSX.Element} Cloud Sync feature step content
 */
export const StepCloudSync = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Cloud size={28} />
      </div>
      <h2 className="wnw-feature-title">Cloud Sync</h2>
    </div>
    <p className="wnw-feature-description">
      Keep your datacards backed up and accessible from any device with cloud sync.
    </p>
    <div className="wnw-mock-preview">
      <MockTreeRow />
    </div>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Enable Sync</strong>
          <p>Toggle the cloud icon in the sidebar to enable syncing for a category</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Automatic Syncing</strong>
          <p>Changes are synced automatically in the background as you edit</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Cross-Device Access</strong>
          <p>Sign in on any device to access your synced datacards instantly</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCloudSync;
