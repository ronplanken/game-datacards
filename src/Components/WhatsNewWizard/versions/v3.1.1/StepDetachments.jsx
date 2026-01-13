import React from "react";
import { Shield, Users, ChevronRight } from "lucide-react";

/**
 * StepDetachments - Explains the reorganized datasource structure for chapters
 *
 * @returns {JSX.Element} Detachment structure step content
 */
export const StepDetachments = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-icon">
      <Shield size={48} />
    </div>
    <h3 className="wnw-feature-title">Reorganized Chapter Detachments</h3>
    <p className="wnw-feature-description">
      The datasource has been reorganized to better separate Space Marine chapters and their unique detachments.
    </p>

    <div className="wnw-feature-details">
      <div className="wnw-feature-item">
        <Shield size={20} />
        <div>
          <strong>Space Marines</strong>
          <p>
            The core Space Marines faction now includes all generic Adeptus Astartes detachments plus chapter-specific
            detachments for standard chapters (Ultramarines, Imperial Fists, Iron Hands, Raven Guard, Salamanders, White
            Scars, Deathwatch).
          </p>
        </div>
      </div>

      <div className="wnw-feature-item">
        <Users size={20} />
        <div>
          <strong>Separate Chapter Factions</strong>
          <p>
            Major chapters (Blood Angels, Dark Angels, Space Wolves, Black Templars) now have their own dedicated
            faction entries with access to both their unique detachments and the parent Space Marines data.
          </p>
        </div>
      </div>

      <div className="wnw-feature-item">
        <ChevronRight size={20} />
        <div>
          <strong>How It Works</strong>
          <p>
            Select your chapter from the faction list to see their unique detachments. Enable &quot;Combine parent
            faction datasheets&quot; in Faction Settings to also see the shared Space Marines units.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepDetachments;
