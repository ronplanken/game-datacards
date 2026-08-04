import React from "react";
import { PenTool, LayoutTemplate, Database, FlaskConical } from "lucide-react";

/**
 * StepCardDesigner - Single step for mobile v3.4.0 Card Designer beta
 *
 * @returns {JSX.Element} Card Designer announcement step content
 */
export const StepCardDesigner = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <PenTool size={28} />
      </div>
      <h2 className="mwnw-features-title">Card Designer (Beta)</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <LayoutTemplate size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Design Custom Cards</span>
          <span className="mwnw-feature-item-desc">
            Create your own datacard templates with text, images, shapes, and frames
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Database size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Live Data Binding</span>
          <span className="mwnw-feature-item-desc">
            Connect templates to real game data and preview with actual unit stats
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <FlaskConical size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Desktop Only (Beta)</span>
          <span className="mwnw-feature-item-desc">
            The Card Designer is available on desktop only and requires a user account. Templates may change in future
            updates
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepCardDesigner;
