import React from "react";
import { Sparkles } from "lucide-react";

/**
 * StepWelcome - Mobile welcome step for v3.2.0
 *
 * Introduces the premium subscription features in version 3.2.0.
 *
 * @returns {JSX.Element} Welcome step content
 */
export const StepWelcome = () => (
  <div className="mwnw-welcome">
    <header className="mwnw-welcome-header">
      <div className="mwnw-welcome-badge">
        <Sparkles size={18} />
        <span>Version 3.2</span>
      </div>
      <h1 className="mwnw-welcome-title">Premium Options</h1>
      <p className="mwnw-welcome-subtitle">
        We&apos;ve added optional premium tiers while keeping all core features completely free.
      </p>
    </header>
  </div>
);

export default StepWelcome;
