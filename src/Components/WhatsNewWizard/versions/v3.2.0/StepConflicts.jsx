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
      When changes are made on multiple devices, a conflict dialog will help you choose how to proceed.
    </p>
    <div className="wnw-mock-preview">
      <MockConflictDialog />
    </div>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Local</strong>
          <p>Overwrite the cloud version with your local changes</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Cloud</strong>
          <p>Replace your local data with the version stored in the cloud</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Keep Both</strong>
          <p>Save both versions as separate categories so nothing is lost</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepConflicts;
