import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { EmptyGangerCard } from "./EmptyGangerCard";
import { EmptyVehicleCard } from "./EmptyVehicleCard";
import { GangerCard } from "./GangerCard";
import { VehicleCard } from "./VehicleCard";

export const NecromundaCardDisplay = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <>
        <Col span={24}>{activeCard.cardType === "ganger" && <GangerCard unit={activeCard} />}</Col>
        <Col span={24}>{activeCard.cardType === "vehicle" && <VehicleCard unit={activeCard} />}</Col>
        <Col span={24}>{activeCard.cardType === "empty-ganger" && <EmptyGangerCard />}</Col>
        <Col span={24}>{activeCard.cardType === "empty-vehicle" && <EmptyVehicleCard />}</Col>
      </>
    )
  );
};
