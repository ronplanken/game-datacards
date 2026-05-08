import React from "react";
import { Wrench, Tag, Type, MessageSquareText } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Wrench size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Custom Datasource Card Fixes</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Cards built with the Datasource Editor now show the faction keywords and ability descriptions you typed in, and
      you can rename the keywords and faction bars on each card.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Tag size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Faction Keywords Show on the Card
          </strong>
          <p>
            Faction keywords typed into the editor now show up in the faction bar at the bottom of the card. Previously
            they stayed empty even after you saved the card.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <MessageSquareText size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Ability Descriptions Show by Default
          </strong>
          <p>
            New abilities in the Datasource Editor now show their description on the card straight away. Older abilities
            with a hidden description fix themselves the next time you edit the description.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Type size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Customise the Keywords &amp; Faction Labels
          </strong>
          <p>
            The Datasource Editor now lets you rename the &quot;Keywords&quot; and &quot;Faction&quot; bars on the card.
            The faction bar also defaults to &quot;Faction&quot; instead of &quot;Faction Keywords&quot;.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
