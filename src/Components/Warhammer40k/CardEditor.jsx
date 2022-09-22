import { Col } from "antd";
import { useCardStorage } from '../../Hooks/useCardStorage';
import { SecondaryEditor } from './SecondaryEditor';
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardEditor } from "./UnitCardEditor";
import { PsychicPowerEditor } from "./PsychicPowerEditor";

export const Warhammer40KCardEditor = () => {
  const { activeCard } = useCardStorage();
  return (
    activeCard && (
      <Col span={24} className="data-40k">
        {activeCard.cardType === "datasheet" && <UnitCardEditor />}
        {activeCard.cardType === "stratagem" && <StratagemEditor />}
        {activeCard.cardType === "secondary" && <SecondaryEditor />}
        {activeCard.cardType === "psychic" && <PsychicPowerEditor />}
      </Col>
    )
  );
};
