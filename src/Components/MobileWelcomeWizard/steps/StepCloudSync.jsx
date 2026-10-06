import { Cloud, RefreshCw, Monitor } from "lucide-react";
import { MockTreeRow } from "../../WelcomeWizard/demos";

export const StepCloudSync = () => {
  return (
    <div className="mww-info-step">
      <header className="mww-info-header">
        <div className="mww-info-icon mww-info-icon--sync">
          <Cloud />
        </div>
        <h1 className="mww-info-title">Cloud Sync</h1>
        <p className="mww-info-subtitle">
          Create a free account to keep your datacards backed up and accessible across devices.
        </p>
      </header>

      <div className="mww-mock-preview">
        <MockTreeRow compact />
      </div>

      <div className="mww-desktop-features">
        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <Cloud />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Enable Sync</div>
            <div className="mww-desktop-feature-desc">Tap the cloud icon on a category to start syncing</div>
          </div>
        </div>

        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <RefreshCw />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Automatic Updates</div>
            <div className="mww-desktop-feature-desc">Changes sync automatically in the background</div>
          </div>
        </div>

        <div className="mww-desktop-feature">
          <div className="mww-desktop-feature-icon">
            <Monitor />
          </div>
          <div className="mww-desktop-feature-text">
            <div className="mww-desktop-feature-title">Cross-Device Access</div>
            <div className="mww-desktop-feature-desc">Sign in on any device to access your synced datacards</div>
          </div>
        </div>
      </div>
    </div>
  );
};
