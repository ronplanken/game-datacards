/**
 * CustomStratagemCard - Schema-driven stratagem card renderer.
 * Reads field definitions from the schema to display fields dynamically.
 *
 * Mirrors the 40K StratagemCard visual structure (border, side bar,
 * header bar, content sections, CP cost) but renders fields dynamically.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides (--header-colour, --banner-colour)
 */
export const CustomStratagemCard = ({ card, cardTypeDef, cardStyle }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];

  // Get field value from card data
  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  // Get key fields from schema, with fallbacks to card data directly
  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Stratagem";

  const costField = fields.find((f) => f.key === "cost");
  const costValue = (costField ? getFieldValue(costField.key) : card.cost) || "";

  const typeField = fields.find((f) => f.key === "type");
  const typeValue = (typeField ? getFieldValue(typeField.key) : card.type) || "";

  // Content fields (exclude name, cost, type — those have dedicated display areas)
  const contentFields = fields.filter(
    (f) => f.key !== nameField?.key && f.key !== costField?.key && f.key !== typeField?.key,
  );

  // Determine turn classification from card data for styling
  const turnClass = card.turn === "opponents" ? "other" : card.turn === "either" ? "either" : "own";

  return (
    <div
      className={`custom-card custom-stratagem-card ${turnClass}`}
      style={cardStyle}
      data-testid="custom-stratagem-card">
      <div className="border">
        <div className="background-side-bar"></div>
        <div className="background-header-bar"></div>
        <div className="header">{cardName}</div>
        {typeValue && <div className="type">{typeValue}</div>}
        <div className="content">
          {contentFields.map((field) => {
            const value = getFieldValue(field.key);
            if (!value) return null;

            return (
              <div className="section" key={field.key}>
                <span className="title">{field.label}:</span>
                <span className="text">{value}</span>
              </div>
            );
          })}
        </div>
        {costValue && (
          <div className="containers">
            <div className="cp-container">
              <div className="value">{costValue}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
