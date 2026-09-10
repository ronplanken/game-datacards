import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { EnhancementEditor } from "./EnhancementEditor";
import { RuleEditor } from "./RuleEditor";
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardBackEditor } from "./UnitCardBackEditor";
import { UnitCardEditor } from "./UnitCardEditor";
import { UnitCardFullEditor } from "./UnitCardFullEditor";

// 11th edition card editor. Mirrors the 10e routing (front / back / full unit
// editors plus stratagem / enhancement / rule editors) but every editor edits
// the active card language in place via the localisation helpers.
export const Warhammer40K11eCardEditor = () => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();

  if (!activeCard) {
    return null;
  }

  return (
    <>
      {settings.showCardsAsDoubleSided !== true && activeCard.variant !== "full" && (
        <Col span={24} className={`card-editor`}>
          {activeCard.cardType === "DataCard" && (activeCard.print_side === "front" || !activeCard.print_side) && (
            <UnitCardEditor />
          )}
          {activeCard.cardType === "stratagem" && <StratagemEditor />}
          {activeCard.cardType === "enhancement" && <EnhancementEditor />}
          {activeCard.cardType === "rule" && <RuleEditor />}
          {activeCard.cardType === "DataCard" && activeCard.print_side === "back" && <UnitCardBackEditor />}
        </Col>
      )}
      {(settings.showCardsAsDoubleSided === true || activeCard.variant === "full") && (
        <Col span={24} className={`card-editor`}>
          {activeCard.cardType === "DataCard" && <UnitCardFullEditor />}
          {activeCard.cardType === "stratagem" && <StratagemEditor />}
          {activeCard.cardType === "rule" && <RuleEditor />}
          {activeCard.cardType === "enhancement" && <EnhancementEditor />}
        </Col>
      )}
    </>
  );
};
