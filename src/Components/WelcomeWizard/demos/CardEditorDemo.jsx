import React from "react";
import { Minus, Plus } from "lucide-react";

/**
 * Interactive card editor demo with live preview
 */
export const CardEditorDemo = ({ cardData, onUpdate }) => {
  const handleNameChange = (e) => {
    onUpdate("name", e.target.value);
  };

  const handleStatChange = (stat, delta) => {
    const newValue = Math.max(1, Math.min(12, cardData[stat] + delta));
    onUpdate(stat, newValue);
  };

  return (
    <div className="wz-editor">
      {/* Name field */}
      <div className="wz-editor-field">
        <label className="wz-editor-label">Unit Name</label>
        <input
          type="text"
          className="wz-editor-input"
          value={cardData.name}
          onChange={handleNameChange}
          placeholder="Enter unit name..."
        />
      </div>

      {/* Stats grid */}
      <div className="wz-editor-stats">
        <div className="wz-stat-control">
          <div className="wz-stat-label">Move</div>
          <div className="wz-stat-value">
            <button
              className="wz-stat-btn"
              onClick={() => handleStatChange("movement", -1)}
              aria-label="Decrease movement">
              <Minus size={12} />
            </button>
            <span className="wz-stat-number">{cardData.movement}&quot;</span>
            <button
              className="wz-stat-btn"
              onClick={() => handleStatChange("movement", 1)}
              aria-label="Increase movement">
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="wz-stat-control">
          <div className="wz-stat-label">Toughness</div>
          <div className="wz-stat-value">
            <button
              className="wz-stat-btn"
              onClick={() => handleStatChange("toughness", -1)}
              aria-label="Decrease toughness">
              <Minus size={12} />
            </button>
            <span className="wz-stat-number">{cardData.toughness}</span>
            <button
              className="wz-stat-btn"
              onClick={() => handleStatChange("toughness", 1)}
              aria-label="Increase toughness">
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="wz-stat-control">
          <div className="wz-stat-label">Wounds</div>
          <div className="wz-stat-value">
            <button className="wz-stat-btn" onClick={() => handleStatChange("wounds", -1)} aria-label="Decrease wounds">
              <Minus size={12} />
            </button>
            <span className="wz-stat-number">{cardData.wounds}</span>
            <button className="wz-stat-btn" onClick={() => handleStatChange("wounds", 1)} aria-label="Increase wounds">
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="wz-card-preview">
        <h4 className="wz-card-preview-title">{cardData.name || "Unit Name"}</h4>
        <div className="wz-card-preview-stats">
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">M</div>
            <div className="wz-card-preview-stat-value">{cardData.movement}&quot;</div>
          </div>
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">T</div>
            <div className="wz-card-preview-stat-value">{cardData.toughness}</div>
          </div>
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">SV</div>
            <div className="wz-card-preview-stat-value">{cardData.save}+</div>
          </div>
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">W</div>
            <div className="wz-card-preview-stat-value">{cardData.wounds}</div>
          </div>
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">LD</div>
            <div className="wz-card-preview-stat-value">{cardData.leadership}+</div>
          </div>
          <div className="wz-card-preview-stat">
            <div className="wz-card-preview-stat-label">OC</div>
            <div className="wz-card-preview-stat-value">{cardData.objectiveControl}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
