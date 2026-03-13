import { resolveCardType } from "../Custom/CustomCardDisplay";
import { CustomUnitCard } from "../Custom/CustomUnitCard";
import { CustomRuleCard } from "../Custom/CustomRuleCard";
import { CustomEnhancementCard } from "../Custom/CustomEnhancementCard";
import { CustomStratagemCard } from "../Custom/CustomStratagemCard";
import { TemplateRenderer } from "../../Premium";

/**
 * Renders a card preview in the Datasource Editor center panel.
 * Uses card data directly from the datasource (not from useCardStorage).
 *
 * Rendering priority:
 * 1. If the card has a templateId → use TemplateRenderer
 * 2. Otherwise → use the Custom* base components for the card's baseType
 */
export const DatasourceCardPreview = ({ card, activeDatasource }) => {
  if (!card || !activeDatasource) return null;

  const schema = activeDatasource.schema;
  const { cardTypeDef, baseType } = resolveCardType(card, schema);
  const cardFaction = activeDatasource.data?.find((faction) => faction.id === card.faction_id);

  const headerColour = cardFaction?.colours?.header;
  const bannerColour = cardFaction?.colours?.banner;
  const cardStyle = {
    "--header-colour": headerColour,
    "--banner-colour": bannerColour,
  };

  if (!cardTypeDef) {
    return (
      <div className="designer-empty-state full-height">
        <p>No matching card type definition found for &quot;{card.cardType}&quot;</p>
      </div>
    );
  }

  // If the card has a template, render via TemplateRenderer
  if (card.templateId) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24 }}>
        <TemplateRenderer templateId={card.templateId} card={card} faction={cardFaction} />
      </div>
    );
  }

  const renderCard = () => {
    switch (baseType) {
      case "unit":
        return <CustomUnitCard unit={card} cardTypeDef={cardTypeDef} cardStyle={cardStyle} />;
      case "rule":
        return <CustomRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={cardStyle} />;
      case "enhancement":
        return <CustomEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={cardStyle} />;
      case "stratagem":
        return <CustomStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={cardStyle} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24 }}>
      {renderCard()}
    </div>
  );
};
