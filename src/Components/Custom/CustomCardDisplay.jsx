import { Col } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { CustomEnhancementCard } from "./CustomEnhancementCard";
import { CustomRuleCard } from "./CustomRuleCard";
import { CustomStratagemCard } from "./CustomStratagemCard";
import { CustomUnitCard } from "./CustomUnitCard";
import { resolveDatasourceRenderer } from "../DatasourceEditor/cards/resolveDatasourceRenderer";
import { TemplateRenderer } from "../../Premium";

/**
 * Resolves the schema card type definition for a given card.
 * Matches by cardType against the schema's cardTypes array,
 * checking both the `key` and `baseType` fields.
 *
 * @param {Object} card - The card to resolve
 * @param {Object} schema - The datasource schema
 * @returns {{ cardTypeDef: Object|null, baseType: string|null }}
 */
export const resolveCardType = (card, schema) => {
  if (!card || !schema?.cardTypes?.length) {
    return { cardTypeDef: null, baseType: null };
  }

  const cardType = card.cardType;

  // Try matching by key first, then by baseType
  const match =
    schema.cardTypes.find((ct) => ct.key === cardType) || schema.cardTypes.find((ct) => ct.baseType === cardType);

  if (match) {
    return { cardTypeDef: match, baseType: match.baseType };
  }

  // Map legacy cardType values to baseType
  const legacyMap = {
    DataCard: "unit",
    datasheet: "unit",
  };

  const mappedType = legacyMap[cardType];
  if (mappedType) {
    const legacyMatch = schema.cardTypes.find((ct) => ct.baseType === mappedType);
    if (legacyMatch) {
      return { cardTypeDef: legacyMatch, baseType: legacyMatch.baseType };
    }
  }

  return { cardTypeDef: null, baseType: null };
};

export const CustomCardDisplay = ({
  type,
  card,
  cardScaling,
  printPadding,
  side = "front",
  backgrounds = "standard",
  onBack,
}) => {
  const { activeCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();

  const displayCard = card || activeCard;
  const schema = dataSource?.schema;
  const cardFaction = dataSource?.data?.find((faction) => faction.id === displayCard?.faction_id);

  const { cardTypeDef, baseType } = resolveCardType(displayCard, schema);

  // Get colours from faction or custom overrides
  const headerColour = displayCard?.useCustomColours
    ? displayCard.customHeaderColour || cardFaction?.colours?.header
    : cardFaction?.colours?.header;
  const bannerColour = displayCard?.useCustomColours
    ? displayCard.customBannerColour || cardFaction?.colours?.banner
    : cardFaction?.colours?.banner;

  const cardStyle = {
    "--header-colour": headerColour,
    "--banner-colour": bannerColour,
  };

  if (!displayCard || !schema) {
    return null;
  }

  if (!cardTypeDef) {
    return (
      <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
        <div className="data-custom" style={{ padding: "24px", textAlign: "center", color: "rgba(0,0,0,0.45)" }}>
          No matching card type definition found for &quot;{displayCard.cardType}&quot;
        </div>
      </Col>
    );
  }

  // If the card has a template, render via TemplateRenderer
  if (displayCard.templateId) {
    return (
      <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
        <TemplateRenderer templateId={displayCard.templateId} card={displayCard} faction={cardFaction} />
      </Col>
    );
  }

  // Try native renderer first, then fall back to Custom* components
  const NativeComponent = resolveDatasourceRenderer(schema.baseSystem, baseType);
  const isMobile = type === "viewer";

  const renderCard = () => {
    if (NativeComponent) {
      return (
        <NativeComponent
          card={displayCard}
          cardTypeDef={cardTypeDef}
          cardStyle={cardStyle}
          faction={cardFaction}
          isMobile={isMobile}
          onBack={isMobile ? onBack : undefined}
        />
      );
    }

    switch (baseType) {
      case "unit":
        return (
          <CustomUnitCard unit={displayCard} cardTypeDef={cardTypeDef} cardStyle={cardStyle} isMobile={isMobile} />
        );
      case "rule":
        return (
          <CustomRuleCard card={displayCard} cardTypeDef={cardTypeDef} cardStyle={cardStyle} isMobile={isMobile} />
        );
      case "enhancement":
        return (
          <CustomEnhancementCard
            card={displayCard}
            cardTypeDef={cardTypeDef}
            cardStyle={cardStyle}
            isMobile={isMobile}
          />
        );
      case "stratagem":
        return (
          <CustomStratagemCard card={displayCard} cardTypeDef={cardTypeDef} cardStyle={cardStyle} isMobile={isMobile} />
        );
      default:
        return null;
    }
  };

  // Use the appropriate CSS scope class based on whether native renderer is used
  const scopeClass = NativeComponent ? null : "data-custom";

  return (
    <>
      {!type && activeCard && (
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          {renderCard()}
        </Col>
      )}
      {!type && card && renderCard()}
      {type === "print" && card && (
        <div
          className={scopeClass}
          style={{
            zoom: cardScaling / 100,
            "--card-scaling-factor": 1,
          }}>
          {renderCard()}
        </div>
      )}
      {type === "viewer" && <div className={scopeClass}>{renderCard()}</div>}
    </>
  );
};
