import { useCallback } from "react";
import { Col } from "antd";
import { Layers } from "lucide-react";
import { resolveCardType } from "../Custom/CustomCardDisplay";
import {
  CardEditProvider,
  CustomUnitEditor,
  CustomFieldEditor,
  TemplateSelector,
  usePremiumFeatures,
} from "../../Premium";
import { Section } from "./components";

/**
 * Card editor wrapper for the Datasource Editor right panel.
 * Wraps the premium editor components with a CardEditProvider
 * that targets the datasource's card data instead of useCardStorage.
 */
export const DatasourceCardEditor = ({ card, activeDatasource, onUpdateCard }) => {
  if (!card || !activeDatasource) return null;

  const schema = activeDatasource.schema;
  const { cardTypeDef, baseType } = resolveCardType(card, schema);
  const { hasCardDesigner } = usePremiumFeatures();

  const handleTemplateChange = useCallback(
    (templateId) => {
      if (!onUpdateCard) return;
      onUpdateCard({ ...card, templateId: templateId || undefined });
    },
    [card, onUpdateCard],
  );

  if (!cardTypeDef) {
    return (
      <div style={{ padding: 16, color: "rgba(0,0,0,0.45)" }}>
        No matching card type definition found for &quot;{card.cardType}&quot;
      </div>
    );
  }

  const renderEditor = () => {
    switch (baseType) {
      case "unit":
        return <CustomUnitEditor cardTypeDef={cardTypeDef} />;
      case "rule":
      case "enhancement":
      case "stratagem":
        return <CustomFieldEditor cardTypeDef={cardTypeDef} baseType={baseType} />;
      default:
        return null;
    }
  };

  return (
    <CardEditProvider card={card} onUpdateCard={onUpdateCard}>
      <div className="props-body">
        {hasCardDesigner && (
          <Section title="Template" icon={Layers} defaultOpen={true}>
            <TemplateSelector
              value={card.templateId || null}
              onChange={handleTemplateChange}
              placeholder="Default (Native Renderer)"
            />
          </Section>
        )}
        <Col span={24} className="card-editor">
          {renderEditor()}
        </Col>
      </div>
    </CardEditProvider>
  );
};
