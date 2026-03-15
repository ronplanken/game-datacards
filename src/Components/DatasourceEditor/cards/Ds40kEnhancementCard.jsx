import { ReactFitty } from "react-fitty";
import { MarkdownSpanWrapDisplay } from "../../MarkdownSpanWrapDisplay";

/**
 * Datasource-native 40K Enhancement card renderer.
 * Uses the same CSS class structure as the built-in EnhancementCard
 * but reads field values from the schema definition.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides
 */
export const Ds40kEnhancementCard = ({ card, cardTypeDef, cardStyle, isMobile }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];

  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Enhancement";

  const costField = fields.find((f) => f.key === "cost");
  const costValue = (costField ? getFieldValue(costField.key) : card.cost) || "";

  const detachmentField = fields.find((f) => f.key === "detachment");
  const detachmentValue = (detachmentField ? getFieldValue(detachmentField.key) : card.detachment) || "";

  // Content fields — exclude name, cost, detachment
  const excludedKeys = new Set([nameField?.key, costField?.key, detachmentField?.key].filter(Boolean));
  const contentFields = fields.filter((f) => !excludedKeys.has(f.key));

  // Keywords collection from schema
  const keywords = (card.keywords || []).filter((k) => k.active !== false);

  return (
    <div className="data-40k-10e" data-testid="ds-40k-enhancement">
      <div
        className={isMobile ? "shared-enhancement" : ""}
        style={{
          "--width": `${card.styling?.width ?? 260}px`,
          "--height": `${card.styling?.height ?? 458}px`,
          justifyContent: "center",
          justifyItems: "center",
          display: "flex",
          paddingTop: "32px",
          ...cardStyle,
        }}>
        <div className={`own enhancement ${card.faction_id || ""}`}>
          <div className="border">
            <div className="background-side-bar"></div>
            <div className="background-header-bar"></div>
            <div className="header">
              <ReactFitty maxSize={16} minSize={10}>
                {cardName}
              </ReactFitty>
            </div>
            {detachmentValue && (
              <div className="type">
                <ReactFitty maxSize={10} minSize={2}>
                  {detachmentValue}
                </ReactFitty>
              </div>
            )}
            <div className="content" style={{ fontSize: card?.styling?.textSize ?? 16 }}>
              {contentFields.map((field) => {
                const value = getFieldValue(field.key);
                if (!value) return null;

                return (
                  <div
                    className="section"
                    key={field.key}
                    style={{ lineHeight: `${card.styling?.lineHeight ?? 1}rem` }}>
                    <MarkdownSpanWrapDisplay content={value} />
                  </div>
                );
              })}
              {keywords.length > 0 && (
                <div className="keywords">
                  <span className="title">keywords</span>
                  <span className="value">{keywords.map((k) => k.keyword).join(", ")}</span>
                </div>
              )}
            </div>
            {costValue && (
              <div className="containers">
                <div className="cost-container">
                  <div className="value">
                    <ReactFitty maxSize={18} minSize={10}>
                      {costValue}
                    </ReactFitty>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
