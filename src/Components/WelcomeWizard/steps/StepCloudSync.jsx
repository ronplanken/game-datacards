import React from "react";
import { Cloud, Monitor, Shield } from "lucide-react";
import { MockTreeRow, MockHeaderBar } from "../demos";

/**
 * Cloud Sync step explaining sync features for new users
 */
export const StepCloudSync = () => {
  return (
    <div className="wz-step-cloud-sync">
      <h2 className="wz-step-title">Cloud Sync</h2>
      <p className="wz-step-description">
        Keep your datacards backed up and accessible from any device. Create a free account to get started.
      </p>

      <div className="wz-mock-preview">
        <MockTreeRow />
        <MockHeaderBar highlight="sync" />
      </div>

      <div className="wz-explore-grid">
        <div className="wz-explore-card">
          <div className="wz-explore-icon">
            <Cloud />
          </div>
          <h4 className="wz-explore-title">Enable Sync</h4>
          <p className="wz-explore-desc">
            Toggle the cloud icon in the sidebar to sync a category. Changes are synced automatically as you edit.
          </p>
        </div>

        <div className="wz-explore-card">
          <div className="wz-explore-icon">
            <Monitor />
          </div>
          <h4 className="wz-explore-title">Cross-Device Access</h4>
          <p className="wz-explore-desc">Sign in on any device to access your synced datacards instantly.</p>
        </div>

        <div className="wz-explore-card">
          <div className="wz-explore-icon">
            <Shield />
          </div>
          <h4 className="wz-explore-title">Conflict Resolution</h4>
          <p className="wz-explore-desc">When changes conflict, choose to keep local, cloud, or both versions.</p>
        </div>
      </div>

      <div className="wz-explore-hint">
        Free accounts can sync up to <strong>2 categories</strong>. Upgrade for more.
      </div>
    </div>
  );
};
