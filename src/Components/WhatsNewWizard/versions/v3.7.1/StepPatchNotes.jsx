import React from "react";
import { BookOpen, Wrench, Tag, Printer } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Wrench size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Editor Help &amp; Bug Fixes</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      The Datasource Editor now includes built-in help and onboarding, and several printing and editing issues have been
      resolved.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <BookOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Datasource Editor Help &amp; Onboarding
          </strong>
          <p>
            The Datasource Editor now has step-by-step guides for every feature. First-time users get an interactive
            walkthrough to get started quickly.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Tag size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Weapon Keywords on New Cards
          </strong>
          <p>
            Adding a new weapon in the mobile editor now shows the keywords section straight away. Previously keywords
            only appeared on weapons that already had them.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>
            <Printer size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Front &amp; Back Printing
          </strong>
          <p>
            Printing with &quot;Front &amp; Back&quot; now places each side as its own card on the page. Previously the
            back was rendered on top of the front, hiding it.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
