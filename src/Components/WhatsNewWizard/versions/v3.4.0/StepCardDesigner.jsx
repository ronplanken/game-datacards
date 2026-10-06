import React from "react";
import { PenTool, LayoutTemplate, Database, FlaskConical } from "lucide-react";

/**
 * StepCardDesigner - Single step for v3.4.0 Card Designer beta
 *
 * @returns {JSX.Element} Card Designer announcement step content
 */
export const StepCardDesigner = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <PenTool size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Card Designer (Beta)</h2>
      </div>
    </div>
    <p className="wnw-feature-description">
      Design your own datacards from scratch. Create custom templates, add text, images, shapes, and frames, then
      connect everything to real game data so your cards fill in automatically.
    </p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Build Your Layout</strong>
          <p>
            Start from a preset or a blank canvas. Add and arrange elements to create the exact card design you want.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Connect to Game Data</strong>
          <p>
            Use data bindings to pull in unit names, stats, weapons, and abilities. Preview with real data to see how
            your cards will look.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Beta — Account Required</strong>
          <p>
            The Card Designer is in beta and requires a user account. Templates may need adjustments in future updates
            as the feature evolves.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCardDesigner;
