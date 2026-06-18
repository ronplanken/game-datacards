import { Col } from "antd";
import { COLOURS } from "../../Helpers/printcolours.js";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage.jsx";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage.jsx";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { EnhancementCard } from "./EnhancementCard.jsx";
import { RuleCard } from "./RuleCard.jsx";

// Display component for Warhammer 40K 11th edition cards. Mirrors the 10e
// CardDisplay layout (same look & feel / COLOURS handling) but routes to the
// dedicated 11e renderset and emits a `data-40k-11e` style scope.
export const Warhammer40K11eCardDisplay = ({
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

  if (!(backgrounds in COLOURS)) {
    backgrounds = "standard";
  }

  if (backgrounds === "standard" || backgrounds === "colourprint" || backgrounds === "light") {
    if (displayCard?.useCustomColours) {
      COLOURS[backgrounds].headerColour = displayCard.customHeaderColour || cardFaction?.colours?.header;
      COLOURS[backgrounds].bannerColour = displayCard.customBannerColour || cardFaction?.colours?.banner;
    } else {
      COLOURS[backgrounds].headerColour = cardFaction?.colours?.header;
      COLOURS[backgrounds].bannerColour = cardFaction?.colours?.banner;
    }
  }

  const printCardStyle = {
    gap: printPadding,
    "--background-colour": COLOURS[backgrounds].titleBackgroundColour,
    "--title-text-colour": COLOURS[backgrounds].titleTextColour,
    "--faction-text-colour": COLOURS[backgrounds].factionTextColour,
    "--header-colour": COLOURS[backgrounds].headerColour,
    "--header-text-colour": COLOURS[backgrounds].headerTextColour,
    "--stat-text-colour": COLOURS[backgrounds].statTextColour,
    "--stat-title-colour": COLOURS[backgrounds].statTitleColour,
    "--banner-colour": COLOURS[backgrounds].bannerColour,
    "--text-background-colour": COLOURS[backgrounds].textBackgroundColour,
    "--rows-colour": COLOURS[backgrounds].rowsColour,
    "--alt-rows-colour": COLOURS[backgrounds].altRowsColour,
    "--keywords-background-colour": COLOURS[backgrounds].keywordsBackgroundColour,
    "--weapon-keyword-colour": COLOURS[backgrounds].weaponKeywordColour,
    "--green-stratagem-colour": COLOURS[backgrounds].greenStratagemColour,
    "--blue-stratagem-colour": COLOURS[backgrounds].blueStratagemColour,
    "--red-stratagem-colour": COLOURS[backgrounds].redStratagemColour,
  };

  return (
    <>
      {!type && activeCard && (
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          {activeCard?.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
          {activeCard?.cardType === "enhancement" && <EnhancementCard enhancement={activeCard} />}
          {activeCard?.cardType === "DataCard" && <UnitCard unit={activeCard} side={side} />}
          {activeCard?.cardType === "rule" && <RuleCard rule={activeCard} />}
        </Col>
      )}
      {!type && card && card.cardType === "DataCard" && <UnitCard side={side} unit={card} />}
      {!type && card && card.cardType === "enhancement" && <EnhancementCard enhancement={card} />}
      {!type && card && card.cardType === "stratagem" && <StratagemCard stratagem={card} />}
      {!type && card && card.cardType === "rule" && <RuleCard rule={card} />}

      {type === "print" && card && card?.cardType === "DataCard" && (
        <div
          className="data-40k-11e"
          style={
            settings.showCardsAsDoubleSided === true || card.variant === "full"
              ? {
                  zoom: cardScaling / 100,
                  "--card-scaling-factor": 1,
                }
              : {
                  position: "relative",
                  height: `${714 * (cardScaling / 100)}px`,
                  width: `${1077 * (cardScaling / 100)}px`,
                  overflow: "hidden",
                  "--card-scaling-factor": cardScaling / 100,
                }
          }>
          <UnitCard
            unit={card}
            side={side}
            paddingTop="0px"
            cardStyle={{
              ...(settings.showCardsAsDoubleSided !== true && card.variant !== "full"
                ? { position: "absolute", top: 0, left: 0 }
                : {}),
              ...printCardStyle,
            }}
          />
        </div>
      )}
      {type === "print" && card && card?.cardType === "stratagem" && (
        <div className="data-40k-11e" style={{ zoom: cardScaling / 100, "--card-scaling-factor": 1 }}>
          <StratagemCard stratagem={card} paddingTop="0px" cardStyle={printCardStyle} />
        </div>
      )}
      {type === "print" && card && card?.cardType === "enhancement" && (
        <div className="data-40k-11e" style={{ zoom: cardScaling / 100, "--card-scaling-factor": 1 }}>
          <EnhancementCard enhancement={card} paddingTop="0px" cardStyle={printCardStyle} />
        </div>
      )}
      {type === "print" && card && card?.cardType === "rule" && (
        <div className="data-40k-11e" style={{ "--card-scaling-factor": cardScaling / 100 }}>
          <RuleCard
            rule={card}
            paddingTop="0px"
            cardStyle={{
              transform: `scale(${cardScaling / 100})`,
              transformOrigin: "top left",
              ...printCardStyle,
            }}
          />
        </div>
      )}

      {type === "viewer" && (
        <div
          style={{
            transformOrigin: "0% 0%",
            transform: `scale(${cardScaling / 100})`,
            width: "100%",
          }}>
          {activeCard?.cardType === "DataCard" && (
            <UnitCard
              side={side}
              unit={activeCard}
              className={"viewer"}
              paddingTop="0px"
              cardStyle={{ gap: printPadding }}
            />
          )}
          {activeCard?.cardType === "stratagem" && (
            <div className="data-40k-11e" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <StratagemCard
                stratagem={activeCard}
                className={"shared-stratagem"}
                paddingTop="0px"
                cardStyle={{ width: "100%" }}
              />
            </div>
          )}
          {activeCard?.cardType === "enhancement" && (
            <div className="data-40k-11e" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <EnhancementCard
                enhancement={activeCard}
                className={"shared-enhancement"}
                paddingTop="0px"
                cardStyle={{ width: "100%" }}
              />
            </div>
          )}
          {activeCard?.cardType === "rule" && (
            <div className="data-40k-11e" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <RuleCard rule={activeCard} className={"shared-rule"} paddingTop="0px" cardStyle={{ width: "100%" }} />
            </div>
          )}
          {card?.cardType === "DataCard" && (
            <UnitCard side={side} unit={card} className={"viewer"} paddingTop="0px" cardStyle={{ gap: printPadding }} />
          )}
        </div>
      )}
    </>
  );
};
