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
            <div
              className={`data-aos ${grandAlliance}`}
              style={{
                ...(displayCard?.useCustomColours && {
                  "--bg-header": headerColour,
                  "--banner-colour": bannerColour,
                }),
              }}>
              <WarscrollCard
                warscroll={activeCard}
                faction={cardFaction}
                grandAlliance={grandAlliance}
                headerColour={headerColour}
                bannerColour={bannerColour}
              />
            </div>
          )}
        </Col>
      )}
      {!type && card && card.cardType === "warscroll" && (
        <div
          className={`data-aos ${grandAlliance}`}
          style={{
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
          }}>
          <WarscrollCard
            warscroll={card}
            faction={cardFaction}
            grandAlliance={grandAlliance}
            headerColour={headerColour}
            bannerColour={bannerColour}
          />
        </div>
      )}
      {type === "print" && card && card?.cardType === "warscroll" && (
        <div
          className={`data-aos ${grandAlliance}`}
          style={{
            zoom: cardScaling / 100,
            "--card-scaling-factor": 1,
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
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
          className={`data-aos ${grandAlliance} aos-mobile-wrapper`}
          style={{
            transformOrigin: "0% 0%",
            ...(cardScaling && { transform: `scale(${cardScaling / 100})` }),
            ...(displayCard?.useCustomColours && {
              "--bg-header": headerColour,
              "--banner-colour": bannerColour,
            }),
          }}>
          {activeCard?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={activeCard}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
              isMobile={true}
            />
          )}
          {card?.cardType === "warscroll" && (
            <WarscrollCard
              warscroll={card}
              faction={cardFaction}
              grandAlliance={grandAlliance}
              headerColour={headerColour}
              bannerColour={bannerColour}
              isMobile={true}
            />
          )}
        </div>
      )}
    </>
  );
};
