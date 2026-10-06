import React from "react";
import { BookOpen, Wrench, Tag, Printer } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Wrench size={28} />
      </div>
      <h2 className="mwnw-features-title">Editor Help &amp; Bug Fixes</h2>
      <p className="mwnw-features-subtitle">
        The Datasource Editor now includes built-in help and onboarding, and several printing and editing issues have
        been resolved.
      </p>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <BookOpen size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Datasource Editor Help &amp; Onboarding</span>
          <span className="mwnw-feature-item-desc">
            The Datasource Editor now has step-by-step guides for every feature. First-time users get an interactive
            walkthrough to get started quickly.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Tag size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Weapon Keywords on New Cards</span>
          <span className="mwnw-feature-item-desc">
            Adding a new weapon in the mobile editor now shows the keywords section straight away. Previously keywords
            only appeared on weapons that already had them.
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Printer size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Front &amp; Back Printing</span>
          <span className="mwnw-feature-item-desc">
            Printing with &quot;Front &amp; Back&quot; now places each side as its own card on the page. Previously the
            back was rendered on top of the front, hiding it.
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepPatchNotes;
