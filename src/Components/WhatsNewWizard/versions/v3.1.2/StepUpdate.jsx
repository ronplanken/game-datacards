import React from "react";
import { Wrench } from "lucide-react";

/**
 * StepUpdate - Single step for v3.1.2 bug fix release
 *
 * @returns {JSX.Element} Update step content
 */
export const StepUpdate = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Wrench size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Bug Fix Update</h2>
      </div>
    </div>
    <p className="wnw-feature-description">This update includes a fix for stratagem card exports.</p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Image Export Fix</strong>
          <p>Fixed an issue where phase icons on stratagem cards were not appearing in image exports.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepUpdate;
