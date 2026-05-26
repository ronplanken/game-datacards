import React from "react";
import { MousePointerClick } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <MousePointerClick size={28} />
      </div>
      <h2 className="mwnw-features-title">Mobile Card Tapping</h2>
      <p className="mwnw-features-subtitle">
        Tapping an enhancement, stratagem, or rule card on mobile now opens the card. Previously these card types did
        nothing when you tapped them in a custom datasource.
      </p>
    </header>
  </div>
);

export default StepPatchNotes;
