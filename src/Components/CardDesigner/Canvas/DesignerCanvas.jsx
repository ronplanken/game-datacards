import React, { useRef, useState } from "react";
import "./DesignerCanvas.css";
import { gridToPixels, calculateGridLines } from "../../../Utilities/CardDesigner/gridCalculator";
import { GRID_DISPLAY } from "../../../Utilities/CardDesigner/constants";

/**
 * DesignerCanvas - Main canvas component
 *
 * NOTE: This is a temporary DOM-based implementation for initial development.
 * Once react-konva is installed, this will be replaced with Konva Stage/Layer components.
 */
function DesignerCanvas({
  template,
  selectedElements,
  zoom,
  showGrid,
  onElementUpdate,
  onElementSelect,
  onDeselectAll,
}) {
  const canvasRef = useRef(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  const canvasWidth = template.canvas.width * zoom;
  const canvasHeight = template.canvas.height * zoom;

  const gridLines = calculateGridLines({
    ...template.canvas,
    CELL_WIDTH: (template.canvas.width / template.canvas.gridColumns) * zoom,
    CELL_HEIGHT: (template.canvas.height / template.canvas.gridRows) * zoom,
    GRID_COLUMNS: template.canvas.gridColumns,
    GRID_ROWS: template.canvas.gridRows,
  });

  const handleCanvasClick = (e) => {
    // Click on canvas background - deselect all
    if (e.target === canvasRef.current) {
      onDeselectAll();
    }
  };

  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    const multi = e.ctrlKey || e.metaKey;
    onElementSelect(elementId, multi);
  };

  const handleMouseDown = (e, element) => {
    e.stopPropagation();
    setDraggingElement(element);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.position.x,
      elementY: element.position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingElement || !dragStart) return;

    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;

    const cellWidth = template.canvas.width / template.canvas.gridColumns;
    const cellHeight = template.canvas.height / template.canvas.gridRows;

    // Calculate new position in pixels
    const newX = dragStart.elementX * cellWidth + dx;
    const newY = dragStart.elementY * cellHeight + dy;

    // Snap to grid
    const gridX = Math.round(newX / cellWidth);
    const gridY = Math.round(newY / cellHeight);

    // Constrain to bounds
    const maxX = template.canvas.gridColumns - draggingElement.position.width;
    const maxY = template.canvas.gridRows - draggingElement.position.height;
    const constrainedX = Math.max(0, Math.min(gridX, maxX));
    const constrainedY = Math.max(0, Math.min(gridY, maxY));

    onElementUpdate(draggingElement.id, {
      position: {
        ...draggingElement.position,
        x: constrainedX,
        y: constrainedY,
      },
    });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setDragStart(null);
  };

  // Attach mouse move/up handlers to window
  React.useEffect(() => {
    if (draggingElement) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingElement, dragStart]);

  const renderElement = (element) => {
    const pixelPos = gridToPixels(element.position, {
      ...template.canvas,
      CELL_WIDTH: template.canvas.width / template.canvas.gridColumns,
      CELL_HEIGHT: template.canvas.height / template.canvas.gridRows,
      GRID_COLUMNS: template.canvas.gridColumns,
      GRID_ROWS: template.canvas.gridRows,
    });

    const isSelected = selectedElements.includes(element.id);

    const commonStyle = {
      position: "absolute",
      left: `${pixelPos.x * zoom}px`,
      top: `${pixelPos.y * zoom}px`,
      width: `${pixelPos.width * zoom}px`,
      height: `${pixelPos.height * zoom}px`,
      opacity: element.style?.opacity || 1,
      transform: `rotate(${element.style?.rotation || 0}deg)`,
      cursor: "move",
      boxSizing: "border-box",
      border: isSelected ? `${GRID_DISPLAY.SELECTION_STROKE_WIDTH}px solid #0066ff` : "none",
      pointerEvents: element.locked ? "none" : "auto",
    };

    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            className="canvas-element canvas-element-text"
            style={{
              ...commonStyle,
              backgroundColor: element.style?.backgroundColor || "transparent",
              padding: element.style?.padding
                ? `${element.style.padding.top}px ${element.style.padding.right}px ${element.style.padding.bottom}px ${element.style.padding.left}px`
                : "4px",
              fontSize: `${(element.properties.fontSize || 16) * zoom}px`,
              fontFamily: element.properties.fontFamily || "Arial",
              fontWeight: element.properties.fontWeight || "normal",
              fontStyle: element.properties.fontStyle || "normal",
              color: element.properties.color || "#000000",
              textAlign: element.properties.textAlign || "left",
              lineHeight: element.properties.lineHeight || 1.2,
              display: "flex",
              alignItems:
                element.properties.verticalAlign === "top"
                  ? "flex-start"
                  : element.properties.verticalAlign === "bottom"
                  ? "flex-end"
                  : "center",
              whiteSpace: "pre-wrap",
              overflow: "hidden",
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {element.properties.content}
          </div>
        );

      case "shape":
        const shapeStyle = {
          ...commonStyle,
          backgroundColor: element.properties.fill || "#cccccc",
          border: `${element.properties.strokeWidth || 1}px solid ${
            element.properties.stroke || "#000000"
          }`,
          borderRadius: element.properties.shape === "circle" ? "50%" : "0",
        };

        return (
          <div
            key={element.id}
            className="canvas-element canvas-element-shape"
            style={shapeStyle}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          />
        );

      default:
        return (
          <div
            key={element.id}
            className="canvas-element"
            style={{
              ...commonStyle,
              backgroundColor: "#f0f0f0",
              border: "1px dashed #999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: `${12 * zoom}px`,
              color: "#999",
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {element.type}
          </div>
        );
    }
  };

  return (
    <div className="designer-canvas-container">
      <div
        ref={canvasRef}
        className="designer-canvas"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundColor: template.canvas.backgroundColor,
          position: "relative",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid overlay */}
        {showGrid && (
          <svg
            className="canvas-grid-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {/* Vertical lines */}
            {gridLines.vertical.map((x, i) => (
              <line
                key={`v-${i}`}
                x1={x * zoom}
                y1={0}
                x2={x * zoom}
                y2={canvasHeight}
                stroke={
                  i % GRID_DISPLAY.MAJOR_LINE_INTERVAL === 0
                    ? GRID_DISPLAY.MAJOR_LINE_COLOR
                    : GRID_DISPLAY.LINE_COLOR
                }
                strokeWidth={
                  i % GRID_DISPLAY.MAJOR_LINE_INTERVAL === 0
                    ? GRID_DISPLAY.MAJOR_LINE_WIDTH
                    : GRID_DISPLAY.LINE_WIDTH
                }
              />
            ))}

            {/* Horizontal lines */}
            {gridLines.horizontal.map((y, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={y * zoom}
                x2={canvasWidth}
                y2={y * zoom}
                stroke={
                  i % GRID_DISPLAY.MAJOR_LINE_INTERVAL === 0
                    ? GRID_DISPLAY.MAJOR_LINE_COLOR
                    : GRID_DISPLAY.LINE_COLOR
                }
                strokeWidth={
                  i % GRID_DISPLAY.MAJOR_LINE_INTERVAL === 0
                    ? GRID_DISPLAY.MAJOR_LINE_WIDTH
                    : GRID_DISPLAY.LINE_WIDTH
                }
              />
            ))}
          </svg>
        )}

        {/* Elements */}
        {template.elements
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .filter((el) => el.visible !== false)
          .map((element) => renderElement(element))}
      </div>
    </div>
  );
}

export default DesignerCanvas;
