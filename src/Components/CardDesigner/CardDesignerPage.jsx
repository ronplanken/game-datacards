import React, { useState, useReducer, useEffect } from "react";
import "./CardDesignerPage.css";
import { DEMO_TEMPLATE } from "../../Utilities/CardDesigner/demoTemplate";
import DesignerCanvas from "./Canvas/DesignerCanvas";
import ElementLibrary from "./ElementLibrary/ElementLibrary";
import PropertiesPanel from "./PropertiesPanel/PropertiesPanel";
import DesignerToolbar from "./Toolbar/DesignerToolbar";

// Initial state
const initialState = {
  template: DEMO_TEMPLATE,
  selectedElements: [],
  clipboard: [],
  history: [],
  historyIndex: -1,
  zoom: 1,
  showGrid: true,
};

// Reducer for managing designer state
function designerReducer(state, action) {
  switch (action.type) {
    case "LOAD_TEMPLATE":
      return {
        ...state,
        template: action.template,
        selectedElements: [],
        history: [],
        historyIndex: -1,
      };

    case "ADD_ELEMENT":
      const newElement = {
        ...action.element,
        id: action.element.id || `element-${Date.now()}`,
      };
      return {
        ...state,
        template: {
          ...state.template,
          elements: [...state.template.elements, newElement],
        },
        selectedElements: [newElement.id],
        history: [...state.history.slice(0, state.historyIndex + 1), state.template],
        historyIndex: state.historyIndex + 1,
      };

    case "UPDATE_ELEMENT":
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.map((el) => (el.id === action.id ? { ...el, ...action.updates } : el)),
        },
        history: [...state.history.slice(0, state.historyIndex + 1), state.template],
        historyIndex: state.historyIndex + 1,
      };

    case "DELETE_ELEMENT":
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.filter((el) => el.id !== action.id),
        },
        selectedElements: state.selectedElements.filter((id) => id !== action.id),
        history: [...state.history.slice(0, state.historyIndex + 1), state.template],
        historyIndex: state.historyIndex + 1,
      };

    case "SELECT_ELEMENT":
      return {
        ...state,
        selectedElements: action.multi ? [...state.selectedElements, action.id] : [action.id],
      };

    case "DESELECT_ALL":
      return {
        ...state,
        selectedElements: [],
      };

    case "SET_ZOOM":
      return {
        ...state,
        zoom: action.zoom,
      };

    case "TOGGLE_GRID":
      return {
        ...state,
        showGrid: !state.showGrid,
      };

    case "UNDO":
      if (state.historyIndex > 0) {
        return {
          ...state,
          template: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;

    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          template: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;

    default:
      return state;
  }
}

function CardDesignerPage() {
  const [state, dispatch] = useReducer(designerReducer, initialState);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("cardDesignerTemplate", JSON.stringify(state.template));
      localStorage.setItem("cardDesignerState", JSON.stringify({ zoom: state.zoom, showGrid: state.showGrid }));
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [state.template, state.zoom, state.showGrid]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem("cardDesignerTemplate");
    const savedState = localStorage.getItem("cardDesignerState");

    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        dispatch({ type: "LOAD_TEMPLATE", template });
      } catch (e) {
        console.error("Failed to load saved template:", e);
      }
    }

    if (savedState) {
      try {
        const { zoom, showGrid } = JSON.parse(savedState);
        if (zoom) dispatch({ type: "SET_ZOOM", zoom });
        if (typeof showGrid === "boolean") dispatch({ type: "TOGGLE_GRID" });
      } catch (e) {
        console.error("Failed to load saved state:", e);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      // Delete
      if ((key === "Delete" || key === "Backspace") && state.selectedElements.length > 0) {
        e.preventDefault();
        state.selectedElements.forEach((id) => {
          dispatch({ type: "DELETE_ELEMENT", id });
        });
      }

      // Undo
      if (ctrl && key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }

      // Redo
      if (ctrl && (key === "y" || (key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }

      // Deselect all (Escape)
      if (key === "Escape") {
        dispatch({ type: "DESELECT_ALL" });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedElements]);

  const handleAddElement = (element) => {
    dispatch({ type: "ADD_ELEMENT", element });
  };

  const handleUpdateElement = (id, updates) => {
    dispatch({ type: "UPDATE_ELEMENT", id, updates });
  };

  const handleSelectElement = (id, multi = false) => {
    dispatch({ type: "SELECT_ELEMENT", id, multi });
  };

  const handleDeselectAll = () => {
    dispatch({ type: "DESELECT_ALL" });
  };

  const selectedElement =
    state.selectedElements.length === 1
      ? state.template.elements.find((el) => el.id === state.selectedElements[0])
      : null;

  return (
    <div className="card-designer-page">
      <DesignerToolbar
        zoom={state.zoom}
        showGrid={state.showGrid}
        onZoomChange={(zoom) => dispatch({ type: "SET_ZOOM", zoom })}
        onToggleGrid={() => dispatch({ type: "TOGGLE_GRID" })}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
      />

      <div className="card-designer-layout">
        <div className="card-designer-sidebar card-designer-sidebar-left">
          <ElementLibrary onAddElement={handleAddElement} />
        </div>

        <div className="card-designer-canvas-wrapper">
          <DesignerCanvas
            template={state.template}
            selectedElements={state.selectedElements}
            zoom={state.zoom}
            showGrid={state.showGrid}
            onElementUpdate={handleUpdateElement}
            onElementSelect={handleSelectElement}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        <div className="card-designer-sidebar card-designer-sidebar-right">
          <PropertiesPanel element={selectedElement} onUpdate={handleUpdateElement} />
        </div>
      </div>
    </div>
  );
}

export default CardDesignerPage;
