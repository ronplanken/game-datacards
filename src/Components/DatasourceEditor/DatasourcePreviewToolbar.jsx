import { Check, ZoomIn, ZoomOut } from "lucide-react";
import { Dropdown, Menu } from "antd";
import "../Toolbar/FloatingToolbar.css";

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

export const DatasourcePreviewToolbar = ({ currentZoom, isAutoFit, onZoomChange, onAutoFitToggle }) => {
  const renderZoomOption = (value) => {
    const isSelected = !isAutoFit && currentZoom === value;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isSelected && <Check size={18} />}
        <span style={{ marginLeft: isSelected ? 0 : 22 }}>{value}%</span>
      </span>
    );
  };

  const zoomMenuItems = [
    {
      key: "auto",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAutoFit && <Check size={18} />}
          <span style={{ marginLeft: isAutoFit ? 0 : 22 }}>Auto</span>
        </span>
      ),
    },
    { type: "divider" },
    { key: "200", label: renderZoomOption(200) },
    { key: "150", label: renderZoomOption(150) },
    { key: "125", label: renderZoomOption(125) },
    { key: "100", label: renderZoomOption(100) },
    { key: "75", label: renderZoomOption(75) },
    { key: "50", label: renderZoomOption(50) },
    { key: "25", label: renderZoomOption(25) },
  ];

  const zoomMenu = (
    <Menu
      className="floating-toolbar-menu"
      onClick={(e) => {
        if (e.key === "auto") {
          onAutoFitToggle();
        } else {
          onZoomChange(parseInt(e.key));
        }
      }}
      items={zoomMenuItems}
    />
  );

  const handleZoomIn = () => {
    const nextLevel = ZOOM_LEVELS.find((level) => level > currentZoom);
    if (nextLevel) onZoomChange(nextLevel);
  };

  const handleZoomOut = () => {
    const prevLevel = [...ZOOM_LEVELS].reverse().find((level) => level < currentZoom);
    if (prevLevel) onZoomChange(prevLevel);
  };

  return (
    <div className="floating-toolbar">
      <div className="zoom-control">
        <button
          className="zoom-btn"
          onClick={handleZoomOut}
          disabled={isAutoFit || currentZoom <= 25}
          aria-label="Zoom out">
          <ZoomOut size={14} />
        </button>
        <Dropdown overlay={zoomMenu} trigger={["click"]}>
          <button className="zoom-value">{isAutoFit ? "Auto" : `${currentZoom}%`}</button>
        </Dropdown>
        <button className="zoom-btn" onClick={handleZoomIn} disabled={currentZoom >= 200} aria-label="Zoom in">
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
};
