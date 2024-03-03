import { Col } from "antd";
import { COLOURS } from "../../Helpers/printcolours.js";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";

export const Warhammer40K10eCardDisplay = ({
  type,
  card,
  cardScaling,
  printPadding,
  side = "front",
  backgrounds = "standard",
}) => {
  const { activeCard } = useCardStorage();

  // if no background selected, use standard
  // this does assume standard will always exist but the alternative is duplicating the data?
  if (!(backgrounds in COLOURS)) {
    backgrounds = "standard";
  }

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard?.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard?.cardType === "DataCard" && <UnitCard unit={activeCard} side={side} />}
          </Col>
        </>
      )}
      {!type && card && card.cardType === "DataCard" && <UnitCard side={side} unit={card} />}
      {type === "print" && card && (
        <div className="data-40k-10e" style={{}}>
          {card?.cardType === "DataCard" && (
            <UnitCard
              unit={card}
              side={side}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "top",
                transform: `scale(${cardScaling / 100})`,
                height: `${714 * (cardScaling / 100)}px`,
                width: `${1077 * (cardScaling / 100)}px`,
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
          )}
          {card?.cardType === "stratagem" && (
            <StratagemCard
              stratagem={card}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "top",
                transform: `scale(${cardScaling / 100})`,
                height: `${460 * (cardScaling / 100)}px`,
                width: `${266 * (cardScaling / 100)}px`,
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
          )}
        </div>
      )}
      {type === "viewer" && (
        <div
          style={{
            transformOrigin: "0% 0%",
            transform: `scale(${cardScaling / 100})`,
          }}>
          {activeCard?.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
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
          {card?.cardType === "stratagem" && <StratagemCard stratagem={card} />}
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
