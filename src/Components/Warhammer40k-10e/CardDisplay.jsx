import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { BattleRuleCard } from "./BattleRuleCard";
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

  const backgroundColour = backgrounds === "standard" ? "black" : "#dfe0e2";
  const factionTextColour = backgrounds === "standard" ? "white" : "black";
  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard.cardType === "battle_rule" && <BattleRuleCard battle_rule={activeCard} />}
            {activeCard.cardType === "DataCard" && <UnitCard unit={activeCard} side={side} />}
          </Col>
        </>
      )}
      {!type && card && card.cardType === "DataCard" && <UnitCard side={side} unit={card} />}
      {type === "print" && card && (
        <div className="data-40k-10e" style={{}}>
          {card.cardType === "DataCard" && (
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
                "--background-colour": backgroundColour,
                "--faction-text-colour": factionTextColour,
              }}
            />
          )}
          {card.cardType === "stratagem" && (
            <StratagemCard
              stratagem={card}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "top",
                transform: `scale(${cardScaling / 100})`,
                height: `${714 * (cardScaling / 100)}px`,
                width: `${1077 * (cardScaling / 100)}px`,
                "--background-colour": backgroundColour,
                "--faction-text-colour": factionTextColour,
              }}
            />
          )}
          {card.cardType === "battle_rule" && (
            <BattleRuleCard
              stratagem={card}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "top",
                transform: `scale(${cardScaling / 100})`,
                height: `${714 * (cardScaling / 100)}px`,
                width: `${1077 * (cardScaling / 100)}px`,
                "--background-colour": backgroundColour,
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
          {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
          {activeCard.cardType === "battle_rule" && <BattleRuleCard battle_rule={activeCard} />}
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
          {card?.cardType === "battle_rule" && <BattleRuleCard battle_rule={activeCard} />}
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
