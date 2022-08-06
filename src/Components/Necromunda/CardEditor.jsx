import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { EmptyCardEditor } from "./EmptyCardEditor";
import { GangerCardEditor } from "./GangerCardEditor";
import { VehicleCardEditor } from "./VehicleCardEditor";

export const NecromundaCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <Col span={24} className="data-necromunda">
        {activeCard.cardType === "ganger" && <GangerCardEditor />}
        {activeCard.cardType === "vehicle" && <VehicleCardEditor />}
        {activeCard.cardType === "empty-ganger" && <EmptyCardEditor />}
        {activeCard.cardType === "empty-vehicle" && <EmptyCardEditor />}
      </Col>
    )
  );
};
