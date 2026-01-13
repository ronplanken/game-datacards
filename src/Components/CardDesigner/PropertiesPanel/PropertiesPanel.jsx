import React from "react";
import "./PropertiesPanel.css";
import { TEXT_ALIGN, VERTICAL_ALIGN, FONT_WEIGHTS, SHAPE_TYPES } from "../../../Utilities/CardDesigner/constants";

function PropertiesPanel({ element, onUpdate }) {
  if (!element) {
    return (
      <div className="properties-panel">
        <div className="properties-panel-empty">
          <p className="properties-panel-empty-text">
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (path, value) => {
    const pathParts = path.split(".");
    let updates = { ...element };
    let current = updates;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = { ...current[pathParts[i]] };
      current = current[pathParts[i]];
    }

    current[pathParts[pathParts.length - 1]] = value;
    onUpdate(element.id, updates);
  };

  const renderPositionProperties = () => (
    <div className="properties-section">
      <h4 className="properties-section-title">Position & Size</h4>
      <div className="properties-grid">
        <div className="properties-field">
          <label className="properties-label">X (Column)</label>
          <input
            type="number"
            className="properties-input"
            value={element.position.x}
            onChange={(e) => handleChange("position.x", parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Y (Row)</label>
          <input
            type="number"
            className="properties-input"
            value={element.position.y}
            onChange={(e) => handleChange("position.y", parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Width (Columns)</label>
          <input
            type="number"
            className="properties-input"
            value={element.position.width}
            onChange={(e) => handleChange("position.width", parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Height (Rows)</label>
          <input
            type="number"
            className="properties-input"
            value={element.position.height}
            onChange={(e) => handleChange("position.height", parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>
      </div>
    </div>
  );

  const renderTextProperties = () => (
    <div className="properties-section">
      <h4 className="properties-section-title">Text</h4>
      <div className="properties-field">
        <label className="properties-label">Content</label>
        <textarea
          className="properties-textarea"
          value={element.properties.content || ""}
          onChange={(e) => handleChange("properties.content", e.target.value)}
          rows={4}
        />
      </div>
      <div className="properties-grid">
        <div className="properties-field">
          <label className="properties-label">Font Size</label>
          <input
            type="number"
            className="properties-input"
            value={element.properties.fontSize || 16}
            onChange={(e) => handleChange("properties.fontSize", parseInt(e.target.value) || 16)}
            min={8}
            max={200}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Font Weight</label>
          <select
            className="properties-select"
            value={element.properties.fontWeight || "normal"}
            onChange={(e) => handleChange("properties.fontWeight", e.target.value)}
          >
            {Object.entries(FONT_WEIGHTS).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="properties-field">
          <label className="properties-label">Color</label>
          <input
            type="color"
            className="properties-color-input"
            value={element.properties.color || "#000000"}
            onChange={(e) => handleChange("properties.color", e.target.value)}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Align</label>
          <select
            className="properties-select"
            value={element.properties.textAlign || "left"}
            onChange={(e) => handleChange("properties.textAlign", e.target.value)}
          >
            {Object.entries(TEXT_ALIGN).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderShapeProperties = () => (
    <div className="properties-section">
      <h4 className="properties-section-title">Shape</h4>
      <div className="properties-field">
        <label className="properties-label">Shape Type</label>
        <select
          className="properties-select"
          value={element.properties.shape || "rectangle"}
          onChange={(e) => handleChange("properties.shape", e.target.value)}
        >
          {Object.entries(SHAPE_TYPES).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div className="properties-grid">
        <div className="properties-field">
          <label className="properties-label">Fill Color</label>
          <input
            type="color"
            className="properties-color-input"
            value={element.properties.fill || "#cccccc"}
            onChange={(e) => handleChange("properties.fill", e.target.value)}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Stroke Color</label>
          <input
            type="color"
            className="properties-color-input"
            value={element.properties.stroke || "#000000"}
            onChange={(e) => handleChange("properties.stroke", e.target.value)}
          />
        </div>
        <div className="properties-field">
          <label className="properties-label">Stroke Width</label>
          <input
            type="number"
            className="properties-input"
            value={element.properties.strokeWidth || 1}
            onChange={(e) => handleChange("properties.strokeWidth", parseInt(e.target.value) || 1)}
            min={0}
            max={20}
          />
        </div>
      </div>
    </div>
  );

  const renderStyleProperties = () => (
    <div className="properties-section">
      <h4 className="properties-section-title">Style</h4>
      <div className="properties-grid">
        <div className="properties-field">
          <label className="properties-label">Opacity</label>
          <input
            type="range"
            className="properties-range"
            value={(element.style?.opacity || 1) * 100}
            onChange={(e) => handleChange("style.opacity", parseFloat(e.target.value) / 100)}
            min={0}
            max={100}
          />
          <span className="properties-range-value">
            {Math.round((element.style?.opacity || 1) * 100)}%
          </span>
        </div>
        <div className="properties-field">
          <label className="properties-label">Rotation (deg)</label>
          <input
            type="number"
            className="properties-input"
            value={element.style?.rotation || 0}
            onChange={(e) => handleChange("style.rotation", parseInt(e.target.value) || 0)}
            min={-180}
            max={180}
          />
        </div>
        {element.type === "text" && (
          <div className="properties-field">
            <label className="properties-label">Background Color</label>
            <input
              type="color"
              className="properties-color-input"
              value={element.style?.backgroundColor || "#ffffff"}
              onChange={(e) => handleChange("style.backgroundColor", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="properties-panel">
      <div className="properties-panel-header">
        <h3 className="properties-panel-title">Properties</h3>
        <p className="properties-panel-subtitle">{element.name || element.type}</p>
      </div>

      <div className="properties-panel-content">
        {renderPositionProperties()}
        {element.type === "text" && renderTextProperties()}
        {element.type === "shape" && renderShapeProperties()}
        {renderStyleProperties()}
      </div>
    </div>
  );
}

export default PropertiesPanel;
