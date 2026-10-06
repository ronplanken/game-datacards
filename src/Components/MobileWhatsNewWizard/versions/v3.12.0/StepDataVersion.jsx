import React from "react";
import { History, Layers, RotateCcw, Settings } from "lucide-react";
import screenshot from "../../../../Images/whatsnew/data-version-mobile.png";

export const StepDataVersion = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <History size={28} />
      </div>
      <h2 className="mwnw-features-title">Pick a data version</h2>
      <p className="mwnw-features-subtitle">
        Keep using older 11th Edition points and rules, for example at an event that has not moved to the latest update
        yet.
      </p>
    </header>

    <figure className="mwnw-screenshot">
      <img src={screenshot} alt="The settings menu with the Data version row highlighted" />
      <figcaption>Settings, Display, Data version</figcaption>
    </figure>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Settings size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Where to find it</span>
          <span className="mwnw-feature-item-desc">Tap the settings icon at the bottom and choose a Data version</span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <RotateCcw size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Back to the latest data</span>
          <span className="mwnw-feature-item-desc">
            Choose Latest to get every new update again. Cards you already saved stay as they are
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Layers size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">All force dispositions</span>
          <span className="mwnw-feature-item-desc">
            Detachments with more than one force disposition now show all of them
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepDataVersion;
