import { useRef, useState } from "react";
import { resolveCardType } from "../Custom/CustomCardDisplay";
import { CustomUnitCard } from "../Custom/CustomUnitCard";
import { CustomRuleCard } from "../Custom/CustomRuleCard";
import { CustomEnhancementCard } from "../Custom/CustomEnhancementCard";
import { CustomStratagemCard } from "../Custom/CustomStratagemCard";
import { TemplateRenderer } from "../../Premium";
import { resolveDatasourceRenderer } from "./cards/resolveDatasourceRenderer";
import { useAutoFitScale } from "../../Hooks/useAutoFitScale";
import { DatasourcePreviewToolbar } from "./DatasourcePreviewToolbar";

/**
 * Renders a card preview in the Datasource Editor center panel.
 * Uses card data directly from the datasource (not from useCardStorage).
 *
 * Rendering priority:
 * 1. If the card has a templateId → use TemplateRenderer
 * 2. Otherwise → try native DS renderer for the base system
 * 3. Fall back to Custom* base components for the card's baseType
 */
export const DatasourceCardPreview = ({ card, activeDatasource }) => {
  const containerRef = useRef(null);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [zoom, setZoom] = useState(100);

  if (!card || !activeDatasource) return null;

  const schema = activeDatasource.schema;
  const { cardTypeDef, baseType } = resolveCardType(card, schema);
  const cardFaction = activeDatasource.data?.find((faction) => faction.id === card.faction_id);

  const cardType = baseType === "unit" && card.variant === "full" ? "unitFull" : baseType || "unit";

  const headerColour = cardFaction?.colours?.header;
  const bannerColour = cardFaction?.colours?.banner;

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

  // Try native renderer first, then fall back to Custom* components
  const NativeComponent = resolveDatasourceRenderer(schema.baseSystem, baseType);

  const renderCard = (scaleFactor) => {
    const cardStyle = {
      "--header-colour": headerColour,
      "--banner-colour": bannerColour,
      "--card-scaling-factor": scaleFactor,
    };

    if (NativeComponent) {
      return <NativeComponent card={card} cardTypeDef={cardTypeDef} cardStyle={cardStyle} faction={cardFaction} />;
    }

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
    <DatasourceCardPreviewScaled
      containerRef={containerRef}
      cardType={cardType}
      isAutoFit={isAutoFit}
      zoom={zoom}
      renderCard={renderCard}
      onZoomChange={(z) => {
        setIsAutoFit(false);
        setZoom(z);
      }}
      onAutoFitToggle={() => setIsAutoFit(true)}
    />
  );
};

/**
 * Inner component that handles scaling. Separated so the hook
 * can read the containerRef after mounting.
 */
const DatasourceCardPreviewScaled = ({
  containerRef,
  cardType,
  isAutoFit,
  zoom,
  renderCard,
  onZoomChange,
  onAutoFitToggle,
}) => {
  const { autoScale } = useAutoFitScale(containerRef, cardType, isAutoFit);
  const effectiveScale = isAutoFit ? autoScale : zoom / 100;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: 24,
        }}>
        {renderCard(effectiveScale)}
      </div>
      <DatasourcePreviewToolbar
        currentZoom={zoom}
        isAutoFit={isAutoFit}
        onZoomChange={onZoomChange}
        onAutoFitToggle={onAutoFitToggle}
      />
    </div>
  );
};
