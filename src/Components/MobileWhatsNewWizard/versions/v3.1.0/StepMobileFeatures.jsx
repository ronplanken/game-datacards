import React from "react";
import { Smartphone, FolderKanban, Search } from "lucide-react";

/**
 * StepMobileFeatures - Mobile features step for v3.1.0
 *
 * Highlights mobile-specific features: GW App Import, List Categorization, and Enhanced Search.
 *
 * @returns {JSX.Element} Mobile features step content
 */
export const StepMobileFeatures = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Smartphone size={28} />
      </div>
      <h2 className="mwnw-features-title">Mobile Improvements</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Search size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Enhanced Search</span>
          <span className="mwnw-feature-item-desc">
            Search for stratagems, enhancements, rules, and spells in addition to units
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Smartphone size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">40K GW App Import</span>
          <span className="mwnw-feature-item-desc">
            Import army lists directly from the official Warhammer 40,000 app
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <FolderKanban size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">List Categorization</span>
          <span className="mwnw-feature-item-desc">
            Improved browsing with role-based categories for Age of Sigmar warscrolls
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepMobileFeatures;
