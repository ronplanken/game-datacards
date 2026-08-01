import React from "react";
import { Calculator, Gem, ListChecks, Users } from "lucide-react";

export const StepLists = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <ListChecks size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Build 11th Edition lists</h2>
      </div>
    </div>
    <p className="wnw-feature-description">The list builder speaks 11th edition, on desktop and on mobile.</p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <ListChecks size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Unit sizes and detachments
          </strong>
          <p>Add a datasheet at the size you want and pick the detachment your army is running.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Gem size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Enhancements and Upgrades
          </strong>
          <p>
            Give a character an enhancement, or a non-character an Upgrade. Copy limits follow the core rules, and the
            choice now shows on the datasheet itself.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Calculator size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Points that add up
          </strong>
          <p>A running total that applies the 11th edition per-datasheet surcharge for repeated selections.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Leaders join their squad
          </strong>
          <p>Characters with the Leader ability can be attached to eligible squads already in your list.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepLists;
