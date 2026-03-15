import { AgeOfSigmarCardDisplay } from "../AgeOfSigmar/CardDisplay";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";
import { CustomCardDisplay } from "../Custom/CustomCardDisplay";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

/**
 * CardRenderer - Abstracts card rendering logic for print page.
 * Handles different card sources and applies appropriate display component.
 */
export const CardRenderer = ({ card, cardScaling, printSide, backgrounds, forcePrintSide }) => {
  const { isCustomDatasource } = useDataSourceStorage();

  if (!card) return null;

  const effectiveSide = !card.print_side || forcePrintSide ? printSide : card.print_side;

  // Check for AoS warscrolls by cardType as fallback
  if (card?.source === "aos" || card?.cardType === "warscroll") {
    return <AgeOfSigmarCardDisplay card={card} type="print" cardScaling={cardScaling} backgrounds={backgrounds} />;
  }

  switch (card?.source) {
    case "40k-10e":
      return (
        <Warhammer40K10eCardDisplay
          card={card}
          type="print"
          cardScaling={cardScaling}
          side={effectiveSide}
          backgrounds={backgrounds}
        />
      );

    case "40k":
    case "basic":
      return <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />;

    case "necromunda":
      return <NecromundaCardDisplay card={card} type="print" cardScaling={cardScaling} />;

    default:
      // Cards from custom datasources have a source that doesn't match any known system.
      // Check both the global isCustomDatasource flag and the card's own source.
      if (isCustomDatasource || card?.source) {
        return <CustomCardDisplay card={card} type="print" cardScaling={cardScaling} />;
      }
      // Fallback for unknown sources - try 40k display
      return <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />;
  }
};
