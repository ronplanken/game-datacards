import React, { useCallback } from "react";
import { FileText, User, Tag, Palette } from "lucide-react";
import { DEFAULT_DATASOURCE_COLOURS } from "../../../Helpers/customSchema.helpers";

/**
 * StepMetadata - Datasource metadata input step (create mode only).
 * Captures name, version, author, and card colours for the new datasource.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepMetadata = ({ wizard }) => {
  const data = wizard.stepData["metadata"] || {};
  const name = data.name || "";
  const version = data.version || "1.0.0";
  const author = data.author || "";
  const mainColour = data.mainColour || DEFAULT_DATASOURCE_COLOURS.header;
  const accentColour = data.accentColour || DEFAULT_DATASOURCE_COLOURS.banner;

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
          <span className="dsw-form-hint">Version number for tracking changes (e.g. 1.0.0).</span>
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
          <span className="dsw-form-hint">Optional. The person or group who created this datasource.</span>
        </div>

        <div className="dsw-form-row">
          <div className="dsw-form-field">
            <label className="dsw-form-label" htmlFor="dsw-metadata-main-colour">
              <Palette size={14} />
              Main Colour
            </label>
            <input
              id="dsw-metadata-main-colour"
              type="color"
              className="dsw-form-colour"
              value={mainColour}
              onChange={(e) => updateField("mainColour", e.target.value)}
              data-testid="dsw-metadata-main-colour"
            />
            <span className="dsw-form-hint">Card header background colour.</span>
          </div>

          <div className="dsw-form-field">
            <label className="dsw-form-label" htmlFor="dsw-metadata-accent-colour">
              <Palette size={14} />
              Accent Colour
            </label>
            <input
              id="dsw-metadata-accent-colour"
              type="color"
              className="dsw-form-colour"
              value={accentColour}
              onChange={(e) => updateField("accentColour", e.target.value)}
              data-testid="dsw-metadata-accent-colour"
            />
            <span className="dsw-form-hint">Card banner and accent colour.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
