import { Col } from "antd";
import { COLOURS } from "../../Helpers/printcolours.js";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage.jsx";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage.jsx";
import { EnhancementCard } from "./EnhancementCard.jsx";

export const Warhammer40K10eCardDisplay = ({
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

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

  // if no background selected, use standard
  // this does assume standard will always exist but the alternative is duplicating the data?
  if (!(backgrounds in COLOURS)) {
    backgrounds = "standard";
  }

  if (backgrounds === "standard" || backgrounds === "colourprint" || backgrounds === "light") {
    COLOURS[backgrounds].headerColour = cardFaction?.colours?.header;
    COLOURS[backgrounds].bannerColour = cardFaction?.colours?.banner;
  }
  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard?.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard?.cardType === "enhancement" && <EnhancementCard enhancement={activeCard} />}
            {activeCard?.cardType === "DataCard" && <UnitCard unit={activeCard} side={side} />}
          </Col>
        </>
      )}
      {!type && card && card.cardType === "DataCard" && <UnitCard side={side} unit={card} />}
      {!type && card && card.cardType === "enhancement" && <EnhancementCard enhancement={card} />}
      {!type && card && card.cardType === "stratagem" && <StratagemCard stratagem={card} />}
      {type === "print" && card && card?.cardType === "DataCard" && (
        <div
          className="data-40k-10e"
          style={
            settings.showCardsAsDoubleSided === true || card.variant === "full"
              ? {
                  // Full cards: use zoom for layout-affecting scaling
                  zoom: cardScaling / 100,
                  "--card-scaling-factor": 1, // Disable CSS transform scaling
                }
              : {
                  // Single-sided cards: use absolute positioning with transform
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
            }}
          />
        </div>
      )}
      {type === "print" && card && card?.cardType === "stratagem" && (
        <div
          className="data-40k-10e"
          style={{
            position: "relative",
            height: `${460 * (cardScaling / 100)}px`,
            width: `${266 * (cardScaling / 100)}px`,
            overflow: "hidden",
            "--card-scaling-factor": cardScaling / 100,
          }}>
          <StratagemCard
            stratagem={card}
            paddingTop="0px"
            cardStyle={{
              position: "absolute",
              top: 0,
              left: 0,
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
            }}
          />
        </div>
      )}
      {type === "print" && card && card?.cardType === "enhancement" && (
        <div
          className="data-40k-10e"
          style={{
            position: "relative",
            height: `${460 * (cardScaling / 100)}px`,
            width: `${266 * (cardScaling / 100)}px`,
            overflow: "hidden",
            "--card-scaling-factor": cardScaling / 100,
          }}>
          <EnhancementCard
            enhancement={card}
            paddingTop="0px"
            cardStyle={{
              position: "absolute",
              top: 0,
              left: 0,
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
            }}
          />
        </div>
      )}
      {type === "viewer" && (
        <div
          style={{
            transformOrigin: "0% 0%",
            transform: `scale(${cardScaling / 100})`,
          }}>
          {activeCard?.cardType === "DataCard" && (
            <UnitCard
              side={side}
              unit={activeCard}
              className={"viewer"}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
              }}
            />
          )}
          {card?.cardType === "stratagem" && (
            <div className="data-40k-10e" style={{}}>
              <StratagemCard stratagem={card} className={"shared-stratagem"} cardStyle={{ width: "100%" }} />
            </div>
          )}
          {card?.cardType === "enhancement" && (
            <div className="data-40k-10e" style={{}}>
              <EnhancementCard enhancement={card} className={"shared-enhancement"} cardStyle={{ width: "100%" }} />
            </div>
          )}
          {card?.cardType === "DataCard" && (
            <UnitCard
              side={side}
              unit={card}
              className={"viewer"}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
