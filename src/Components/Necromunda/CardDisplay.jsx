import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { EmptyGangerCard } from "./EmptyGangerCard";
import { EmptyVehicleCard } from "./EmptyVehicleCard";
import { GangerCard } from "./GangerCard";
import { SecondaryCard } from "./SecondaryCard";
import { StratagemCard } from "./StratagemCard";
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
            {activeCard.cardType === "secondary" && <SecondaryCard secondary={activeCard} />}
            {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
          </Col>
        </>
      )}
      {type === "print" && card && (
        <div className="data-necromunda">
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
          {card.cardType === "stratagem" && (
            <StratagemCard
              stratagem={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
          {card.cardType === "secondary" && (
            <SecondaryCard
              secondary={card}
              paddingTop="8px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
