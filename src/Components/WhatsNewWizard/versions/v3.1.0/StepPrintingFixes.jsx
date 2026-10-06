import React from "react";
import { Wrench } from "lucide-react";

/**
 * StepVarious - Various improvements and fixes step for v3.1.0
 *
 * Highlights various improvements including rule card editor,
 * printing fixes, and other enhancements.
 *
 * @returns {JSX.Element} Various improvements step content
 */
export const StepPrintingFixes = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Wrench size={28} />
      </div>
      <h2 className="wnw-feature-title">Various Improvements</h2>
    </div>
    <p className="wnw-feature-description">New editing tools and bug fixes for printing and list organization.</p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Rule Card Editor</strong>
          <p>Create custom rule cards for army and detachment rules</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>MacOS PDF Export</strong>
          <p>Fixed PDF generation issues on MacOS devices</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Age of Sigmar Printing</strong>
          <p>Resolved layout issues when printing AoS warscrolls</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>List Categorization</strong>
          <p>Improved list view with role-based categories for Age of Sigmar warscrolls</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPrintingFixes;
