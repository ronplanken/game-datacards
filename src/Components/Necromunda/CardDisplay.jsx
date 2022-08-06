import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { EmptyGangerCard } from "./EmptyGangerCard";
import { EmptyVehicleCard } from "./EmptyVehicleCard";
import { GangerCard } from "./GangerCard";
import { VehicleCard } from "./VehicleCard";

export const NecromundaCardDisplay = ({ type, card, cardScaling }) => {
  const { activeCard } = useCardStorage();

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard.cardType === "ganger" && <GangerCard unit={activeCard} />}
            {activeCard.cardType === "vehicle" && <VehicleCard vehicle={activeCard} />}
            {activeCard.cardType === "empty-ganger" && <EmptyGangerCard unit={activeCard} />}
            {activeCard.cardType === "empty-vehicle" && <EmptyVehicleCard vehicle={activeCard} />}
          </Col>
        </>
      )}
      {type === "print" && card && (
        <Col span={24}>
          {card.cardType === "ganger" && (
            <GangerCard
              unit={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
          {card.cardType === "vehicle" && (
            <VehicleCard
              vehicle={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
          {card.cardType === "empty-ganger" && (
            <EmptyGangerCard
              unit={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
          {card.cardType === "empty-vehicle" && (
            <EmptyVehicleCard
              vehicle={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
        </Col>
      )}
    </>
  );
};
