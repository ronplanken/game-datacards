import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitCard } from "./UnitCard";

export const Warhammer40K10eCardDisplay = ({ type, card, cardScaling, printPadding, side = "front" }) => {
  const { activeCard } = useCardStorage();

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>{activeCard.cardType === "DataCard" && <UnitCard unit={activeCard} side={side} />}</Col>
        </>
      )}
      {type === "print" && card && (
        <div
          className="data-40k-10e"
          style={{
            height: "148.5mm",
            transformOrigin: "top",
            transform: `scale(${cardScaling / 100})`,
          }}>
          {card.cardType === "DataCard" && (
            <UnitCard
              unit={card}
              side={side}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
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
          {activeCard.cardType === "DataCard" && (
            <UnitCard
              unit={activeCard}
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
