import { useMemo } from "react";
import { ArrowLeft, LayoutGrid, SortAsc } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { getTargetArray } from "../../Helpers/customDatasource.helpers";
import "./MobileFactionUnits.css";

export const MobileCustomFactionUnits = () => {
  const navigate = useNavigate();
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const schema = dataSource?.schema;
  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");

  const [viewMode, setViewMode] = useState(settings.mobileUnitsViewMode || "grouped");

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateSettings({ ...settings, mobileUnitsViewMode: mode });
  };

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleCardClick = (card) => {
    const cardSlug = card.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/${cardSlug}`);
  };

  // Collect all cards grouped by card type
  const { grouped, allCards } = useMemo(() => {
    if (!schema?.cardTypes || !selectedFaction) return { grouped: [], allCards: [] };

    const groups = [];
    const all = [];

    schema.cardTypes.forEach((ct) => {
      const arrayName = getTargetArray(ct.key) || getTargetArray(ct.baseType);
      const cards =
        selectedFaction[arrayName]?.filter((c) => c.cardType === ct.key || c.cardType === ct.baseType) || [];

      if (cards.length > 0) {
        const sorted = [...cards].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        groups.push({ key: ct.key, label: ct.label, cards: sorted });
        all.push(...sorted);
      }
    });

    return { grouped: groups, allCards: all };
  }, [schema, selectedFaction]);

  const alphabetical = useMemo(
    () => [...allCards].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [allCards],
  );

  if (!selectedFaction) return null;

  return (
    <div
      className="faction-units-page"
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      {/* Header */}
      <div className="faction-units-header">
        <button className="faction-units-back" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="faction-units-title">{selectedFaction.name}</h1>
        <div className="faction-units-count">{allCards.length} cards</div>
      </div>

      {/* View Toggle */}
      <div className="faction-units-toggle">
        <button
          className={`faction-units-toggle-btn ${viewMode === "grouped" ? "active" : ""}`}
          onClick={() => handleViewModeChange("grouped")}>
          <LayoutGrid size={16} />
          <span>Grouped</span>
        </button>
        <button
          className={`faction-units-toggle-btn ${viewMode === "alphabetical" ? "active" : ""}`}
          onClick={() => handleViewModeChange("alphabetical")}>
          <SortAsc size={16} />
          <span>A-Z</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="faction-units-list">
        {viewMode === "grouped" ? (
          <>
            {grouped.map((group) => (
              <div key={group.key} className="faction-units-section">
                <div className="faction-units-section-header">
                  <span>{group.label}</span>
                  <span className="faction-units-section-count">{group.cards.length}</span>
                </div>
                {group.cards.map((card) => (
                  <button key={card.id} className="faction-units-item" onClick={() => handleCardClick(card)}>
                    <span className="faction-units-item-name">{card.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="faction-units-section">
            {alphabetical.map((card) => (
              <button key={card.id} className="faction-units-item" onClick={() => handleCardClick(card)}>
                <span className="faction-units-item-name">{card.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
