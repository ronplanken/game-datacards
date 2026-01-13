import React from "react";
import { Shield } from "lucide-react";

/**
 * StepDetachments - Explains the reorganized datasource structure for chapters
 *
 * @returns {JSX.Element} Detachment structure step content
 */
export const StepDetachments = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Shield size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Reorganized Chapter Detachments</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      The datasource has been reorganized to better separate Space Marine chapters and their unique detachments.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Chapter-Specific Detachments</strong>
          <p>
            Added unique detachments for Ultramarines, Imperial Fists, Iron Hands, Raven Guard, Salamanders, White
            Scars, and Deathwatch to the Space Marines faction.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepDetachments;
