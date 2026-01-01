import React from "react";
import { Palette } from "lucide-react";

/**
 * StepCustomColours - Custom colours feature step for v3.0.0
 *
 * Highlights the new custom colour options for cards including
 * banner colours, header colours, and per-card customization.
 *
 * @returns {JSX.Element} Custom colours feature step content
 */
export const StepCustomColours = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Palette size={28} />
      </div>
      <h2 className="wnw-feature-title">Custom Colours</h2>
    </div>
    <p className="wnw-feature-description">Take full control of your card appearance with custom colour options.</p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Banner Colours</strong>
          <p>Override the faction banner colour on any card</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Header Colours</strong>
          <p>Customize header colours for a unique look</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Per-Card Customization</strong>
          <p>Each card can have its own colour scheme</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepCustomColours;
