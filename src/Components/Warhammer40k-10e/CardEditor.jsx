import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { EnhancementEditor } from "./EnhancementEditor";
import { RuleCardInfo } from "./RuleCardInfo";
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardBackEditor } from "./UnitCardBackEditor";
import { UnitCardEditor } from "./UnitCardEditor";
import { UnitCardFullEditor } from "./UnitCardFullEditor";

export const Warhammer40K10eCardEditor = () => {
  const { activeCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  return (
    <>
      {activeCard && settings.showCardsAsDoubleSided !== true && activeCard.variant !== "full" && (
        <Col span={24} className={`card-editor`}>
          {activeCard.cardType === "DataCard" && (activeCard.print_side === "front" || !activeCard.print_side) && (
            <UnitCardEditor />
          )}
          {activeCard.cardType === "stratagem" && <StratagemEditor />}
          {activeCard.cardType === "enhancement" && <EnhancementEditor />}
          {activeCard.cardType === "rule" && <RuleCardInfo />}
          {activeCard.cardType === "DataCard" && activeCard.print_side === "back" && <UnitCardBackEditor />}
        </Col>
      )}
      {activeCard && (settings.showCardsAsDoubleSided === true || activeCard.variant === "full") && (
        <Col span={24} className={`card-editor`}>
          {activeCard.cardType === "DataCard" && (
            <>
              <UnitCardFullEditor />
            </>
          )}
          {activeCard.cardType === "stratagem" && <StratagemEditor />}
          {activeCard.cardType === "rule" && <RuleCardInfo />}
        </Col>
      )}
    </>
  );
};
