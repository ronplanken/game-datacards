import React from "react";
import { Circle, CheckCircle, Check } from "lucide-react";
import { GAME_SYSTEMS } from "../constants";

const PrimaryCard = ({ system, isSelected, onSelect }) => (
  <div
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
      <h4 className="wz-game-card-title">{system.title}</h4>
      <div className="wz-game-card-tag-row">
        {system.tag && <span className={`wz-tag wz-tag--${system.tag.toLowerCase()}`}>{system.tag}</span>}
      </div>
      <span className="wz-game-card-subtitle">{system.subtitle}</span>
      <p className="wz-game-card-desc">{system.description}</p>
    </div>

    <div className="wz-game-card-check">{isSelected ? <CheckCircle size={24} /> : <Circle size={24} />}</div>
  </div>
);

const SecondaryButton = ({ system, isSelected, onSelect }) => (
  <button
    type="button"
    className={`wz-game-pill ${isSelected ? "wz-game-pill--selected" : ""}`}
    onClick={() => onSelect(system.id)}
    style={{ "--game-color": system.color }}
    aria-pressed={isSelected}>
    <span className="wz-game-pill-dot" aria-hidden="true" />
    <span className="wz-game-pill-text">
      <span className="wz-game-pill-title">{system.title}</span>
      {system.subtitle && <span className="wz-game-pill-subtitle">{system.subtitle}</span>}
    </span>
    {system.tag && <span className={`wz-tag wz-tag--${system.tag.toLowerCase()}`}>{system.tag}</span>}
    {isSelected && (
      <span className="wz-game-pill-check" aria-hidden="true">
        <Check size={14} />
      </span>
    )}
  </button>
);

/**
 * Game system selection step with interactive cards
 */
export const StepGameSystem = ({ selectedGameSystem, onSelect }) => {
  const primary = GAME_SYSTEMS.filter((s) => s.tier === "primary");
  const secondary = GAME_SYSTEMS.filter((s) => s.tier !== "primary");

  return (
    <div className="wz-step-game-system">
      <h2 className="wz-step-title">Choose Your Game System</h2>
      <p className="wz-step-description">
        Select the game system you want to create cards for. You can always switch or add more in Settings.
      </p>

      <div className="wz-game-grid wz-game-grid--primary">
        {primary.map((system) => (
          <PrimaryCard
            key={system.id}
            system={system}
            isSelected={selectedGameSystem === system.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {secondary.length > 0 && (
        <>
          <div className="wz-game-divider" role="presentation">
            <span className="wz-game-divider-label">More options</span>
          </div>
          <div className="wz-game-secondary">
            {secondary.map((system) => (
              <SecondaryButton
                key={system.id}
                system={system}
                isSelected={selectedGameSystem === system.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
