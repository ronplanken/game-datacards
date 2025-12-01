import { Check, ArrowLeftRight, Plus, Save } from "lucide-react";
import { Button, Dropdown, Menu, message } from "antd";
import { Tooltip } from "../Tooltip/Tooltip";
import "./FloatingToolbar.css";

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

  // Build category menu items with sub-categories shown under their parents
  const buildCategoryMenuItems = () => {
    const items = [];
    const topLevelCategories = categories.filter((cat) => !cat.parentId);

    topLevelCategories.forEach((cat) => {
      items.push({
        key: cat.uuid,
        label: cat.name,
      });

      if (cat.type !== "list") {
        const subCategories = categories.filter((sub) => sub.parentId === cat.uuid);
        subCategories.forEach((sub) => {
          items.push({
            key: sub.uuid,
            label: <span style={{ paddingLeft: 12, opacity: 0.7 }}>└ {sub.name}</span>,
          });
        });
      }
    });

    return items;
  };

  const categoryMenu = (
    <Menu className="floating-toolbar-menu" onClick={(e) => onAddToCategory(e.key)} items={buildCategoryMenuItems()} />
  );

  // Build zoom menu
  const renderZoomOption = (value) => {
    const isSelected = !isAutoFit && currentZoom === value;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isSelected && <Check size={14} />}
        <span style={{ marginLeft: isSelected ? 0 : 22 }}>{value}%</span>
      </span>
    );
  };

  const zoomMenuItems = [
    {
      key: "auto",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAutoFit && <Check size={14} />}
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

  return (
    <div className="floating-toolbar">
      {is40k10e && (
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
          {/* Front/Back toggle */}
          {showFrontBackToggle && (
            <>
              <div className="toolbar-divider" />
              <Tooltip content={activeCard.print_side === "back" ? "Show front" : "Show back"}>
                <Button type="text" icon={<ArrowLeftRight size={14} />} onClick={handleToggleSide} />
              </Tooltip>
            </>
          )}
        </>
      )}
      {/* Add to category */}
      {!activeCard.isCustom && (
        <>
          {is40k10e && <div className="toolbar-divider" />}
          <Tooltip content="Add card to category">
            <span>
              <Dropdown overlay={categoryMenu} trigger={["click"]}>
                <Button type="text" icon={<Plus size={14} />} />
              </Dropdown>
            </span>
          </Tooltip>
        </>
      )}
      {/* Save button */}
      {activeCard.isCustom && cardUpdated && (
        <>
          <div className="toolbar-divider" />
          <Tooltip content="Save card">
            <Button type="text" icon={<Save size={14} />} onClick={handleSave} />
          </Tooltip>
        </>
      )}
    </div>
  );
};
