import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { WarscrollCardEditor } from "./WarscrollCardEditor";
import { SpellCardEditor } from "./SpellCardEditor";

export const AgeOfSigmarCardEditor = () => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();

  return (
    <>
      {activeCard && (
        <Col span={24} className="card-editor">
          {activeCard.cardType === "warscroll" && <WarscrollCardEditor />}
          {activeCard.cardType === "spell" && <SpellCardEditor />}
        </Col>
      )}
    </>
  );
};
