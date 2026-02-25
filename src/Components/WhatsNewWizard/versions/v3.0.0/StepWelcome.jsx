import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Welcome step for v3.0.0
 *
 * Introduces the major update with a celebratory badge and summary
 * of what users can expect in version 3.0.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>Major Update</span>
    </div>
    <h2 className="wnw-welcome-title">Welcome to Version 3.0</h2>
    <p className="wnw-welcome-subtitle">
      This major release adds Age of Sigmar support, custom colours, a redesigned mobile viewer, and improved editor
      controls. Here&apos;s a quick overview.
    </p>
  </div>
);

export default StepWelcome;
