import React from "react";
import { FolderTree } from "lucide-react";

export const StepPatchNotes = () => (
  <div className="wnw-step-subscription">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <FolderTree size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Subcategories &amp; Sorting</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      The Datasource Editor can now group cards into subcategories and sort each card type. Turn on subcategories in the
      card type settings. Set a card&apos;s group in the Basic Information panel. Use the sort toggle on a card type to
      sort A&ndash;Z or Z&ndash;A.
    </p>
  </div>
);

export default StepPatchNotes;
