import { UnitCardBack } from "./UnitCardBack";
import { UnitCardFront } from "./UnitCardFront";

export const UnitCard = ({ unit, cardStyle, paddingTop = "32px", className, side = "front" }) => {
  if (side === "front") {
    return <UnitCardFront unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
  if (side === "back") {
    return <UnitCardBack unit={unit} cardStyle={cardStyle} paddingTop={paddingTop} className={className} />;
  }
};
