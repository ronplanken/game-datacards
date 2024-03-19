import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { UnitCardBack } from "./UnitCardBack";
import { UnitCardFront } from "./UnitCardFront";
import { UnitCardFull } from "./UnitCardFull";

export const UnitCard = ({ unit, cardStyle, paddingTop = "32px", className, side = "front" }) => {
  const { settings, updateSettings } = useSettingsStorage();

  if (unit.variant === "full" || settings.showCardsAsDoubleSided) {
    return <UnitCardFull unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
  if (side === "front") {
    return <UnitCardFront unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
  if (side === "back") {
    return <UnitCardBack unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
};
