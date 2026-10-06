import { MarkdownSpanWrapDisplay } from "../../../MarkdownSpanWrapDisplay";

/**
 * Schema-driven sections renderer using native 40K CSS structure.
 * Uses the same HTML structure as weapon type blocks (heading + items)
 * so they inherit the same padding and alignment within the .weapons grid area.
 *
 * - "list" format: heading + bullet-style list items
 * - "richtext" format: heading + markdown-rendered text
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data
 * @param {Object} props.sectionsSchema - The sections schema definition
 */
export const Ds40kUnitSections = ({ unit, sectionsSchema }) => {
  const sections = sectionsSchema?.sections || [];

  const renderedSections = sections
    .filter((section) => {
      const data = unit.sections?.[section.key];
      return Array.isArray(data) && data.length > 0;
    })
    .map((section) => {
      const data = unit.sections[section.key];

      return (
        <div className={`ds-section ds-section-${section.key}`} key={section.key}>
          <div className="heading">
            <div className="title">{section.label}</div>
          </div>
          {section.format === "list" ? (
            <div className="ds-section-items">
              {data.map((item, index) => (
                <div className="ds-section-item" key={`${section.key}-${index}`}>
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="ds-section-items">
              {data.map((item, index) => (
                <div className="ds-section-text" key={`${section.key}-${index}`}>
                  <MarkdownSpanWrapDisplay content={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  if (renderedSections.length === 0) return null;

  return <>{renderedSections}</>;
};
