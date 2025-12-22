import { Check, ArrowLeftRight, Share2, Link, Image } from "lucide-react";
import { Button, Dropdown, Menu } from "antd";
import { Tooltip } from "../Tooltip/Tooltip";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import "../Toolbar/FloatingToolbar.css";

export const ViewerFloatingToolbar = ({ side, setSide, onShareLink, onShareFullCard, onShareMobileCard }) => {
  const { activeCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  if (!activeCard) return null;

  const currentZoom = settings.zoom || 100;
  const isAutoFit = settings.autoFitEnabled !== false;

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

  const handleZoomChange = (key) => {
    if (key === "auto") {
      updateSettings({ ...settings, autoFitEnabled: true });
    } else {
      updateSettings({ ...settings, autoFitEnabled: false, zoom: parseInt(key) });
    }
  };

  const zoomMenu = (
    <Menu className="floating-toolbar-menu" onClick={(e) => handleZoomChange(e.key)} items={zoomMenuItems} />
  );

  // Build share menu
  const shareMenuItems = [
    {
      key: "link",
      icon: <Link size={16} />,
      label: "Copy link",
    },
    {
      key: "fullCard",
      icon: <Image size={16} />,
      label: "Full card image",
    },
    {
      key: "mobileCard",
      icon: <Image size={16} />,
      label: "Mobile card image",
    },
  ];

  const handleShare = (key) => {
    switch (key) {
      case "link":
        onShareLink?.();
        break;
      case "fullCard":
        onShareFullCard?.();
        break;
      case "mobileCard":
        onShareMobileCard?.();
        break;
    }
  };

  const shareMenu = (
    <Menu className="floating-toolbar-menu" onClick={(e) => handleShare(e.key)} items={shareMenuItems} />
  );

  // Handle front/back toggle
  const handleToggleSide = () => {
    setSide?.((current) => (current === "front" ? "back" : "front"));
  };

  const is40k10e = activeCard?.source === "40k-10e";
  const showFrontBackToggle =
    is40k10e &&
    settings.showCardsAsDoubleSided !== true &&
    activeCard?.variant !== "full" &&
    activeCard?.cardType === "DataCard";

  const showZoom = is40k10e;
  const showShare = onShareLink || onShareFullCard || onShareMobileCard;

  // Count visible button groups
  const visibleGroupCount = [showZoom, showFrontBackToggle, showShare].filter(Boolean).length;

  if (visibleGroupCount === 0) return null;

  const needsDividerBefore = (previousGroupsVisible) => visibleGroupCount > 1 && previousGroupsVisible;

  return (
    <div className="floating-toolbar">
      {showZoom && (
        <Tooltip content="Zoom level">
          <span>
            <Dropdown overlay={zoomMenu} trigger={["click"]}>
              <Button type="text" className="zoom-button">
                {isAutoFit ? "Auto" : `${currentZoom}%`}
              </Button>
            </Dropdown>
          </span>
        </Tooltip>
      )}

      {showFrontBackToggle && (
        <>
          {needsDividerBefore(showZoom) && <div className="toolbar-divider" />}
          <Tooltip content={side === "back" ? "Show front" : "Show back"}>
            <Button type="text" icon={<ArrowLeftRight size={19} />} onClick={handleToggleSide} />
          </Tooltip>
        </>
      )}

      {showShare && (
        <>
          {needsDividerBefore(showZoom || showFrontBackToggle) && <div className="toolbar-divider" />}
          <Tooltip content="Share">
            <span>
              <Dropdown overlay={shareMenu} trigger={["click"]}>
                <Button type="text" icon={<Share2 size={19} />} />
              </Dropdown>
            </span>
          </Tooltip>
        </>
      )}
    </div>
  );
};
