import React, { useCallback } from "react";
import { Circle, CheckCircle, Crosshair, Shield, FileText } from "lucide-react";

/**
 * Base system options for the datasource wizard.
 * Each option maps to a preset schema generator.
 */
const BASE_SYSTEMS = [
  {
    id: "40k-10e",
    title: "Warhammer 40K",
    subtitle: "10th Edition",
    description:
      "Pre-configured stat lines, weapon tables, abilities, and keywords matching the 40K 10th Edition format.",
    icon: Crosshair,
    color: "#e53e3e",
  },
  {
    id: "aos",
    title: "Age of Sigmar",
    subtitle: "4th Edition",
    description:
      "Stat profiles for move, save, control, health, ward, and wizard/priest levels following the AoS format.",
    icon: Shield,
    color: "#d69e2e",
  },
  {
    id: "blank",
    title: "Blank Template",
    subtitle: "Start from scratch",
    description: "An empty schema with no pre-configured fields. Build your custom game system from the ground up.",
    icon: FileText,
    color: "#718096",
  },
];

/**
 * StepBaseSystem - Base system selection step (create mode only).
 * Presents a card grid for choosing 40K, AoS, or Blank as the starting template.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepBaseSystem = ({ wizard }) => {
  const data = wizard.stepData["base-system"] || {};
  const selectedSystem = data.baseSystem || null;

  const handleSelect = useCallback(
    (systemId) => {
      wizard.updateStepData("base-system", (prev) => ({
        ...prev,
        baseSystem: systemId,
      }));
    },
    [wizard],
  );

  return (
    <div className="dsw-step-base-system" data-testid="dsw-step-base-system">
      <h2 className="dsw-step-title">Choose a Base System</h2>
      <p className="dsw-step-description">
        Select a starting template for your datasource. This determines the default card structure and stat fields.
      </p>

      <div className="dsw-system-grid" data-testid="dsw-system-grid">
        {BASE_SYSTEMS.map((system) => {
          const isSelected = selectedSystem === system.id;
          const Icon = system.icon;

          return (
            <div
              key={system.id}
              className={`dsw-system-card ${isSelected ? "dsw-system-card--selected" : ""}`}
              onClick={() => handleSelect(system.id)}
              style={{ "--system-color": system.color }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(system.id);
                }
              }}
              aria-pressed={isSelected}
              data-testid={`dsw-system-card-${system.id}`}>
              <div className="dsw-system-card-accent" />

              <div className="dsw-system-card-icon">
                <Icon size={24} />
              </div>

              <div className="dsw-system-card-content">
                <div className="dsw-system-card-header">
                  <h4 className="dsw-system-card-title">{system.title}</h4>
                  {system.subtitle && <span className="dsw-system-card-subtitle">{system.subtitle}</span>}
                </div>
                <p className="dsw-system-card-desc">{system.description}</p>
              </div>

              <div className="dsw-system-card-check">
                {isSelected ? <CheckCircle size={22} /> : <Circle size={22} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
