import React from "react";
import { Share2, MousePointerClick, Settings, RefreshCw } from "lucide-react";

/**
 * StepSharing - Single step for mobile v3.2.2 sharing rebuild
 *
 * @returns {JSX.Element} Sharing step content
 */
export const StepSharing = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Share2 size={28} />
      </div>
      <h2 className="mwnw-features-title">Sharing, Rebuilt</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <MousePointerClick size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">One-Click Sharing</span>
          <span className="mwnw-feature-item-desc">
            Share any category or list with a single click. Generate a link and send it to anyone
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Settings size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Manage Your Shares</span>
          <span className="mwnw-feature-item-desc">
            View, update, or remove your shared links from your account menu. Set links to public or private any time
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <RefreshCw size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">A Fresh Start</span>
          <span className="mwnw-feature-item-desc">
            We&apos;ve moved to a new backend to make sharing faster. Some older share links may no longer work — if
            you&apos;re missing anything, let us know on Discord and we&apos;ll help
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepSharing;
