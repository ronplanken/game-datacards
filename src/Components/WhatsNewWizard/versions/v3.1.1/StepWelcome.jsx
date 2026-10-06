import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Welcome step for v3.1.1
 *
 * Introduces the new features in version 3.1.1 with a celebratory badge
 * and summary of the main updates.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>Data Update</span>
    </div>
    <h2 className="wnw-welcome-title">Welcome to Version 3.1.1</h2>
    <p className="wnw-welcome-subtitle">
      This update brings a reorganized datasource structure for Space Marines and other chapters, making it easier to
      find the detachments you need.
    </p>
  </div>
);

export default StepWelcome;
