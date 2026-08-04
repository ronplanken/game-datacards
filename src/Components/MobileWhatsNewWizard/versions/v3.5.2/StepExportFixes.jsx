import React from "react";
import { Wrench, ImageDown, Swords, FileText } from "lucide-react";

/**
 * StepExportFixes - Single step for mobile v3.5.2 export and rendering fixes
 *
 * @returns {JSX.Element} Export fix announcement step content
 */
export const StepExportFixes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Wrench size={28} />
      </div>
      <h2 className="mwnw-features-title">Image Export Fixes</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <ImageDown size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Custom Card Images</span>
          <span className="mwnw-feature-item-desc">
            Images from the Styling tab now show up in exported PNGs instead of going missing
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Swords size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Weapon Stats and Phase Badges</span>
          <span className="mwnw-feature-item-desc">
            Weapon rows and AoS phase badges no longer break or show extra whitespace in exports
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <FileText size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Loadout Text</span>
          <span className="mwnw-feature-item-desc">
            Cards from earlier versions no longer show garbled separators in the loadout section
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepExportFixes;
