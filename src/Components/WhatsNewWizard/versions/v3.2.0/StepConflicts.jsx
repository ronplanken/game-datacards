import React from "react";
import { GitMerge } from "lucide-react";
import { MockConflictDialog } from "../../../WelcomeWizard/demos";

/**
 * StepConflicts - Resolving Conflicts step for v3.2.0
 *
 * Explains the three conflict resolution options that appear
 * in the SyncConflictModal when local and cloud data diverge.
 *
 * @returns {JSX.Element} Resolving Conflicts step content
 */
export const StepConflicts = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <GitMerge size={28} />
      </div>
      <h2 className="wnw-feature-title">Resolving Conflicts</h2>
    </div>
    <p className="wnw-feature-description">
      If you edit the same category on different devices, a dialog lets you choose which version to keep.
    </p>
    <div className="wnw-mock-preview">
      <MockConflictDialog />
    </div>
    <div className="wnw-feature-highlights wnw-feature-highlights--row">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Local</strong>
          <p>Overwrite cloud with your local changes</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Cloud</strong>
          <p>Replace local data with the cloud version</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Both</strong>
          <p>Save both as separate categories</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepConflicts;
