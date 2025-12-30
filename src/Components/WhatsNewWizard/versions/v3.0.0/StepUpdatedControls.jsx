import React from "react";
import { SlidersHorizontal } from "lucide-react";

/**
 * StepUpdatedControls - Updated controls feature step for v3.0.0
 *
 * Highlights the improved editor controls including auto-fit scaling,
 * better zoom controls, and overall performance improvements.
 *
 * @returns {JSX.Element} Updated controls feature step content
 */
export const StepUpdatedControls = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <SlidersHorizontal size={28} />
      </div>
      <h2 className="wnw-feature-title">Updated Controls</h2>
    </div>
    <p className="wnw-feature-description">
      We&apos;ve improved the editor controls to make creating and editing cards even easier.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Auto-fit Scaling</strong>
          <p>Cards automatically scale to fit the available space</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Improved Zoom</strong>
          <p>Better zoom controls for precise card viewing</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Smoother Experience</strong>
          <p>Overall performance improvements in the editor</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepUpdatedControls;
