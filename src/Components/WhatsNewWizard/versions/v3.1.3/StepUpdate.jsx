import React from "react";
import { Wrench } from "lucide-react";

/**
 * StepUpdate - Single step for v3.1.3 bug fix release
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
    <p className="wnw-feature-description">This update fixes keyword styling in ability descriptions.</p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Ability Keyword Styling</strong>
          <p>
            Weapon keywords (e.g. Sustained Hits, Hazardous, Assault) in ability descriptions now render with the
            correct green weapon style and tooltip. Rule keywords (e.g. Feel No Pain, Lone Operative) use the black rule
            style.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepUpdate;
