import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Welcome step for v3.1.0
 *
 * Introduces the new features in version 3.1.0 with a celebratory badge
 * and summary of the main updates.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>New Features</span>
    </div>
    <h2 className="wnw-welcome-title">Welcome to Version 3.1</h2>
    <p className="wnw-welcome-subtitle">
      This update adds custom datasources, a quick add workflow for building collections faster, and several fixes for
      printing and imports.
    </p>
  </div>
);

export default StepWelcome;
