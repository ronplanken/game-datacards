import React, { useCallback } from "react";
import { Tags } from "lucide-react";

/**
 * Default metadata structure for new wizard sessions.
 */
const DEFAULT_METADATA = {
  hasKeywords: true,
  hasFactionKeywords: true,
  hasPoints: false,
  pointsFormat: "per-model",
};

/**
 * Available points format options.
 */
const POINTS_FORMAT_OPTIONS = [
  { value: "per-model", label: "Per model" },
  { value: "per-unit", label: "Per unit" },
];

/**
 * StepUnitMetadata - Configure keyword toggles, faction keyword toggle,
 * and points toggle with format selection for a unit card type.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepUnitMetadata = ({ wizard }) => {
  const data = wizard.stepData["unit-metadata"] || {};
  const metadata = data.metadata || DEFAULT_METADATA;

  const updateMetadata = useCallback(
    (updater) => {
      wizard.updateStepData("unit-metadata", (prev) => {
        const currentMetadata = prev?.metadata || DEFAULT_METADATA;
        const newMetadata = typeof updater === "function" ? updater(currentMetadata) : updater;
        return { ...prev, metadata: newMetadata };
      });
    },
    [wizard],
  );

  const handleToggleKeywords = useCallback(() => {
    updateMetadata((prev) => ({
      ...prev,
      hasKeywords: !prev.hasKeywords,
    }));
  }, [updateMetadata]);

  const handleToggleFactionKeywords = useCallback(() => {
    updateMetadata((prev) => ({
      ...prev,
      hasFactionKeywords: !prev.hasFactionKeywords,
    }));
  }, [updateMetadata]);

  const handleTogglePoints = useCallback(() => {
    updateMetadata((prev) => ({
      ...prev,
      hasPoints: !prev.hasPoints,
    }));
  }, [updateMetadata]);

  const handlePointsFormatChange = useCallback(
    (e) => {
      const value = e.target.value;
      updateMetadata((prev) => ({
        ...prev,
        pointsFormat: value,
      }));
    },
    [updateMetadata],
  );

  return (
    <div className="dsw-step-unit-metadata" data-testid="dsw-step-unit-metadata">
      <h2 className="dsw-step-title">Unit Metadata</h2>
      <p className="dsw-step-description">Configure keyword and points settings for this unit card type.</p>

      <div className="dsw-stats-fields" data-testid="dsw-unit-metadata-section">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <Tags size={14} />
            Keywords &amp; Points
          </span>
        </div>

        <div className="dsw-abilities-toggles" data-testid="dsw-unit-metadata-toggles">
          <label className="dsw-toggle-row">
            <input
              type="checkbox"
              className="dsw-toggle-checkbox"
              checked={metadata.hasKeywords}
              onChange={handleToggleKeywords}
              data-testid="dsw-unit-metadata-keywords-toggle"
            />
            <span className="dsw-toggle-label">Keywords</span>
            <span className="dsw-toggle-hint">Show keywords on the card (e.g. Infantry, Character, Fly).</span>
          </label>

          <label className="dsw-toggle-row">
            <input
              type="checkbox"
              className="dsw-toggle-checkbox"
              checked={metadata.hasFactionKeywords}
              onChange={handleToggleFactionKeywords}
              data-testid="dsw-unit-metadata-faction-keywords-toggle"
            />
            <span className="dsw-toggle-label">Faction Keywords</span>
            <span className="dsw-toggle-hint">Show faction keywords on the card (e.g. Imperium, Aeldari).</span>
          </label>

          <label className="dsw-toggle-row">
            <input
              type="checkbox"
              className="dsw-toggle-checkbox"
              checked={metadata.hasPoints}
              onChange={handleTogglePoints}
              data-testid="dsw-unit-metadata-points-toggle"
            />
            <span className="dsw-toggle-label">Points</span>
            <span className="dsw-toggle-hint">Enable a points cost field on the card.</span>
          </label>

          {metadata.hasPoints && (
            <div className="dsw-unit-metadata-points-format" data-testid="dsw-unit-metadata-points-format">
              <label className="dsw-form-label">Points Format</label>
              <select
                className="dsw-form-input dsw-abilities-format-select"
                value={metadata.pointsFormat}
                onChange={handlePointsFormatChange}
                data-testid="dsw-unit-metadata-points-format-select">
                {POINTS_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
