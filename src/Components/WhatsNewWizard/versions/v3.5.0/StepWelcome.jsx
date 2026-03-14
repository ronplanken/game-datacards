import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Welcome step for v3.5.0
 *
 * Introduces the Datasource Editor feature.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>Version 3.5</span>
    </div>
    <h2 className="wnw-welcome-title">Datasource Editor</h2>
    <p className="wnw-welcome-subtitle">
      Build custom card structures for any game system. Define your own stats, weapons, abilities, and fields — then
      fill in cards that match your exact format.
    </p>
  </div>
);

export default StepWelcome;
