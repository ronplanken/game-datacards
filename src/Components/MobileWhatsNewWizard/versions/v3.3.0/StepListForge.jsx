import React from "react";
import { Swords, Upload, Database, FileJson } from "lucide-react";

/**
 * StepListForge - Single step for mobile v3.3.0 List Forge import
 *
 * @returns {JSX.Element} List Forge import step content
 */
export const StepListForge = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Swords size={28} />
      </div>
      <h2 className="mwnw-features-title">List Forge Import</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Upload size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Upload or Paste</span>
          <span className="mwnw-feature-item-desc">
            Export your roster from List Forge, then upload the file or paste its contents
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Database size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Match or Import Directly</span>
          <span className="mwnw-feature-item-desc">
            Match units to your datasource for full datasheet cards, or import as-is for a quick setup
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <FileJson size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Automatic Matching</span>
          <span className="mwnw-feature-item-desc">
            Factions, detachments, units, and enhancements are detected and matched automatically
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepListForge;
