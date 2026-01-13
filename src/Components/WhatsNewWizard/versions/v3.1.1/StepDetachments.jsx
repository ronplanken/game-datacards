import React from "react";
import { Shield, Settings, Filter, ChevronRight } from "lucide-react";

/**
 * StepDetachments - Explains the new chapter-specific detachment filtering
 *
 * @returns {JSX.Element} Detachment filtering step content
 */
export const StepDetachments = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-icon">
      <Shield size={48} />
    </div>
    <h3 className="wnw-feature-title">Chapter-Specific Detachments</h3>
    <p className="wnw-feature-description">
      Space Marines now include chapter-specific detachments from all successor chapters. By default, only core Adeptus
      Astartes detachments and standard chapters are shown.
    </p>

    <div className="wnw-feature-details">
      <div className="wnw-feature-item">
        <Filter size={20} />
        <div>
          <strong>Smart Filtering</strong>
          <p>
            Special chapters (Blood Angels, Dark Angels, Space Wolves, Black Templars) are hidden by default to keep
            your detachment list focused.
          </p>
        </div>
      </div>

      <div className="wnw-feature-item">
        <Settings size={20} />
        <div>
          <strong>Show Non-Default Factions</strong>
          <p>Enable this option in Faction Settings to reveal all chapter-specific detachments.</p>
        </div>
      </div>

      <div className="wnw-feature-item">
        <ChevronRight size={20} />
        <div>
          <strong>How to Enable</strong>
          <p>Go to Faction Settings and toggle &quot;Show non-default factions&quot; under the Detachments section.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepDetachments;
