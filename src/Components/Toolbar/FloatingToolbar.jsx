import { Check, ArrowLeftRight, Save, ZoomIn, ZoomOut } from "lucide-react";
import { Button, Dropdown, Menu } from "antd";
import { message } from "../Toast/message";
import { Tooltip } from "../Tooltip/Tooltip";
import { AddCard } from "../../Icons/AddCard";
import "./FloatingToolbar.css";
import { buildCategoryMenuItems } from "../../util/menu-helper";

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

export const FloatingToolbar = ({
  activeCard,
  settings,
  cardUpdated,
  currentZoom,
  isAutoFit,
  categories,
  updateActiveCard,
  saveActiveCard,
  onZoomChange,
  onAutoFitToggle,
  onAddToCategory,
}) => {
  if (!activeCard) return null;

  const categoryMenu = (
    <Menu
      className="floating-toolbar-menu"
      onClick={(e) => onAddToCategory(e.key)}
      items={buildCategoryMenuItems(categories)}
    />
  );

  // Build zoom menu
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
    if (nextLevel) {
      onZoomChange(nextLevel);
    }
  };

  const handleZoomOut = () => {
    const prevLevel = [...ZOOM_LEVELS].reverse().find((level) => level < currentZoom);
    if (prevLevel) {
      onZoomChange(prevLevel);
    }
  };

  // Handle front/back toggle
  const handleToggleSide = () => {
    if (activeCard.print_side === "back") {
      updateActiveCard({ ...activeCard, print_side: "front" }, true);
    } else {
      updateActiveCard({ ...activeCard, print_side: "back" }, true);
    }
  };

  // Handle save
  const handleSave = () => {
    saveActiveCard();
    message.success("Card saved");
  };

  const is40k10e = activeCard?.source === "40k-10e";
  const isAos = activeCard?.source === "aos";
  const isCustomDs = activeCard?.source?.startsWith("custom-");
  const showFrontBackToggle =
    is40k10e &&
    settings.showCardsAsDoubleSided !== true &&
    activeCard?.variant !== "full" &&
    activeCard?.cardType === "DataCard";

  // Determine which button groups are visible
  const showZoom = is40k10e || isAos || isCustomDs;
  const showAddToCategory = !activeCard.isCustom;
  const showSave = activeCard.isCustom && cardUpdated;

  // Count visible button groups to determine if we need dividers
  const visibleGroupCount = [showZoom, showFrontBackToggle, showAddToCategory, showSave].filter(Boolean).length;

  // Hide toolbar if no buttons are visible
  if (visibleGroupCount === 0) return null;

  // Helper to determine if divider should show before a group
  // Only show divider if there are multiple groups AND there's a visible group before this one
  const needsDividerBefore = (previousGroupsVisible) => visibleGroupCount > 1 && previousGroupsVisible;

  return (
    <div className="floating-toolbar">
      {showZoom && (
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
      )}
      {/* Front/Back toggle */}
      {showFrontBackToggle && (
        <>
          {needsDividerBefore(showZoom) && <div className="toolbar-divider" />}
          <Tooltip content={activeCard.print_side === "back" ? "Show front" : "Show back"}>
            <Button type="text" icon={<ArrowLeftRight size={18} />} onClick={handleToggleSide} />
          </Tooltip>
        </>
      )}
      {/* Add to category */}
      {showAddToCategory && (
        <>
          {needsDividerBefore(showZoom || showFrontBackToggle) && <div className="toolbar-divider" />}
          <Tooltip content="Add card to category">
            <span>
              <Dropdown overlay={categoryMenu} trigger={["click"]}>
                <Button type="text" icon={<AddCard style={{ fontSize: 18 }} />} />
              </Dropdown>
            </span>
          </Tooltip>
        </>
      )}
      {/* Save button */}
      {showSave && (
        <>
          {needsDividerBefore(showZoom || showFrontBackToggle || showAddToCategory) && (
            <div className="toolbar-divider" />
          )}
          <Tooltip content="Save card">
            <Button type="text" icon={<Save size={18} />} onClick={handleSave} />
          </Tooltip>
        </>
      )}
    </div>
  );
};
