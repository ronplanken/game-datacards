import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownSpanWrapDisplay } from "../../MarkdownSpanWrapDisplay";
import { PhaseIcon } from "../../Icons/PhaseIcon";

/**
 * Datasource-native 40K Stratagem card renderer.
 * Uses the same CSS class structure as the built-in StratagemCard
 * but reads field values from the schema definition.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides
 */
export const Ds40kStratagemCard = ({ card, cardTypeDef, cardStyle, isMobile }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];

  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Stratagem";

  const costField = fields.find((f) => f.key === "cost");
  const costValue = (costField ? getFieldValue(costField.key) : card.cost) || "";

  const typeField = fields.find((f) => f.key === "type");
  const typeValue = (typeField ? getFieldValue(typeField.key) : card.type) || "";

  const detachmentField = fields.find((f) => f.key === "detachment");
  const detachmentValue = (detachmentField ? getFieldValue(detachmentField.key) : card.detachment) || "";

  const phaseField = fields.find((f) => f.key === "phase");
  const rawPhase = phaseField ? getFieldValue(phaseField.key) : card.phase;
  // Normalize phase to an array — schema stores it as a single enum string, built-in uses an array
  const phases = Array.isArray(rawPhase) ? rawPhase : rawPhase ? [rawPhase] : [];

  // Content fields — exclude name, cost, type, detachment, phase (they have dedicated display areas)
  const excludedKeys = new Set(
    [nameField?.key, costField?.key, typeField?.key, detachmentField?.key, phaseField?.key].filter(Boolean),
  );
  const contentFields = fields.filter((f) => !excludedKeys.has(f.key));

  const typeDisplay = [detachmentValue, typeValue].filter(Boolean).join(" - ");

  const lineHeight = `${card?.styling?.lineHeight ?? 1}rem`;

  return (
    <div className="data-40k-10e" data-testid="ds-40k-stratagem">
      <div
        className={isMobile ? "shared-stratagem" : ""}
        style={{
          "--width": `${card.styling?.width ?? 260}px`,
          "--height": `${card.styling?.height ?? 458}px`,
          justifyContent: "center",
          justifyItems: "center",
          display: "flex",
          paddingTop: "32px",
          ...cardStyle,
        }}>
        <div
          className={classNames(
            "stratagem",
            {
              other: card.turn === "opponents",
              either: card.turn === "either",
              own: card.turn !== "opponents" && card.turn !== "either",
            },
            card.faction_id,
          )}>
          <div className="border">
            <div className="background-side-bar"></div>
            <div className="background-header-bar"></div>
            <div className="header">
              <ReactFitty maxSize={16} minSize={10}>
                {cardName}
              </ReactFitty>
            </div>
            {typeDisplay && (
              <div className="type">
                <ReactFitty maxSize={14} minSize={2}>
                  {typeDisplay}
                </ReactFitty>
              </div>
            )}
            <div className="content" style={{ fontSize: card?.styling?.textSize ?? 16 }}>
              {contentFields.map((field) => {
                const value = getFieldValue(field.key);
                if (!value) return null;

                return (
                  <div className="section" key={field.key} style={{ lineHeight }}>
                    <span className="title">{field.label}:</span>
                    <span className="text">
                      <MarkdownSpanWrapDisplay content={value} />
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="containers">
              {phases.map((phase) => (
                <div className="type-container" key={phase}>
                  <div className="phase-icon-wrapper">
                    <PhaseIcon phase={phase} />
                  </div>
                </div>
              ))}
              {costValue && (
                <div className="cp-container">
                  <div className="value">
                    <ReactFitty maxSize={18} minSize={10}>
                      {costValue}
                    </ReactFitty>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
