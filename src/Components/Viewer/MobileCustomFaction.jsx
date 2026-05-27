import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { List, ChevronRight, BookOpen } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { getTargetArray } from "../../Helpers/customDatasource.helpers";
import "./MobileCustomFaction.css";

export const MobileCustomFaction = () => {
  const navigate = useNavigate();
  const { dataSource, selectedFaction } = useDataSourceStorage();

  const schema = dataSource?.schema;
  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");

  const handleBrowseAll = () => {
    navigate(`/mobile/${factionSlug}/units`);
  };

  const handleCardClick = (card) => {
    const cardSlug = card.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/${cardSlug}`);
  };

  const handleBrowseGlossary = () => {
    navigate(`/mobile/${factionSlug}/glossary`);
  };

  const glossaryCount = Array.isArray(schema?.keywordGlossary) ? schema.keywordGlossary.length : 0;

  // Build sections from schema card types
  const sections = useMemo(() => {
    if (!schema?.cardTypes || !selectedFaction) return [];

    return schema.cardTypes
      .map((ct) => {
        const arrayName = getTargetArray(ct.key) || getTargetArray(ct.baseType);
        const cards =
          selectedFaction[arrayName]?.filter((c) => c.cardType === ct.key || c.cardType === ct.baseType) || [];
        const sorted = [...cards].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        const hasSubcategory = !!ct?.schema?.metadata?.hasSubcategory;

        if (hasSubcategory) {
          const subGroups = [];
          const subIndex = new Map();
          for (const card of sorted) {
            const key = card.subcategory || "";
            if (!subIndex.has(key)) {
              subIndex.set(key, subGroups.length);
              subGroups.push({ label: key || "Uncategorized", key, cards: [] });
            }
            subGroups[subIndex.get(key)].cards.push(card);
          }
          const showHeaders = subGroups.length > 1 || (subGroups.length === 1 && subGroups[0].key !== "");
          return {
            key: ct.key,
            label: ct.label,
            cards: sorted,
            subGroups: showHeaders ? subGroups : null,
          };
        }

        return {
          key: ct.key,
          label: ct.label,
          cards: sorted,
        };
      })
      .filter((section) => section.cards.length > 0);
  }, [schema, selectedFaction]);

  // Total card count across all sections
  const totalCards = useMemo(() => sections.reduce((sum, s) => sum + s.cards.length, 0), [sections]);

  if (!selectedFaction) return null;

  return (
    <div
      className="mobile-faction-page"
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      {/* Header */}
      <div className="mobile-faction-header">
        <h1 className="mobile-faction-title">{selectedFaction?.name}</h1>
      </div>

      {/* Browse All Cards Button */}
      <button className="mobile-faction-units-button" onClick={handleBrowseAll}>
        <List size={18} />
        <span>Browse All Cards</span>
        <span className="units-count">{totalCards}</span>
        <ChevronRight size={18} />
      </button>

      {/* Keyword Glossary Button */}
      {glossaryCount > 0 && (
        <button className="mobile-faction-units-button" onClick={handleBrowseGlossary}>
          <BookOpen size={18} />
          <span>Keyword Glossary</span>
          <span className="units-count">{glossaryCount}</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Card Type Sections */}
      {sections.map((section) => (
        <div key={section.key} className="custom-faction-section">
          <div className="mobile-faction-section-header">
            <span>{section.label}</span>
            <span className="custom-faction-section-count">{section.cards.length}</span>
          </div>
          {section.subGroups ? (
            section.subGroups.map((subGroup) => (
              <div key={subGroup.key || "__uncategorized__"} className="custom-faction-subcategory">
                <div className="custom-faction-subcategory-header">
                  <span>{subGroup.label}</span>
                  <span className="custom-faction-subcategory-count">{subGroup.cards.length}</span>
                </div>
                <div className="custom-faction-card-list">
                  {subGroup.cards.map((card) => (
                    <button key={card.id} className="custom-faction-card-item" onClick={() => handleCardClick(card)}>
                      <span className="custom-faction-card-name">{card.name}</span>
                      <ChevronRight size={16} className="custom-faction-card-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="custom-faction-card-list">
              {section.cards.map((card) => (
                <button key={card.id} className="custom-faction-card-item" onClick={() => handleCardClick(card)}>
                  <span className="custom-faction-card-name">{card.name}</span>
                  <ChevronRight size={16} className="custom-faction-card-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="custom-faction-empty">
          <p>No cards yet. Add cards using the Datasource Editor on desktop.</p>
        </div>
      )}
    </div>
  );
};
