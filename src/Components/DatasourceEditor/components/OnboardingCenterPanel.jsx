import { Settings, PenLine, Printer, Plus } from "lucide-react";

const STEPS = [
  {
    icon: Settings,
    number: 1,
    title: "Define a Schema",
    description: "Choose a base system and configure card types with the fields, stats, and abilities you need.",
  },
  {
    icon: PenLine,
    number: 2,
    title: "Add Cards",
    description: "Fill in your cards using the editor. Each card follows the structure you defined.",
  },
  {
    icon: Printer,
    number: 3,
    title: "Print & Share",
    description: "Preview your cards, print them, or share them with the community.",
  },
];

export const OnboardingCenterPanel = ({ onNewDatasource }) => {
  return (
    <div className="designer-onboarding-center">
      <h2 className="designer-onboarding-title">How It Works</h2>
      <p className="designer-onboarding-subtitle">Three steps to custom game cards</p>
      <div className="designer-onboarding-steps">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="designer-onboarding-step">
              <span className="designer-onboarding-step-number">{step.number}</span>
              <Icon size={24} className="designer-onboarding-step-icon" />
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          );
        })}
      </div>
      <button className="designer-template-btn" onClick={onNewDatasource} aria-label="Get started">
        <Plus size={14} />
        Get Started
      </button>
      <p className="designer-onboarding-help-link">
        Want more detail? <a href="/help/datasource-editor/getting-started">Read the full guide</a>
      </p>
    </div>
  );
};
