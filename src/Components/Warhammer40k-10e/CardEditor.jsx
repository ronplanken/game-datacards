import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { StratagemEditor } from "./StratagemEditor";
import { BattleRuleEditor } from "./BattleRuleEditor";
import { UnitCardBackEditor } from "./UnitCardBackEditor";
import { UnitCardEditor } from "./UnitCardEditor";

export const Warhammer40K10eCardEditor = () => {
  const { activeCard } = useCardStorage();
  return (
    activeCard && (
      <Col span={24} className={`card-editor`}>
        {activeCard.cardType === "DataCard" && (activeCard.print_side === "front" || !activeCard.print_side) && (
          <UnitCardEditor />
        )}
        {activeCard.cardType === "stratagem" && <StratagemEditor />}
        {activeCard.cardType === "battle_rule" && <BattleRuleEditor />}
        {activeCard.cardType === "DataCard" && activeCard.print_side === "back" && <UnitCardBackEditor />}
      </Col>
    )
  );
};
