import React from "react";
import "./DesignerToolbar.css";
import { ZOOM_LEVELS } from "../../../Utilities/CardDesigner/constants";

function DesignerToolbar({
  zoom,
  showGrid,
  onZoomChange,
  onToggleGrid,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  return (
    <div className="designer-toolbar">
      <div className="designer-toolbar-section">
        <button className="toolbar-button toolbar-back" onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className="designer-toolbar-title">Card Designer</h1>
      </div>

      <div className="designer-toolbar-section designer-toolbar-controls">
        {/* Undo/Redo */}
        <div className="toolbar-group">
          <button
            className="toolbar-button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="toolbar-button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>

        {/* Zoom */}
        <div className="toolbar-group">
          <label className="toolbar-label">Zoom:</label>
          <select
            className="toolbar-select"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
        </div>

        {/* Grid Toggle */}
        <div className="toolbar-group">
          <label className="toolbar-checkbox-label">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={onToggleGrid}
              className="toolbar-checkbox"
            />
            Show Grid
          </label>
        </div>
      </div>

      <div className="designer-toolbar-section">
        <button className="toolbar-button toolbar-button-primary">Save</button>
        <button className="toolbar-button">Export</button>
        <button className="toolbar-button">Preview</button>
      </div>
    </div>
  );
}

export default DesignerToolbar;
