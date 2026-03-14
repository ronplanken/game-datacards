import React from "react";
import { RefreshCw } from "lucide-react";

/**
 * StepMigration - Migration note for existing custom datasources
 *
 * Explains the two paths for users who previously imported custom datasources.
 *
 * @returns {JSX.Element} Migration note step content
 */
export const StepMigration = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <RefreshCw size={28} />
      </div>
      <h2 className="wnw-feature-title">Your Existing Datasources</h2>
    </div>
    <p className="wnw-feature-description">
      Previously imported a custom datasource? It is still available in the Editor tab. You can keep using it there, or
      move it into the new Datasource Editor.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Convert to Category</strong>
          <p>
            Turn a custom datasource back into a standard category in the Editor tab. Use this if you prefer the
            original workflow.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Re-import in the New Editor</strong>
          <p>
            Export your datasource as JSON, then import it in the Datasource Editor tab for the full editing experience.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepMigration;
