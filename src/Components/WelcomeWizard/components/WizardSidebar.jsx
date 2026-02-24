import React from "react";
import { Check } from "lucide-react";

/**
 * Desktop sidebar with step navigation
 */
export const WizardSidebar = ({ currentStep, completedSteps, onStepClick, steps }) => {
  return (
    <nav className="wz-sidebar">
      {steps.map((stepItem, index) => {
        const isActive = currentStep === index;
        const isCompleted = completedSteps.has(index);
        const canClick = isCompleted || index < currentStep;

        return (
          <div
            key={stepItem.key}
            className={`wz-sidebar-item ${isActive ? "wz-sidebar-item--active" : ""} ${
              isCompleted ? "wz-sidebar-item--completed" : ""
            }`}
            onClick={() => canClick && onStepClick(index)}
            style={{ animationDelay: `${index * 0.05}s` }}
            role="button"
            tabIndex={canClick ? 0 : -1}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && canClick) {
                onStepClick(index);
              }
            }}>
            <div className="wz-sidebar-marker">{isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}</div>
            <span className="wz-sidebar-title">{stepItem.title}</span>
          </div>
        );
      })}
    </nav>
  );
};
