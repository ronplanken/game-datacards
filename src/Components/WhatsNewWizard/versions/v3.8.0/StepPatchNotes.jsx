import React from "react";
import { Rocket, Users, Layers } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Rocket size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Starcraft TMG &amp; Faction Management</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Adds a new Starcraft TMG card style and a faction editor for managing factions inside any datasource.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Rocket size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Starcraft TMG Datasource
          </strong>
          <p>
            A new card style for Starcraft TMG, with phase-based weapon tables and ability grids. Includes the full
            Terran, Zerg, and Protoss starter roster.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Faction Management
          </strong>
          <p>
            The Datasource Editor now has a dedicated factions panel. Create, rename, recolour, and reorder factions,
            and switch between them while editing.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Layers size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Combat Roles &amp; Army Slots
          </strong>
          <p>
            Combat roles and army slots can now be defined per faction, so you can organise units by role bracket or
            army slot.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
