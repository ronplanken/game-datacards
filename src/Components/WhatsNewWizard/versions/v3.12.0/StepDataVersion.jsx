import React from "react";
import { History, Layers, RotateCcw, Settings } from "lucide-react";
import screenshot from "../../../../Images/whatsnew/data-version-desktop.png";

export const StepDataVersion = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <History size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Pick a data version</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      You can keep using older 11th Edition points and rules, for example at an event that has not moved to the latest
      update yet.
    </p>

    <figure className="wnw-screenshot">
      <img src={screenshot} alt="The Datasources tab in Settings with the Data version section highlighted" />
      <figcaption>Settings, Datasources tab, Data version</figcaption>
    </figure>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Settings size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Where to find it
          </strong>
          <p>Open Settings and go to Datasources. Choose a version under Data version.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <RotateCcw size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Back to the latest data
          </strong>
          <p>Choose Latest to get every new update again. Cards you already saved stay as they are.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Layers size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            All force dispositions
          </strong>
          <p>Detachments with more than one force disposition now show all of them.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepDataVersion;
