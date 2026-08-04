import React from "react";
import { Wrench } from "lucide-react";

/**
 * StepExportFixes - Single step for v3.5.2 export and rendering fixes
 *
 * @returns {JSX.Element} Export fix announcement step content
 */
export const StepExportFixes = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Wrench size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Image Export Fixes</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Exported card images now match what you see in the browser, including custom artwork, weapon stats, and loadout
      text.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Custom Card Images</strong>
          <p>
            Images added through the Styling tab now show up in exported PNGs. Previously they were visible in the
            browser but missing from the export.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Weapon Stats and Phase Badges</strong>
          <p>
            Weapon stat rows no longer show extra whitespace or broken layouts in exports, especially on Windows. AoS
            phase badges are also fixed.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Loadout Text</strong>
          <p>
            Cards created in an earlier version no longer show garbled separators in the loadout section. The text now
            displays cleanly.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepExportFixes;
