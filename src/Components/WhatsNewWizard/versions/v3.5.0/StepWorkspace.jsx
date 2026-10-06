import React from "react";
import { LayoutDashboard } from "lucide-react";

/**
 * StepWorkspace - Editor workspace overview for v3.5.0
 *
 * Introduces the three-panel layout, live preview, and guided setup wizard.
 *
 * @returns {JSX.Element} Workspace feature step content
 */
export const StepWorkspace = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <LayoutDashboard size={28} />
      </div>
      <h2 className="wnw-feature-title">The Workspace</h2>
    </div>
    <p className="wnw-feature-description">
      A dedicated editor for building and managing your datasources. Define card types, configure fields, and preview
      cards — all in one place.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Three-Panel Layout</strong>
          <p>
            Browse datasources and cards on the left, see a live preview in the center, and edit properties on the
            right.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Live Preview</strong>
          <p>
            Cards update as you type. Zoom in, auto-fit to the panel, or switch between card types to check your work.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Guided Setup</strong>
          <p>
            A step-by-step wizard walks you through creating a new datasource: name, base system, and your first card
            type.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepWorkspace;
