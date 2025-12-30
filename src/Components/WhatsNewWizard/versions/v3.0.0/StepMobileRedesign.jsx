import React from "react";
import { Smartphone } from "lucide-react";

/**
 * StepMobileRedesign - Mobile redesign feature step for v3.0.0
 *
 * Highlights the completely redesigned mobile viewer with improved
 * navigation, touch interactions, and optimized layouts.
 *
 * @returns {JSX.Element} Mobile redesign feature step content
 */
export const StepMobileRedesign = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Smartphone size={28} />
      </div>
      <h2 className="wnw-feature-title">Mobile Redesign</h2>
    </div>
    <p className="wnw-feature-description">
      The mobile viewer has been completely redesigned for a better experience on your phone or tablet.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Improved Navigation</strong>
          <p>Quickly browse through your cards and factions</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Better Touch Interactions</strong>
          <p>Swipe, tap, and navigate with ease</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Optimized Layout</strong>
          <p>Cards look great on any screen size</p>
        </div>
      </div>
    </div>
  </div>
);

export default StepMobileRedesign;
