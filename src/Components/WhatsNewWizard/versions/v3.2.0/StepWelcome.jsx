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
      This update adds user accounts and cloud sync. Your datacards are backed up and available on all your devices.
    </p>
  </div>
);

export default StepWelcome;
