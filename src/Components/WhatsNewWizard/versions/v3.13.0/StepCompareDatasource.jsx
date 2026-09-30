import React from "react";
import { CheckSquare, GitCompare, MousePointerClick, ShieldCheck } from "lucide-react";
import menuScreenshot from "../../../../Images/whatsnew/compare-datasource-menu.png";
import dialogScreenshot from "../../../../Images/whatsnew/compare-datasource-dialog.png";

export const StepCompareDatasource = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <GitCompare size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Compare with the datasource</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Cards you saved in a list or category do not change when the datasource gets new points or rules. You can now see
      what changed and update the cards you want.
    </p>

    <figure className="wnw-screenshot wnw-screenshot--narrow">
      <img src={menuScreenshot} alt="The right-click menu of a list with Compare with datasource highlighted" />
      <figcaption>Right-click a list, category or card</figcaption>
    </figure>

    <figure className="wnw-screenshot">
      <img src={dialogScreenshot} alt="The Compare with datasource dialog showing the changes for each card" />
      <figcaption>Red is your saved card, green is the datasource</figcaption>
    </figure>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Where to find it
          </strong>
          <p>Right-click a list, category or card and choose Compare with datasource.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <CheckSquare size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            You choose what to update
          </strong>
          <p>Open a card to see every change. Untick the cards you want to keep as they are.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <ShieldCheck size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Your list choices stay
          </strong>
          <p>
            Unit size, warlord, enhancements, wargear, attached leaders and card styling are kept. Unit sizes get the
            new points.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCompareDatasource;
