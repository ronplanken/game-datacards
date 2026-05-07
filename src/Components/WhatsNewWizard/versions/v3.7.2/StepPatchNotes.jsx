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
      Cards built with the Datasource Editor now correctly display the faction keywords and ability descriptions you
      typed in. The keywords and faction labels are also customisable per datasource.
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
            Faction keywords entered in the editor now actually appear in the bottom bar of the rendered card. They
            were being saved correctly but the renderer was reading the wrong field.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <MessageSquareText size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Ability Descriptions Render by Default
          </strong>
          <p>
            New abilities in the schema-driven editor now show their description automatically. Existing abilities
            with hidden descriptions will fix themselves the next time you edit the description field.
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
            The metadata editor in the Datasource Editor now lets you rename the &quot;Keywords&quot; and
            &quot;Faction&quot; bars on the card. The faction bar default also changes from &quot;Faction
            Keywords&quot; to the shorter &quot;Faction&quot;.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
