import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { WarscrollCard } from "./WarscrollCard";

export const AgeOfSigmarCardDisplay = ({
  type,
  card,
  cardScaling,
  printPadding,
  side = "front",
  backgrounds = "standard",
}) => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const { dataSource } = useDataSourceStorage();

  const displayCard = card || activeCard;
  const cardFaction = dataSource.data.find((faction) => faction.id === displayCard?.faction_id);

  // Get Grand Alliance for theming
  const grandAlliance = cardFaction?.grandAlliance?.toLowerCase() || "order";

  // Get colors - use custom colors if enabled, otherwise faction colors
  const headerColour = displayCard?.useCustomColours
    ? displayCard.customHeaderColour || cardFaction?.colours?.header
    : cardFaction?.colours?.header;
  const bannerColour = displayCard?.useCustomColours
    ? displayCard.customBannerColour || cardFaction?.colours?.banner
    : cardFaction?.colours?.banner;

  return (
    <>
      {!type && activeCard && (
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          {activeCard?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={activeCard}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
            />
          )}
        </Col>
      )}
      {!type && card && card.cardType === "warscroll" && (
        <WarscrollCard
          warscroll={card}
          faction={cardFaction}
          grandAlliance={grandAlliance}
          headerColour={headerColour}
          bannerColour={bannerColour}
        />
      )}
      {type === "print" && card && card?.cardType === "warscroll" && (
        <div
          className={`data-aos ${grandAlliance}`}
          style={{
            position: "relative",
            overflow: "hidden",
            "--card-scaling-factor": cardScaling / 100,
            "--header-colour": headerColour,
            "--banner-colour": bannerColour,
          }}>
          <WarscrollCard
            warscroll={card}
            faction={cardFaction}
            grandAlliance={grandAlliance}
            headerColour={headerColour}
            bannerColour={bannerColour}
            isPrint={true}
          />
        </div>
      )}
      {type === "viewer" && (
        <div
          style={{
            transformOrigin: "0% 0%",
            transform: `scale(${cardScaling / 100})`,
          }}>
          {activeCard?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={activeCard}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
            />
          )}
          {card?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={card}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
            />
          )}
        </div>
      )}
    </>
  );
};
