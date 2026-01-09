import React from "react";
import { Layers, Gamepad2, Printer, Cloud, Users } from "lucide-react";
import { FEATURE_HIGHLIGHTS } from "../constants";

const ICON_MAP = {
  Gamepad2: Gamepad2,
  Printer: Printer,
  Cloud: Cloud,
  Users: Users,
};

/**
 * Welcome step with hero and feature highlights
 */
export const StepWelcome = () => {
  return (
    <div className="wz-welcome">
      <div className="wz-welcome-logo">
        <Layers />
      </div>

      <h2 className="wz-welcome-title">Welcome to Game Datacards</h2>

      <p className="wz-welcome-subtitle">
        Create, customize, and share datacards for your favorite tabletop games. Let's get you set up in just a few
        steps.
      </p>

      <div className="wz-features-carousel">
        {FEATURE_HIGHLIGHTS.map((feature) => {
          const IconComponent = ICON_MAP[feature.icon] || Gamepad2;

          return (
            <div key={feature.id} className="wz-feature-card">
              <div className="wz-feature-icon">
                <IconComponent />
              </div>
              <h4 className="wz-feature-title">{feature.title}</h4>
              <p className="wz-feature-desc">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
