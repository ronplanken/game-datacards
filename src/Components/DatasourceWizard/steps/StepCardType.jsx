import React, { useCallback } from "react";
import { Circle, CheckCircle, Swords, BookOpen, Sparkles, Zap } from "lucide-react";
import { WIZARD_MODES } from "../constants";

/**
 * Card type options for the datasource wizard.
 * Each option maps to a baseType in the schema.
 */
const CARD_TYPES = [
  {
    id: "unit",
    title: "Unit",
    description: "Cards with stat profiles, weapon tables, abilities, and keywords. Best for models and squads.",
    icon: Swords,
    color: "#e53e3e",
  },
  {
    id: "rule",
    title: "Rule",
    description: "Text-based rule cards with a title, description, and optional nested sub-rules.",
    icon: BookOpen,
    color: "#3182ce",
  },
  {
    id: "enhancement",
    title: "Enhancement",
    description: "Upgrade cards with a cost, descriptive effect, and keyword-based eligibility.",
    icon: Sparkles,
    color: "#d69e2e",
  },
  {
    id: "stratagem",
    title: "Stratagem",
    description: "Tactical ability cards with a cost, phase restriction, and descriptive effect.",
    icon: Zap,
    color: "#805ad5",
  },
];

/**
 * StepCardType - Card type selection step.
 * Presents a card grid for choosing the base type (unit, rule, enhancement, stratagem).
 * In add-card-type mode, already-defined types are shown as disabled.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepCardType = ({ wizard }) => {
  const selectedType = wizard.baseType;
  const isAddCardTypeMode = wizard.mode === WIZARD_MODES.ADD_CARD_TYPE;
  const data = wizard.stepData["card-type"] || {};

  const handleSelect = useCallback(
    (typeId) => {
      if (wizard.existingBaseTypes.includes(typeId)) return;

      wizard.changeBaseType(typeId);
      wizard.updateStepData("card-type", (prev) => ({
        ...prev,
        key: typeId,
        label: CARD_TYPES.find((ct) => ct.id === typeId)?.title || typeId,
      }));
    },
    [wizard],
  );

  const handleKeyChange = useCallback(
    (e) => {
      const value = e.target.value;
      wizard.updateStepData("card-type", (prev) => ({
        ...prev,
        key: value,
      }));
    },
    [wizard],
  );

  const handleLabelChange = useCallback(
    (e) => {
      const value = e.target.value;
      wizard.updateStepData("card-type", (prev) => ({
        ...prev,
        label: value,
      }));
    },
    [wizard],
  );

  return (
    <div className="dsw-step-card-type" data-testid="dsw-step-card-type">
      <h2 className="dsw-step-title">Choose a Card Type</h2>
      <p className="dsw-step-description">
        Select the type of card to define. Each type has a different structure tailored to its purpose.
      </p>

      <div className="dsw-system-grid" data-testid="dsw-card-type-grid">
        {CARD_TYPES.map((cardType) => {
          const isSelected = selectedType === cardType.id;
          const isDisabled = wizard.existingBaseTypes.includes(cardType.id);
          const Icon = cardType.icon;

          return (
            <div
              key={cardType.id}
              className={`dsw-system-card ${isSelected ? "dsw-system-card--selected" : ""} ${isDisabled ? "dsw-system-card--disabled" : ""}`}
              onClick={() => !isDisabled && handleSelect(cardType.id)}
              style={{ "--system-color": cardType.color }}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                  e.preventDefault();
                  handleSelect(cardType.id);
                }
              }}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              data-testid={`dsw-card-type-${cardType.id}`}>
              <div className="dsw-system-card-accent" />

              <div className="dsw-system-card-icon">
                <Icon size={24} />
              </div>

              <div className="dsw-system-card-content">
                <div className="dsw-system-card-header">
                  <h4 className="dsw-system-card-title">{cardType.title}</h4>
                  {isDisabled && <span className="dsw-card-type-exists-badge">Already defined</span>}
                </div>
                <p className="dsw-system-card-desc">{cardType.description}</p>
              </div>

              <div className="dsw-system-card-check">
                {isSelected ? <CheckCircle size={22} /> : <Circle size={22} />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedType && (
        <div className="dsw-card-type-details" data-testid="dsw-card-type-details">
          <h3 className="dsw-card-type-details-title">Card Type Details</h3>
          <div className="dsw-form-fields">
            <div className="dsw-form-field">
              <label className="dsw-form-label">
                Key <span className="dsw-form-required">*</span>
              </label>
              <input
                className="dsw-form-input"
                type="text"
                value={data.key || ""}
                onChange={handleKeyChange}
                placeholder="e.g. infantry, battle-rules"
                data-testid="dsw-card-type-key"
              />
              <span className="dsw-form-hint">A unique identifier for this card type within your datasource.</span>
            </div>
            <div className="dsw-form-field">
              <label className="dsw-form-label">Label</label>
              <input
                className="dsw-form-input"
                type="text"
                value={data.label || ""}
                onChange={handleLabelChange}
                placeholder="e.g. Infantry, Battle Rules"
                data-testid="dsw-card-type-label"
              />
              <span className="dsw-form-hint">A human-readable name for this card type.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
