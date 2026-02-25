import React from "react";
import { Store, Smartphone } from "lucide-react";
import { ADVANCED_FEATURES } from "../constants";

const ICON_MAP = {
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
      <p className="wz-step-description">Game Datacards has even more to offer. Here are some additional features.</p>

      <div className="wz-explore-grid">
        {ADVANCED_FEATURES.map((feature) => {
          const IconComponent = ICON_MAP[feature.icon] || Store;

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
