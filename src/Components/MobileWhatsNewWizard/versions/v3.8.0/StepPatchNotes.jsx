import React from "react";
import { Rocket, Users, Layers } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Rocket size={28} />
      </div>
      <h2 className="mwnw-features-title">Starcraft TMG &amp; Faction Management</h2>
      <p className="mwnw-features-subtitle">
        Adds a new Starcraft TMG card style and a faction editor for managing factions inside any datasource.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Rocket size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Starcraft TMG Datasource</span>
          <span className="mwnw-feature-item-desc">
            A new card style for Starcraft TMG, with phase-based weapon tables and ability grids. Includes the full
            Terran, Zerg, and Protoss starter roster.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Users size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Faction Management</span>
          <span className="mwnw-feature-item-desc">
            The Datasource Editor now has a dedicated factions panel. Create, rename, recolour, and reorder factions,
            and switch between them while editing.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Layers size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Combat Roles &amp; Army Slots</span>
          <span className="mwnw-feature-item-desc">
            Combat roles and army slots can now be defined per faction, so you can organise units by role bracket or
            army slot.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
