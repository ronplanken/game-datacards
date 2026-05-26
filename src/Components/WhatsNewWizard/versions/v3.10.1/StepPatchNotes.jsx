import React from "react";
import { MousePointerClick } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <MousePointerClick size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Mobile Card Tapping</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Tapping an enhancement, stratagem, or rule card on mobile now opens the card. Previously these card types did
      nothing when you tapped them in a custom datasource.
    </p>
  </div>
);

export default StepPatchNotes;
