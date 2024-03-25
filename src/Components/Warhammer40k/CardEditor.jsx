import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { BattleRuleEditor } from "./BattleRuleEditor";
import { PsychicPowerEditor } from "./PsychicPowerEditor";
import { SecondaryEditor } from "./SecondaryEditor";
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardEditor } from "./UnitCardEditor";

export const Warhammer40KCardEditor = () => {
  const { activeCard } = useCardStorage();
  console.log(activeCard);
  return (
    activeCard && (
      <Col span={24} className={`card-editor data-40k ${activeCard?.icons ? activeCard?.icons : "icons"}`}>
        {activeCard.cardType === "datasheet" && <UnitCardEditor />}
        {activeCard.cardType === "stratagem" && <StratagemEditor />}
        {activeCard.cardType === "secondary" && <SecondaryEditor />}
        {activeCard.cardType === "psychic" && <PsychicPowerEditor />}
        {activeCard.cardType === "battle_rule" && <BattleRuleEditor />}
      </Col>
    )
  );
};
