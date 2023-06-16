import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitCardEditor } from "./UnitCardEditor";

export const Warhammer40K10eCardEditor = () => {
  const { activeCard } = useCardStorage();
  return (
    activeCard && (
      <Col span={24} className={`card-editor`}>
        {activeCard.cardType === "DataCard" && <UnitCardEditor />}
      </Col>
    )
  );
};
