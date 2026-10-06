import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepUpdate - Single step for v3.2.1 UI improvements release
 *
 * @returns {JSX.Element} Update step content
 */
export const StepUpdate = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Sparkles size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">UI Improvements</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      This update brings a collection of interface refinements across desktop and mobile.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Drag-and-Drop Reordering</strong>
          <p>
            Categories, subcategories, and datasources can now be reordered by dragging them into the position you want.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Refreshed Desktop Styling</strong>
          <p>The desktop toolbar and unit configuration modal have been redesigned with a cleaner, modern look.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Mobile List Sync</strong>
          <p>Your mobile lists now stay in sync with your desktop configuration automatically.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepUpdate;
