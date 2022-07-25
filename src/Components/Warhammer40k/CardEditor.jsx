import { Col } from "antd";
import { useCardStorage } from '../../Hooks/useCardStorage';
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardEditor } from "./UnitCardEditor";

export const Warhammer40KCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    activeCard && (
      <Col span={24} className="data-40k">
        {activeCard.cardType === "datasheet" && <UnitCardEditor />}
        {activeCard.cardType === "stratagem" && <StratagemEditor />}
      </Col>
    )
  );
};
