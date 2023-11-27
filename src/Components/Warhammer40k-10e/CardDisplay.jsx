import { Col } from "antd";
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

  // background colour of the main top banner (not the bit with the unit name on)
  var titleBackgroundColour;
  // text colour of the top title banner, also does the titles for stats (M, T, Sv, W, etc) and the points container
  var titleTextColour;
  // text colour in the faction keyword box
  var factionTextColour;
  // header background colour for weapons, abilities, invulns, etc. and borders of all containers
  var headerColour;
  // colour for header text and icons
  var headerTextColour;
  // colour of the stat text (M, T, Sv, W, etc) and invuln save text
  var statTextColour;
  // colour of the main banner containing the unit name and stat text
  var bannerColour;
  // background colour of the main text areas (not weapon rows)
  var textBackgroundColour;
  // background colour of the odd numbered rows for weapons
  var rowsColour;
  // background colour of the even numbered rows for weapons
  var altRowsColour;
  // background colour of the unit keywords box
  var keywordsBackgroundColour;
  // colour for the weapon keyword text like [assault] or [lethal hits]
  var weaponKeywordColour;

  if (backgrounds === "standard") {
    titleBackgroundColour = "black";
    titleTextColour = "white";
    factionTextColour = "white";
    headerColour = "#456664";
    headerTextColour = "white";
    statTextColour = "#456664";
    bannerColour = "#103344";
    textBackgroundColour = "#dfe0e2";
    rowsColour = "#d8d8da";
    altRowsColour = "#dee3e0";
    keywordsBackgroundColour = "#d8d8da";
    weaponKeywordColour = "#456664";
  } else if (backgrounds === "light") {
    titleBackgroundColour = "#dfe0e2";
    titleTextColour = "white";
    factionTextColour = "black";
    headerColour = "#456664";
    headerTextColour = "white";
    statTextColour = "#456664";
    bannerColour = "#103344";
    textBackgroundColour = "#dfe0e2";
    rowsColour = "#d8d8da";
    altRowsColour = "#dee3e0";
    keywordsBackgroundColour = "#d8d8da";
    weaponKeywordColour = "#456664";
  } else if (backgrounds === "greyscale") {
    titleBackgroundColour = "white";
    titleTextColour = "black";
    factionTextColour = "black";
    headerColour = "#cccccc";
    headerTextColour = "black";
    statTextColour = "black";
    bannerColour = "#cccccc";
    textBackgroundColour = "white";
    rowsColour = "white";
    altRowsColour = "#ededed";
    keywordsBackgroundColour = "white";
    weaponKeywordColour = "#4f4f4f";
  } else if (backgrounds === "debug") {
    titleBackgroundColour = "pink";
    titleTextColour = "teal";
    factionTextColour = "black";
    headerColour = "red";
    headerTextColour = "white";
    statTextColour = "aqua";
    bannerColour = "yellow";
    textBackgroundColour = "green";
    rowsColour = "orange";
    altRowsColour = "blue";
    keywordsBackgroundColour = "brown";
    weaponKeywordColour = "purple";
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
                "--background-colour": titleBackgroundColour,
                "--title-text-colour": titleTextColour,
                "--faction-text-colour": factionTextColour,
                "--header-colour": headerColour,
                "--header-text-colour": headerTextColour,
                "--stat-text-colour": statTextColour,
                "--banner-colour": bannerColour,
                "--text-background-colour": textBackgroundColour,
                "--rows-colour": rowsColour,
                "--alt-rows-colour": altRowsColour,
                "--keywords-background-colour": keywordsBackgroundColour,
                "--weapon-keyword-colour": weaponKeywordColour,
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
                "--background-colour": titleBackgroundColour,
                "--faction-text-colour": factionTextColour,
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
