import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Welcome step for v3.2.0
 *
 * Introduces user accounts and cloud sync features in version 3.2.0.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>Version 3.2</span>
    </div>
    <h2 className="wnw-welcome-title">User Accounts &amp; Cloud Sync</h2>
    <p className="wnw-welcome-subtitle">
      This update introduces user accounts and cloud sync, allowing you to access your datacards across devices and keep
      everything backed up automatically.
    </p>
  </div>
);

export default StepWelcome;
