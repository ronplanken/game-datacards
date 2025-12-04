import React, { useRef } from "react";
import { Row } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useAutoFitScale } from "../../Hooks/useAutoFitScale";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";

export const ViewerCardDisplay = ({ side = "front", type, containerRef }) => {
  const { activeCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();
  const { settings } = useSettingsStorage();

  const internalRef = useRef(null);
  const displayRef = containerRef || internalRef;

  // Determine card type for proper scaling
  const getCardType = () => {
    if (!activeCard) return "unit";
    if (activeCard.cardType === "stratagem") return "stratagem";
    if (activeCard.cardType === "enhancement") return "enhancement";
    if (activeCard.cardType === "rule") return "rule";
    if (settings.showCardsAsDoubleSided || activeCard.variant === "full") return "unitFull";
    return "unit";
  };

  // Use auto-fit hook
  const { autoScale } = useAutoFitScale(displayRef, getCardType(), settings.autoFitEnabled !== false);

  // Determine effective scale based on mode
  const effectiveScale = settings.autoFitEnabled !== false ? autoScale : (settings.zoom || 100) / 100;

  // Get faction colors
  const cardFaction = dataSource?.data?.find((faction) => faction.id === activeCard?.faction_id);

  // Render card based on source
  const renderCard = () => {
    if (!activeCard) return null;

    switch (activeCard.source) {
      case "40k-10e":
        return <Warhammer40K10eCardDisplay side={side} type={type} />;
      case "40k":
        return <Warhammer40KCardDisplay />;
      case "basic":
        return <Warhammer40KCardDisplay />;
      case "necromunda":
        return <NecromundaCardDisplay />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={displayRef}
      style={{
        height: "100%",
        display: "block",
        overflow: "auto",
        "--card-scaling-factor": effectiveScale,
        "--banner-colour": cardFaction?.colours?.banner,
        "--header-colour": cardFaction?.colours?.header,
      }}
      className={`data-${activeCard?.source}`}>
      <Row style={{ overflow: "hidden", justifyContent: "center" }}>{renderCard()}</Row>
    </div>
  );
};

// Hidden card display for image export/sharing
export const HiddenCardDisplay = React.forwardRef(function HiddenCardDisplay({ side = "front", type }, ref) {
  const { activeCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();

  const cardFaction = dataSource?.data?.find((faction) => faction.id === activeCard?.faction_id);

  const renderCard = () => {
    if (!activeCard) return null;

    switch (activeCard.source) {
      case "40k-10e":
        return <Warhammer40K10eCardDisplay side={side} type={type} />;
      case "40k":
        return <Warhammer40KCardDisplay />;
      case "basic":
        return <Warhammer40KCardDisplay />;
      case "necromunda":
        return <NecromundaCardDisplay />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      style={{
        display: "none",
        "--banner-colour": cardFaction?.colours?.banner,
        "--header-colour": cardFaction?.colours?.header,
        backgroundColor: "#d8d8da",
        zIndex: "-9999",
        position: "absolute",
        top: "0px",
        left: "0px",
      }}
      className={`data-${activeCard?.source}`}>
      <Row style={{ overflow: "hidden" }}>{renderCard()}</Row>
    </div>
  );
});
