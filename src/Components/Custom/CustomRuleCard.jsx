/**
 * CustomRuleCard - Schema-driven rule card renderer.
 * Reads field definitions from the schema to display top-level fields
 * and a nested rules collection.
 *
 * Mirrors the 40K RuleCard visual structure (border, side bar, header bar,
 * content sections) but renders fields dynamically from the schema.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides (--header-colour, --banner-colour)
 */
export const CustomRuleCard = ({ card, cardTypeDef, cardStyle }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];
  const rulesSchema = schema.rules;

  // Get field value from card data
  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  // Get the name field from schema, or fall back to card.name directly
  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Rule";

  // ruleType is rendered in the dedicated .type area, so exclude it from content fields
  const ruleTypeField = fields.find((f) => f.key === "ruleType");

  // Content fields exclude name (shown in header) and ruleType (shown in type area)
  const excludedKeys = new Set([nameField?.key, ruleTypeField?.key].filter(Boolean));
  const contentFields = fields.filter((f) => !excludedKeys.has(f.key));

  // Get nested rules data
  const rulesData = card.rules || [];

  return (
    <div className="custom-card custom-rule-card" style={cardStyle} data-testid="custom-rule-card">
      <div className="border">
        <div className="background-side-bar"></div>
        <div className="background-header-bar"></div>
        <div className="header">{cardName}</div>
        {ruleTypeField && getFieldValue(ruleTypeField.key) && (
          <div className="type">{getFieldValue(ruleTypeField.key)}</div>
        )}
        <div className="content">
          {contentFields.map((field) => {
            const value = getFieldValue(field.key);
            if (!value) return null;

            return (
              <div className="field" key={field.key}>
                {field.type !== "richtext" && <span className="field-label">{field.label}:</span>}
                <span className={`field-value${field.type === "richtext" ? " richtext" : ""}`}>{value}</span>
              </div>
            );
          })}

          {rulesSchema && rulesData.length > 0 && (
            <div className="rules-collection">
              <div className="rules-heading">{rulesSchema.label || "Rules"}</div>
              {rulesData
                .filter((rule) => rule.active !== false)
                .map((rule, index) => (
                  <div className="rule-entry" key={`rule-${index}`}>
                    {rule.title && <span className="rule-title">{rule.title}</span>}
                    {rule.description && <span className="rule-description">{rule.description}</span>}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
