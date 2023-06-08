import { Col } from "antd";
import sizes from "../../Helpers/sizes.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { UnitCard } from "./UnitCard";

export const Warhammer40K10eCardDisplay = ({ type, card, cardScaling, printPadding }) => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  let resizedStyle = {
    height: `calc(${sizes[card?.variant || "card"]?.height || 1} * ${cardScaling / 100} )`,
    width: `calc(${sizes[card?.variant || "card"]?.width || 1} * ${cardScaling / 100} )`,
  };

  if (settings.legacyPrinting) {
    resizedStyle = {};
  }

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>{activeCard.cardType === "DataCard" && <UnitCard unit={activeCard} />}</Col>
        </>
      )}
      {type === "print" && card && (
        <div className="data-40k10e">
          {card.cardType === "datasheet" && (
            <UnitCard
              unit={card}
              paddingTop="0px"
              cardStyle={{
                gap: printPadding,
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                ...resizedStyle,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
