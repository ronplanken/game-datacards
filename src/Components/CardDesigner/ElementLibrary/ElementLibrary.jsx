import React from "react";
import "./ElementLibrary.css";
import { ELEMENT_TYPES, DEFAULT_ELEMENTS } from "../../../Utilities/CardDesigner/constants";

function ElementLibrary({ onAddElement }) {
  const elements = [
    {
      type: ELEMENT_TYPES.TEXT,
      icon: "T",
      label: "Text",
      description: "Static text field",
    },
    {
      type: ELEMENT_TYPES.SHAPE,
      icon: "□",
      label: "Shape",
      description: "Rectangle or circle",
    },
    {
      type: ELEMENT_TYPES.DATA_TEXT,
      icon: "{ }",
      label: "Data Text",
      description: "Data-bound text",
      disabled: true, // For Phase 2
    },
    {
      type: ELEMENT_TYPES.BADGE,
      icon: "◆",
      label: "Badge",
      description: "Icon badge",
      disabled: true, // For Phase 3
    },
    {
      type: ELEMENT_TYPES.IMAGE,
      icon: "🖼",
      label: "Image",
      description: "Image element",
      disabled: true, // For Phase 3
    },
    {
      type: ELEMENT_TYPES.TABLE,
      icon: "⊞",
      label: "Table",
      description: "Data table",
      disabled: true, // For Phase 3
    },
  ];

  const handleAddElement = (elementType) => {
    const defaultConfig = DEFAULT_ELEMENTS[elementType];
    if (!defaultConfig) return;

    const newElement = {
      ...defaultConfig,
      id: `element-${Date.now()}`,
      name: `${elementType} ${Date.now()}`,
      type: elementType,
      zIndex: 10, // New elements on top
      locked: false,
      visible: true,
    };

    onAddElement(newElement);
  };

  return (
    <div className="element-library">
      <div className="element-library-header">
        <h3 className="element-library-title">Elements</h3>
        <p className="element-library-subtitle">Click to add to canvas</p>
      </div>

      <div className="element-library-list">
        {elements.map((element) => (
          <button
            key={element.type}
            className={`element-library-item ${element.disabled ? "disabled" : ""}`}
            onClick={() => !element.disabled && handleAddElement(element.type)}
            disabled={element.disabled}
            title={element.description}
          >
            <div className="element-library-item-icon">{element.icon}</div>
            <div className="element-library-item-content">
              <div className="element-library-item-label">{element.label}</div>
              <div className="element-library-item-description">{element.description}</div>
              {element.disabled && (
                <div className="element-library-item-badge">Coming Soon</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="element-library-footer">
        <p className="element-library-help-text">
          💡 Tip: Click an element to add it to the center of the canvas. Drag elements to
          reposition them.
        </p>
      </div>
    </div>
  );
}

export default ElementLibrary;
