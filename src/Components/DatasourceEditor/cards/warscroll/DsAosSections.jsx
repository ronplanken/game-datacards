import React from "react";
import { MarkdownSpanWrapDisplay } from "../../../MarkdownSpanWrapDisplay";

/**
 * Schema-driven sections renderer for AoS warscrolls.
 * Renders sections in ability-style blocks using the same CSS structure.
 */
export const DsAosSections = ({ card, sectionsSchema, grandAlliance }) => {
  const sections = sectionsSchema?.sections || [];

  const renderedSections = sections
    .filter((section) => {
      const data = card.sections?.[section.key];
      return Array.isArray(data) && data.length > 0;
    })
    .map((section) => {
      const data = card.sections[section.key];

      return (
        <div className={`ability-wrapper ${grandAlliance}`} key={section.key}>
          <div className={`ability-box ${grandAlliance}`}>
            <div className="ability-strip">
              <span className="ability-name">{section.label}</span>
            </div>
            <div className="ability-text">
              {section.format === "list" ? (
                <ul className="ds-aos-section-list">
                  {data.map((item, index) => (
                    <li key={`${section.key}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                data.map((item, index) => (
                  <div key={`${section.key}-${index}`}>
                    <MarkdownSpanWrapDisplay content={item} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    });

  if (renderedSections.length === 0) return null;

  return (
    <div data-testid="ds-aos-sections" className="ds-aos-sections-list">
      {renderedSections}
    </div>
  );
};
