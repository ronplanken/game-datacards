import { ReactFitty } from "react-fitty";

/**
 * CustomEnhancementCard - Schema-driven enhancement card renderer.
 * Reads field definitions from the schema to display fields
 * and an optional keywords collection.
 *
 * Mirrors the 40K EnhancementCard visual structure (border, side bar,
 * header bar, content, cost) but renders fields dynamically from the schema.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides (--header-colour, --banner-colour)
 */
export const CustomEnhancementCard = ({ card, cardTypeDef, cardStyle, isMobile }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];
  const keywordsSchema = schema.keywords;

  // Get field value from card data
  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  // Get the name field from schema, or fall back to card.name directly
  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Enhancement";

  // Get cost field from schema, or fall back to card.cost directly
  const costField = fields.find((f) => f.key === "cost");
  const costValue = (costField ? getFieldValue(costField.key) : card.cost) || "";

  // Content fields (exclude name and cost)
  const contentFields = fields.filter((f) => f.key !== nameField?.key && f.key !== costField?.key);

  // Get keywords data
  const keywordsData = card.keywords || [];

  return (
    <div
      className={`custom-card custom-enhancement-card${isMobile ? " custom-card-mobile" : ""}`}
      style={{
        "--width": `${card.styling?.width ?? 260}px`,
        "--height": `${card.styling?.height ?? 458}px`,
        ...cardStyle,
      }}
      data-testid="custom-enhancement-card">
      <div className="border">
        <div className="background-side-bar"></div>
        <div className="background-header-bar"></div>
        <div className="header">
          <ReactFitty maxSize={16} minSize={10}>
            {cardName}
          </ReactFitty>
        </div>
        {card.detachment && (
          <div className="type">
            <ReactFitty maxSize={10} minSize={2}>
              {card.detachment}
            </ReactFitty>
          </div>
        )}
        <div className="content" style={{ fontSize: card.styling?.textSize ?? 16 }}>
          {contentFields.map((field) => {
            const value = getFieldValue(field.key);
            if (!value) return null;

            return (
              <div className="field" key={field.key}>
                <span className={`field-value${field.type === "richtext" ? " richtext" : ""}`}>{value}</span>
              </div>
            );
          })}

          {keywordsSchema && keywordsData.length > 0 && (
            <div className="keywords-collection">
              <span className="keywords-label">{keywordsSchema.label || "Keywords"}:</span>
              <span className="keywords-value">{keywordsData.map((k) => k.keyword || k).join(", ")}</span>
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
  );
};
