import { useRef } from "react";
import { Row } from "antd";
import { FloatingToolbar } from "../Toolbar/FloatingToolbar";
import { AgeOfSigmarCardDisplay } from "../AgeOfSigmar/CardDisplay";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";
import { CustomCardDisplay } from "../Custom/CustomCardDisplay";
import { useAutoFitScale } from "../../Hooks/useAutoFitScale";

/**
 * The card-display view for the middle panel. Owns the auto-fit scaling and
 * faction theming that only matter when a card is shown. Renders an empty,
 * themed container when no card is active (same behaviour as before the
 * middle-panel refactor).
 */
export const CardView = ({
  activeCard,
  settings,
  updateSettings,
  cardUpdated,
  cardStorage,
  updateActiveCard,
  saveActiveCard,
  isCustomDatasource,
  dataSource,
  onAddToCategory,
}) => {
  const cardContainerRef = useRef(null);

  // Determine card type for proper scaling
  const getCardType = () => {
    if (!activeCard) return "unit";
    if (activeCard.cardType === "stratagem") return "stratagem";
    if (activeCard.cardType === "enhancement") return "enhancement";
    if (activeCard.cardType === "rule") return "rule";
    if (activeCard.cardType === "warscroll") return "warscroll";
    if (activeCard.cardType === "spell") return "spell";
    if (settings.showCardsAsDoubleSided || activeCard.variant === "full") return "unitFull";
    return "unit";
  };

  const { autoScale } = useAutoFitScale(cardContainerRef, getCardType(), settings.autoFitEnabled !== false);

  const effectiveScale = settings.autoFitEnabled !== false ? autoScale : (settings.zoom || 100) / 100;
  const currentZoom = settings.zoom || 100;
  const isAutoFit = settings.autoFitEnabled !== false;

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);

  return (
    <div
      ref={cardContainerRef}
      style={{
        height: "calc(100vh - 64px)",
        overflow: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        "--card-scaling-factor": effectiveScale,
        "--banner-colour": activeCard?.useCustomColours ? activeCard.customBannerColour : cardFaction?.colours?.banner,
        "--header-colour": activeCard?.useCustomColours ? activeCard.customHeaderColour : cardFaction?.colours?.header,
      }}
      className={`${isCustomDatasource || activeCard?.source === "starcraft-tmg" ? "data-custom" : `data-${activeCard?.source}`}`}>
      <Row style={{ overflow: "hidden", justifyContent: "center", flex: "1 0 auto" }}>
        {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
        {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={activeCard.print_side || "front"} />}
        {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
        {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
        {activeCard?.source === "aos" && <AgeOfSigmarCardDisplay />}
        {activeCard?.source === "starcraft-tmg" && <CustomCardDisplay />}
        {activeCard?.source?.startsWith("custom-") && <CustomCardDisplay />}
      </Row>
      <FloatingToolbar
        activeCard={activeCard}
        settings={settings}
        cardUpdated={cardUpdated}
        currentZoom={currentZoom}
        isAutoFit={isAutoFit}
        categories={cardStorage.categories}
        updateActiveCard={updateActiveCard}
        saveActiveCard={saveActiveCard}
        onZoomChange={(zoom) => updateSettings({ ...settings, autoFitEnabled: false, zoom })}
        onAutoFitToggle={() => updateSettings({ ...settings, autoFitEnabled: true })}
        onAddToCategory={onAddToCategory}
      />
    </div>
  );
};
