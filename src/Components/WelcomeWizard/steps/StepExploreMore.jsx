import React from "react";
import { Cloud, Store, Smartphone } from "lucide-react";
import { ADVANCED_FEATURES } from "../constants";

const ICON_MAP = {
  Cloud: Cloud,
  Store: Store,
  Smartphone: Smartphone,
};

/**
 * Explore More step showing advanced features
 */
export const StepExploreMore = () => {
  return (
    <div className="wz-step-explore-more">
      <h2 className="wz-step-title">Explore More Features</h2>
      <p className="wz-step-description">Game Datacards has even more to offer. Here&apos;s what you can unlock.</p>

      <div className="wz-explore-grid">
        {ADVANCED_FEATURES.map((feature) => {
          const IconComponent = ICON_MAP[feature.icon] || Cloud;

          return (
            <div key={feature.id} className="wz-explore-card">
              <div className="wz-explore-icon">
                <IconComponent />
              </div>
              <h4 className="wz-explore-title">{feature.title}</h4>
              <p className="wz-explore-desc">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="wz-explore-hint">
        Create an account in <strong>Settings</strong> to unlock cloud sync and community features.
      </div>
    </div>
  );
};
