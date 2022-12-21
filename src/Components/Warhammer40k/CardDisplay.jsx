import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { PsychicCard } from "./PsychicCard";
import { SecondaryCard } from "./SecondaryCard";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";

export const Warhammer40KCardDisplay = ({ type, card, cardScaling, printPadding }) => {
  const { activeCard } = useCardStorage();

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard.cardType === "datasheet" && <UnitCard unit={activeCard} />}
            {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard.cardType === "secondary" && <SecondaryCard secondary={activeCard} />}
            {activeCard.cardType === "psychic" && <PsychicCard power={activeCard} />}
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
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
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
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
