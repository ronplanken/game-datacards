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
        Cards built with the Datasource Editor now correctly display the faction keywords and ability descriptions
        you typed in. The keywords and faction labels are also customisable per datasource.
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
            Faction keywords entered in the editor now actually appear in the bottom bar of the rendered card. They
            were being saved correctly but the renderer was reading the wrong field.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <MessageSquareText size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Ability Descriptions Render by Default</span>
          <span className="mwnw-feature-item-desc">
            New abilities in the schema-driven editor now show their description automatically. Existing abilities
            with hidden descriptions will fix themselves the next time you edit the description field.
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
            The metadata editor in the Datasource Editor now lets you rename the &quot;Keywords&quot; and
            &quot;Faction&quot; bars on the card. The faction bar default also changes from &quot;Faction
            Keywords&quot; to the shorter &quot;Faction&quot;.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
