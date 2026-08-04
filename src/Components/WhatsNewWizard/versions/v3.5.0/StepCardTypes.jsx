import React from "react";
import { Layers } from "lucide-react";

/**
 * StepCardTypes - Card types and fields overview for v3.5.0
 *
 * Explains the different card types and field customization options.
 *
 * @returns {JSX.Element} Card types feature step content
 */
export const StepCardTypes = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Layers size={28} />
      </div>
      <h2 className="wnw-feature-title">Card Types & Fields</h2>
    </div>
    <p className="wnw-feature-description">
      Each datasource can hold multiple card types — units, rules, enhancements, and stratagems. You define exactly what
      fields each type contains.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Unit Cards</strong>
          <p>
            Set up stat lines, weapon types with custom columns, and ability categories with flexible display formats.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Rules, Enhancements & Stratagems</strong>
          <p>
            Each type has its own structure. Add text, rich text, dropdown, and toggle fields to match your game system.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Import & Export</strong>
          <p>Share your datasource as a JSON file, or import one from someone else to get started quickly.</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCardTypes;
