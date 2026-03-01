import React from "react";
import { Swords } from "lucide-react";

/**
 * StepListForge - Single step for v3.3.0 List Forge import
 *
 * @returns {JSX.Element} List Forge import step content
 */
export const StepListForge = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Swords size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">List Forge Import</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      You can now import army lists from{" "}
      <a href="https://listforge.club/" target="_blank" rel="noreferrer" className="wnw-inline-link">
        List Forge
      </a>{" "}
      directly into Game Datacards.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Upload or Paste</strong>
          <p>Export your roster from List Forge, then upload the file or paste its contents to get started.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Match or Import Directly</strong>
          <p>
            Match units to your datasource for full datasheet cards, or import the exported data as-is for a quick setup.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Automatic Matching</strong>
          <p>
            Factions, detachments, units, and enhancements are detected and matched automatically. Review and adjust
            anything before importing.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepListForge;
