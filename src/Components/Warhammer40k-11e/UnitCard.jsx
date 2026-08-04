import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { UnitCardBack } from "./UnitCardBack";
import { UnitCardFront } from "./UnitCardFront";
import { UnitCardFull } from "./UnitCardFull";

export const UnitCard = ({ unit, cardStyle, paddingTop = "32px", className, side = "front" }) => {
  const { settings } = useSettingsStorage();

  const showFullUnitCard = settings.showCardsAsDoubleSided || unit.variant === "full";
  const cardTypeToDisplay = showFullUnitCard ? "full" : side;

  switch (cardTypeToDisplay) {
    case "full":
      return <UnitCardFull unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
    case "frontAndBack":
      return (
        <div style={{ display: "flex" }}>
          <UnitCardFront unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />
          <UnitCardBack unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />
        </div>
      );
    case "back":
      return <UnitCardBack unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
    case "front":
    default:
      return <UnitCardFront unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
};
