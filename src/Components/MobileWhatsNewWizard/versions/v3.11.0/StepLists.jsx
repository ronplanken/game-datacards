import React from "react";
import { Calculator, Gem, ListChecks, Users } from "lucide-react";

export const StepLists = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <ListChecks size={28} />
      </div>
      <h2 className="mwnw-features-title">Build 11th Edition lists</h2>
      <p className="mwnw-features-subtitle">Your lists work with 11th edition datasheets, right from your phone.</p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <ListChecks size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Sizes and detachments</span>
          <span className="mwnw-feature-item-desc">
            Add a datasheet at the size you want and pick the detachment your army is running
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Gem size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Enhancements</span>
          <span className="mwnw-feature-item-desc">
            Give a character an enhancement or a non-character an Upgrade, and see it on the datasheet
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Calculator size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Running points total</span>
          <span className="mwnw-feature-item-desc">
            Includes the per-datasheet surcharge for each repeated selection
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Users size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Attach your leaders</span>
          <span className="mwnw-feature-item-desc">
            Characters with the Leader ability attach to eligible squads already in your list
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepLists;
