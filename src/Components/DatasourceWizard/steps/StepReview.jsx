import React, { useMemo } from "react";
import { CheckCircle, Database, Swords, BookOpen, Sparkles, Zap, FileText, Tag, User, Settings } from "lucide-react";
import { WIZARD_MODES } from "../constants";

/**
 * Icon and color mapping for card base types.
 */
const BASE_TYPE_CONFIG = {
  unit: { icon: Swords, color: "#e53e3e", label: "Unit" },
  rule: { icon: BookOpen, color: "#3182ce", label: "Rule" },
  enhancement: { icon: Sparkles, color: "#d69e2e", label: "Enhancement" },
  stratagem: { icon: Zap, color: "#805ad5", label: "Stratagem" },
};

/**
 * Base system display labels.
 */
const BASE_SYSTEM_LABELS = {
  "40k-10e": "Warhammer 40K 10th Edition",
  aos: "Age of Sigmar",
  blank: "Blank Template",
};

/**
 * Summarize a unit card type schema.
 */
const summarizeUnitSchema = (schema) => {
  const items = [];

  if (schema.stats?.fields?.length) {
    items.push(`${schema.stats.fields.length} stat field${schema.stats.fields.length !== 1 ? "s" : ""}`);
  }
  if (schema.weaponTypes?.types?.length) {
    items.push(`${schema.weaponTypes.types.length} weapon type${schema.weaponTypes.types.length !== 1 ? "s" : ""}`);
  }
  if (schema.abilities?.categories?.length) {
    items.push(
      `${schema.abilities.categories.length} ability categor${schema.abilities.categories.length !== 1 ? "ies" : "y"}`,
    );
  }

  return items;
};

/**
 * Summarize a non-unit card type schema (rule, enhancement, stratagem).
 */
const summarizeGenericSchema = (schema, baseType) => {
  const items = [];

  if (schema.fields?.length) {
    items.push(`${schema.fields.length} field${schema.fields.length !== 1 ? "s" : ""}`);
  }
  if (baseType === "rule" && schema.rules) {
    items.push(`Rules collection (${schema.rules.fields?.length || 0} fields)`);
  }
  if (baseType === "enhancement" && schema.keywords) {
    items.push(`Keywords collection (${schema.keywords.fields?.length || 0} fields)`);
  }

  return items;
};

/**
 * StepReview - Read-only summary of the assembled schema.
 * Shows datasource metadata (create mode) and card type schema details.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepReview = ({ wizard }) => {
  const isCreateMode = wizard.mode === WIZARD_MODES.CREATE;
  const result = useMemo(() => wizard.assembleResult(), [wizard]);

  const metadata = isCreateMode ? result : null;
  const cardType = isCreateMode ? result?.schema?.cardTypes?.[0] : result;
  const typeConfig = cardType ? BASE_TYPE_CONFIG[cardType.baseType] : null;
  const TypeIcon = typeConfig?.icon || FileText;

  const schemaSummary = useMemo(() => {
    if (!cardType?.schema) return [];
    if (cardType.baseType === "unit") {
      return summarizeUnitSchema(cardType.schema);
    }
    return summarizeGenericSchema(cardType.schema, cardType.baseType);
  }, [cardType]);

  return (
    <div className="dsw-step-review" data-testid="dsw-step-review">
      <h2 className="dsw-step-title">Review</h2>
      <p className="dsw-step-description">
        {isCreateMode
          ? "Review your datasource configuration before creating it."
          : "Review the card type configuration before adding it."}
      </p>

      <div className="dsw-review-sections" data-testid="dsw-review-sections">
        {/* Datasource metadata (create mode only) */}
        {isCreateMode && metadata && (
          <div className="dsw-review-section" data-testid="dsw-review-metadata">
            <div className="dsw-review-section-header">
              <Database size={16} />
              <h3 className="dsw-review-section-title">Datasource</h3>
            </div>
            <div className="dsw-review-fields">
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">
                  <FileText size={12} />
                  Name
                </span>
                <span className="dsw-review-field-value" data-testid="dsw-review-name">
                  {metadata.name || "Untitled"}
                </span>
              </div>
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">
                  <Tag size={12} />
                  Version
                </span>
                <span className="dsw-review-field-value" data-testid="dsw-review-version">
                  {metadata.version || "1.0.0"}
                </span>
              </div>
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">
                  <User size={12} />
                  Author
                </span>
                <span className="dsw-review-field-value" data-testid="dsw-review-author">
                  {metadata.author || "—"}
                </span>
              </div>
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">
                  <Settings size={12} />
                  Base System
                </span>
                <span className="dsw-review-field-value" data-testid="dsw-review-base-system">
                  {BASE_SYSTEM_LABELS[metadata.schema?.baseSystem] || metadata.schema?.baseSystem || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card type summary */}
        {cardType && (
          <div className="dsw-review-section" data-testid="dsw-review-card-type">
            <div className="dsw-review-section-header">
              <TypeIcon size={16} style={{ color: typeConfig?.color }} />
              <h3 className="dsw-review-section-title">Card Type</h3>
            </div>
            <div className="dsw-review-fields">
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">Type</span>
                <span className="dsw-review-field-value dsw-review-type-badge" data-testid="dsw-review-base-type">
                  <TypeIcon size={12} style={{ color: typeConfig?.color }} />
                  {typeConfig?.label || cardType.baseType}
                </span>
              </div>
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">Key</span>
                <span className="dsw-review-field-value dsw-review-code" data-testid="dsw-review-key">
                  {cardType.key || "—"}
                </span>
              </div>
              <div className="dsw-review-field">
                <span className="dsw-review-field-label">Label</span>
                <span className="dsw-review-field-value" data-testid="dsw-review-label">
                  {cardType.label || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Schema summary */}
        {cardType?.schema && (
          <div className="dsw-review-section" data-testid="dsw-review-schema">
            <div className="dsw-review-section-header">
              <Settings size={16} />
              <h3 className="dsw-review-section-title">Schema</h3>
            </div>
            {schemaSummary.length > 0 ? (
              <ul className="dsw-review-list" data-testid="dsw-review-schema-list">
                {schemaSummary.map((item, idx) => (
                  <li key={idx} className="dsw-review-list-item">
                    <CheckCircle size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dsw-review-empty" data-testid="dsw-review-schema-empty">
                No fields configured yet. You can add them later in the editor.
              </p>
            )}

            {/* Unit-specific toggles */}
            {cardType.baseType === "unit" && (
              <div className="dsw-review-toggles" data-testid="dsw-review-unit-toggles">
                {cardType.schema.stats?.allowMultipleProfiles && (
                  <span className="dsw-review-toggle-badge">Multiple Profiles</span>
                )}
                {cardType.schema.abilities?.hasInvulnerableSave && (
                  <span className="dsw-review-toggle-badge">Invulnerable Save</span>
                )}
                {cardType.schema.abilities?.hasDamagedAbility && (
                  <span className="dsw-review-toggle-badge">Damaged Ability</span>
                )}
                {cardType.schema.metadata?.hasKeywords && <span className="dsw-review-toggle-badge">Keywords</span>}
                {cardType.schema.metadata?.hasFactionKeywords && (
                  <span className="dsw-review-toggle-badge">Faction Keywords</span>
                )}
                {cardType.schema.metadata?.hasPoints && (
                  <span className="dsw-review-toggle-badge">
                    Points ({cardType.schema.metadata.pointsFormat === "per-model" ? "per model" : "per unit"})
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode-specific instruction */}
      <div className="dsw-review-footer-note" data-testid="dsw-review-footer-note">
        <CheckCircle size={14} />
        <span>
          {isCreateMode
            ? "Everything looks good. You can edit the schema further after creating the datasource."
            : "Everything looks good. The new card type will be added to your datasource."}
        </span>
      </div>
    </div>
  );
};
