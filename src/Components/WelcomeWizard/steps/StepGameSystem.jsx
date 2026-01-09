import React from "react";
import { Circle, CheckCircle } from "lucide-react";
import { GAME_SYSTEMS } from "../constants";

/**
 * Game system selection step with interactive cards
 */
export const StepGameSystem = ({ selectedGameSystem, onSelect }) => {
  return (
    <div className="wz-step-game-system">
      <h2 className="wz-step-title">Choose Your Game System</h2>
      <p className="wz-step-description">
        Select the game system you want to create cards for. You can always switch or add more in Settings.
      </p>

      <div className="wz-game-grid">
        {GAME_SYSTEMS.map((system) => {
          const isSelected = selectedGameSystem === system.id;

          return (
            <div
              key={system.id}
              className={`wz-game-card ${isSelected ? "wz-game-card--selected" : ""}`}
              onClick={() => onSelect(system.id)}
              style={{ "--game-color": system.color }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(system.id);
                }
              }}
              aria-pressed={isSelected}>
              <div className="wz-game-card-accent" />

              <div className="wz-game-card-content">
                <div className="wz-game-card-header">
                  <h4 className="wz-game-card-title">{system.title}</h4>
                  {system.tag && <span className={`wz-tag wz-tag--${system.tag.toLowerCase()}`}>{system.tag}</span>}
                </div>
                {system.subtitle && <span className="wz-game-card-subtitle">{system.subtitle}</span>}
                <p className="wz-game-card-desc">{system.description}</p>
              </div>

              <div className="wz-game-card-check">{isSelected ? <CheckCircle size={24} /> : <Circle size={24} />}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
