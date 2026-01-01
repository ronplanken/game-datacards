import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { PsychicPowerEditor } from "./PsychicPowerEditor";
import { SecondaryEditor } from "./SecondaryEditor";
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardEditor } from "./UnitCardEditor";

export const Warhammer40KCardEditor = () => {
  const { activeCard } = useCardStorage();
  return (
    activeCard && (
      <Col span={24} className={`card-editor data-40k ${activeCard?.icons ? activeCard?.icons : "icons"}`}>
        {activeCard.cardType === "datasheet" && <UnitCardEditor />}
        {activeCard.cardType === "stratagem" && <StratagemEditor />}
        {activeCard.cardType === "secondary" && <SecondaryEditor />}
        {activeCard.cardType === "psychic" && <PsychicPowerEditor />}
      </Col>
    )
  );
};
