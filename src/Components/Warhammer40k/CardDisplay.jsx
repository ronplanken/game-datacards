import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import sizes from "../../Helpers/sizes.helpers";
import { PsychicCard } from "./PsychicCard";
import { SecondaryCard } from "./SecondaryCard";
import { StratagemCard } from "./StratagemCard";
import { UnitCard } from "./UnitCard";

export const Warhammer40KCardDisplay = ({ type, card, cardScaling, printPadding }) => {
  const { activeCard } = useCardStorage();
  const { settings } = useSettingsStorage();

  let resizedStyle = {
    height: `calc(${sizes[card?.variant || "card"].height} * ${cardScaling / 100} )`,
    width: `calc(${sizes[card?.variant || "card"].width} * ${cardScaling / 100} )`,
  };

  if (settings.legacyPrinting) {
    resizedStyle = {};
  }

  return (
    <>
      {!type && activeCard && (
        <>
          <Col span={24}>
            {activeCard.cardType === "datasheet" && <UnitCard unit={activeCard} />}
            {activeCard.cardType === "stratagem" && <StratagemCard stratagem={activeCard} />}
            {activeCard.cardType === "secondary" && <SecondaryCard secondary={activeCard} />}
            {activeCard.cardType === "psychic" && <PsychicCard power={activeCard} />}
          </Col>
        </>
      )}
      {type === "print" && card && (
        <div className="data-40k">
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
          {card.cardType === "stratagem" && (
            <StratagemCard
              stratagem={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
              }}
            />
          )}
          {card.cardType === "secondary" && (
            <SecondaryCard
              secondary={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
              }}
            />
          )}
          {card.cardType === "psychic" && (
            <PsychicCard
              power={card}
              paddingTop="0px"
              cardStyle={{
                transformOrigin: "0% 0%",
                transform: `scale(${cardScaling / 100})`,
                gap: printPadding,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
