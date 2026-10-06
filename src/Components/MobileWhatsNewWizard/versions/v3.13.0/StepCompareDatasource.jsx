import React from "react";
import { CheckSquare, GitCompare, MoreHorizontal, ShieldCheck } from "lucide-react";
import menuScreenshot from "../../../../Images/whatsnew/compare-datasource-menu-mobile.png";
import dialogScreenshot from "../../../../Images/whatsnew/compare-datasource-dialog-mobile.png";

export const StepCompareDatasource = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <GitCompare size={28} />
      </div>
      <h2 className="mwnw-features-title">Compare with the datasource</h2>
      <p className="mwnw-features-subtitle">
        Saved lists do not change when the datasource gets new points or rules. See what changed and update the units
        you want.
      </p>
    </header>

    <figure className="mwnw-screenshot">
      <img src={menuScreenshot} alt="The list menu with Compare with datasource highlighted" />
      <figcaption>Lists, then the menu next to the list name</figcaption>
    </figure>

    <figure className="mwnw-screenshot">
      <img src={dialogScreenshot} alt="The Compare with datasource screen showing the changes for each unit" />
      <figcaption>Red is your saved card, green is the datasource</figcaption>
    </figure>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <MoreHorizontal size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Where to find it</span>
          <span className="mwnw-feature-item-desc">
            Open Lists, tap the menu next to the list name and choose Compare with datasource
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <CheckSquare size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">You choose what to update</span>
          <span className="mwnw-feature-item-desc">
            Tap a unit to see every change. Untick the units you want to keep as they are
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Your list choices stay</span>
          <span className="mwnw-feature-item-desc">
            Unit size, warlord, enhancements, wargear and attached leaders are kept. Unit sizes get the new points
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepCompareDatasource;
