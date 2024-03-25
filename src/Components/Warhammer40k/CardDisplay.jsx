import { Col } from "antd";
import sizes from "../../Helpers/sizes.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { PsychicCard } from "./PsychicCard";
import { SecondaryCard } from "./SecondaryCard";
import { BattleRuleCard } from "./BattleRuleCard";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";

export const Warhammer40KCardDisplay = ({ type, card, cardScaling = 100, printPadding = 0 }) => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();

  if (sizes[card?.variant || "card"]?.widthInPixels > window.innerWidth) {
    cardScaling = (window.innerWidth / sizes[card?.variant || "card"]?.widthInPixels) * 100;
  }

  let resizedStyle = {
    height: `calc(${sizes[card?.variant || "card"]?.height || 1} * ${cardScaling / 100} )`,
    width: `calc(${sizes[card?.variant || "card"]?.width || 1} * ${cardScaling / 100} )`,
  };

  if (settings.legacyPrinting) {
    resizedStyle = {};
  }

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard.cardType === "datasheet" && <UnitCard unit={activeCard} />}
            {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard.cardType === "secondary" && <SecondaryCard secondary={activeCard} />}
            {activeCard.cardType === "psychic" && <PsychicCard power={activeCard} />}
            {activeCard.cardType === "battle_rule" && <BattleRuleCard battle_rule={activeCard} />}
          </Col>
        </>
      )}
      {type === "print" && card && (
        <div className="data-40k">
          {card.cardType === "datasheet" && (
            <UnitCard
              unit={card}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                ...resizedStyle,
              }}
            />
          )}
          {card.cardType === "stratagem" && (
            <StratagemCard
              stratagem={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
                ...resizedStyle,
              }}
            />
          )}
          {card.cardType === "secondary" && (
            <SecondaryCard
              secondary={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
                ...resizedStyle,
              }}
            />
          )}
          {card.cardType === "psychic" && (
            <PsychicCard
              power={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
                ...resizedStyle,
              }}
            />
          )}
          {card.cardType === "battle_rule" && (
            <BattleRuleCard
              battle_rule={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
                ...resizedStyle,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
