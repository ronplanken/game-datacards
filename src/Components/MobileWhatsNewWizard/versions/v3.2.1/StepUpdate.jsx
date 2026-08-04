import React from "react";
import { Sparkles, GripVertical, Paintbrush, RefreshCw } from "lucide-react";

/**
 * StepUpdate - Single step for mobile v3.2.1 UI improvements release
 *
 * @returns {JSX.Element} Update step content
 */
export const StepUpdate = () => (
  <div className="mwnw-features">
    <header className="mwnw-features-header">
      <div className="mwnw-features-icon">
        <Sparkles size={28} />
      </div>
      <h2 className="mwnw-features-title">UI Improvements</h2>
    </header>

    <div className="mwnw-features-list">
      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <GripVertical size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Drag-and-Drop Reordering</span>
          <span className="mwnw-feature-item-desc">
            Categories, subcategories, and datasources can now be reordered by dragging them into the position you want
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <Paintbrush size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Refreshed Styling</span>
          <span className="mwnw-feature-item-desc">
            The toolbar and unit configuration modal have been redesigned with a cleaner, modern look
          </span>
        </div>
      </div>

      <div className="mwnw-feature-item">
        <div className="mwnw-feature-item-icon">
          <RefreshCw size={20} />
        </div>
        <div className="mwnw-feature-item-content">
          <span className="mwnw-feature-item-title">Mobile List Sync</span>
          <span className="mwnw-feature-item-desc">
            Your mobile lists now stay in sync with your desktop configuration automatically
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default StepUpdate;
