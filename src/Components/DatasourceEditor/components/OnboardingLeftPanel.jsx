import { Database } from "lucide-react";

export const OnboardingLeftPanel = () => {
  return (
    <div className="designer-empty-state full-height">
      <Database />
      <h3 className="designer-onboarding-heading">Custom Datasources</h3>
      <p className="designer-empty-state-subtitle">
        Build your own card formats with custom fields, stats, and layouts. Works with any game system.
      </p>
    </div>
  );
};
