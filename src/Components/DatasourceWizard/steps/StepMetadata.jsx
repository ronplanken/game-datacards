import React, { useCallback } from "react";
import { FileText, User, Tag } from "lucide-react";

/**
 * StepMetadata - Datasource metadata input step (create mode only).
 * Captures name, version, and author for the new datasource.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepMetadata = ({ wizard }) => {
  const data = wizard.stepData["metadata"] || {};
  const name = data.name || "";
  const version = data.version || "1.0.0";
  const author = data.author || "";

  const updateField = useCallback(
    (field, value) => {
      wizard.updateStepData("metadata", (prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [wizard],
  );

  return (
    <div className="dsw-step-metadata" data-testid="dsw-step-metadata">
      <h2 className="dsw-step-title">Datasource Information</h2>
      <p className="dsw-step-description">
        Provide basic details for your custom datasource. Only the name is required.
      </p>

      <div className="dsw-form-fields">
        <div className="dsw-form-field">
          <label className="dsw-form-label" htmlFor="dsw-metadata-name">
            <FileText size={14} />
            Name <span className="dsw-form-required">*</span>
          </label>
          <input
            id="dsw-metadata-name"
            className="dsw-form-input"
            type="text"
            value={name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. My Custom Game System"
            autoFocus
            data-testid="dsw-metadata-name"
          />
          <span className="dsw-form-hint">A descriptive name for your game system or datasource.</span>
        </div>

        <div className="dsw-form-field">
          <label className="dsw-form-label" htmlFor="dsw-metadata-version">
            <Tag size={14} />
            Version
          </label>
          <input
            id="dsw-metadata-version"
            className="dsw-form-input"
            type="text"
            value={version}
            onChange={(e) => updateField("version", e.target.value)}
            placeholder="1.0.0"
            data-testid="dsw-metadata-version"
          />
          <span className="dsw-form-hint">Semantic version number for tracking changes.</span>
        </div>

        <div className="dsw-form-field">
          <label className="dsw-form-label" htmlFor="dsw-metadata-author">
            <User size={14} />
            Author
          </label>
          <input
            id="dsw-metadata-author"
            className="dsw-form-input"
            type="text"
            value={author}
            onChange={(e) => updateField("author", e.target.value)}
            placeholder="Your name or handle"
            data-testid="dsw-metadata-author"
          />
          <span className="dsw-form-hint">Optional attribution for the datasource creator.</span>
        </div>
      </div>
    </div>
  );
};
