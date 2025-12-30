import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Mobile welcome step for v3.1.0
 *
 * Introduces the mobile-specific features in version 3.1.0.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="mwnw-welcome">
    <header className="mwnw-welcome-header">
      <div className="mwnw-welcome-badge">
        <Sparkles size={18} />
        <span>Version 3.1</span>
      </div>
      <h1 className="mwnw-welcome-title">New Mobile Features</h1>
      <p className="mwnw-welcome-subtitle">
        We&apos;ve added some helpful improvements to enhance your mobile experience.
      </p>
    </header>
  </div>
);

export default StepWelcome;
