import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { GangerCardEditor } from "./GangerCardEditor";

export const NecromundaCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <Col span={24} className="data-necromunda">
        {activeCard.cardType === "ganger" && <GangerCardEditor />}
      </Col>
    )
  );
};