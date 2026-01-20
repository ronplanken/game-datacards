import React from "react";
import { Zap, Heart } from "lucide-react";

/**
 * StepQuickAdd - Quick Add feature step for v3.1.0
 *
 * Highlights the quick add functionality for adding units directly
 * from the datasource list.
 *
 * @returns {JSX.Element} Quick Add feature step content
 */
export const StepQuickAdd = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Zap size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Quick Add</h2>
        <div className="wnw-feature-badges">
          <span className="wnw-community-badge">
            <Heart size={14} />
            Community Contribution
          </span>
        </div>
      </div>
    </div>
    <p className="wnw-feature-description">
      Add units directly from the datasource list to a category with a single click. Streamline your workflow when
      building card collections.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>One-Click Add</strong>
          <p>Add units instantly without opening the full editor</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepQuickAdd;
