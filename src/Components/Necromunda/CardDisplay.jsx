import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { GangerCard } from "./GangerCard";
import { VehicleCard } from './VehicleCard';

export const NecromundaCardDisplay = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <>
        <Col span={24}>{activeCard.cardType === "ganger" && <GangerCard unit={activeCard} />}</Col>
        <Col span={24}>{activeCard.cardType === "vehicle" && <VehicleCard unit={activeCard} />}</Col>
      </>
    )
  );
};
