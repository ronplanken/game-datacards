import React from "react";
import { Wrench, Tag, Type, MessageSquareText } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Wrench size={28} />
      </div>
      <h2 className="mwnw-features-title">Custom Datasource Card Fixes</h2>
      <p className="mwnw-features-subtitle">
        Cards built with the Datasource Editor now show the faction keywords and ability descriptions you typed in, and
        you can rename the keywords and faction bars on each card.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Tag size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Faction Keywords Show on the Card</span>
          <span className="mwnw-feature-item-desc">
            Faction keywords typed into the editor now show up in the faction bar at the bottom of the card. Previously
            they stayed empty even after you saved the card.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <MessageSquareText size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Ability Descriptions Show by Default</span>
          <span className="mwnw-feature-item-desc">
            New abilities in the Datasource Editor now show their description on the card straight away. Older abilities
            with a hidden description fix themselves the next time you edit the description.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Type size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Customise the Keywords &amp; Faction Labels</span>
          <span className="mwnw-feature-item-desc">
            The Datasource Editor now lets you rename the &quot;Keywords&quot; and &quot;Faction&quot; bars on the card.
            The faction bar also defaults to &quot;Faction&quot; instead of &quot;Faction Keywords&quot;.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
