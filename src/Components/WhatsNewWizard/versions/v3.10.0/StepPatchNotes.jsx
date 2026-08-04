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
      The Datasource Editor can now group a card type&apos;s cards into subcategories and sort each card type on its
      own. Turn on subcategories in the card type settings, set each card&apos;s group from the Basic Information panel,
      and use the sort toggle on a card type to order its list A&ndash;Z or Z&ndash;A.
    </p>
  </div>
);

export default StepPatchNotes;
