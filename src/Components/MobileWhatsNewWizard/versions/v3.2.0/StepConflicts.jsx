import React from "react";
import { GitMerge, Download, Upload, Copy } from "lucide-react";

/**
 * StepConflicts - Conflicts step for mobile v3.2.0
 *
 * Explains the three conflict resolution options available when
 * local and cloud data diverge.
 *
 * @returns {JSX.Element} Conflicts step content
 */
export const StepConflicts = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <GitMerge size={28} />
      </div>
      <h2 className="mwnw-features-title">Conflicts</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Upload size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keep Local</span>
          <span className="mwnw-feature-item-desc">Overwrite the cloud version with your local changes</span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Download size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keep Cloud</span>
          <span className="mwnw-feature-item-desc">Replace your local data with the version stored in the cloud</span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Copy size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Keep Both</span>
          <span className="mwnw-feature-item-desc">Save both versions as separate categories so nothing is lost</span>
        </div>
      </div>
    </div>
  </div>
);

export default StepConflicts;
