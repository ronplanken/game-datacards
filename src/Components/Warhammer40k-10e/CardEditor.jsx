import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { StratagemEditor } from "./StratagemEditor";
import { UnitCardBackEditor } from "./UnitCardBackEditor";
import { UnitCardEditor } from "./UnitCardEditor";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { UnitCardFullEditor } from "./UnitCardFullEditor";

export const Warhammer40K10eCardEditor = () => {
  const { activeCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  return (
    <>
      {activeCard && settings.showCardsAsDoubleSided === false && activeCard.variant !== "full" && (
        <Col span={24} className={`card-editor`}>
          {activeCard.cardType === "DataCard" && (activeCard.print_side === "front" || !activeCard.print_side) && (
            <UnitCardEditor />
          )}
          {activeCard.cardType === "stratagem" && <StratagemEditor />}
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
        </Col>
      )}
    </>
  );
};
