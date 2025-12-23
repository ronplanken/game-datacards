import { Check, ArrowLeftRight, Plus, Save } from "lucide-react";
import { Button, Dropdown, Menu, message } from "antd";
import { Tooltip } from "../Tooltip/Tooltip";
import "./FloatingToolbar.css";
import { buildCategoryMenuItems } from "../../util/menu-helper";
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
        {isSelected && <Check size={19} />}
        <span style={{ marginLeft: isSelected ? 0 : 22 }}>{value}%</span>
      </span>
    );
  };

  const zoomMenuItems = [
    {
      key: "auto",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAutoFit && <Check size={19} />}
          <span style={{ marginLeft: isAutoFit ? 0 : 22 }}>Auto</span>
        </span>
      ),
    },
    { type: "divider" },
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
    message.success("Card has been updated");
  };

  const is40k10e = activeCard?.source === "40k-10e";
  const showFrontBackToggle =
    is40k10e &&
    settings.showCardsAsDoubleSided !== true &&
    activeCard?.variant !== "full" &&
    activeCard?.cardType === "DataCard";

  // Determine which button groups are visible
  const showZoom = is40k10e;
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
        <>
          {/* Zoom dropdown */}
          <Tooltip content="Zoom level">
            <span>
              <Dropdown overlay={zoomMenu} trigger={["click"]}>
                <Button type="text" className="zoom-button">
                  {isAutoFit ? "Auto" : `${currentZoom}%`}
                </Button>
              </Dropdown>
            </span>
          </Tooltip>
        </>
      )}
      {/* Front/Back toggle */}
      {showFrontBackToggle && (
        <>
          {needsDividerBefore(showZoom) && <div className="toolbar-divider" />}
          <Tooltip content={activeCard.print_side === "back" ? "Show front" : "Show back"}>
            <Button type="text" icon={<ArrowLeftRight size={19} />} onClick={handleToggleSide} />
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
                <Button type="text" icon={<Plus size={19} />} />
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
            <Button type="text" icon={<Save size={19} />} onClick={handleSave} />
          </Tooltip>
        </>
      )}
    </div>
  );
};
