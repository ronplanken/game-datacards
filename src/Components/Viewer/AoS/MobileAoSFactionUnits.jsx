import { useState } from "react";
import { ArrowLeft, LayoutGrid, SortAsc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import "./MobileAoS.css";

// Group warscrolls by keywords
const groupWarscrollsByRole = (warscrolls) => {
  return (warscrolls || []).reduce(
    (groups, unit) => {
      const keywords = unit.keywords || [];
      if (keywords.some((k) => k.toLowerCase().includes("hero"))) {
        groups.heroes.push(unit);
      } else if (keywords.some((k) => k.toLowerCase().includes("battleline"))) {
        groups.battleline.push(unit);
      } else {
        groups.other.push(unit);
      }
      return groups;
    },
    { heroes: [], battleline: [], other: [] }
  );
};

// Unit list item component
const WarscrollItem = ({ warscroll, onClick }) => {
  const points = warscroll.points;

  return (
    <button className="aos-units-item" onClick={onClick}>
      <span className="aos-units-item-name">{warscroll.name}</span>
      {points && <span className="aos-units-item-points">{points} pts</span>}
    </button>
  );
};

// Section header component
const SectionHeader = ({ title, count }) => (
  <div className="aos-units-section-header">
    <span>{title}</span>
    <span className="aos-units-section-count">{count}</span>
  </div>
);

export const MobileAoSFactionUnits = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  // View mode: "grouped" or "alphabetical"
  const [viewMode, setViewMode] = useState(settings.mobileUnitsViewMode || "grouped");

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateSettings({ ...settings, mobileUnitsViewMode: mode });
  };

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
  const grandAlliance = selectedFaction?.grandAlliance?.toLowerCase() || "order";

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleWarscrollClick = (warscroll) => {
    const unitSlug = warscroll.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/${unitSlug}`);
  };

  // Get warscrolls data
  const warscrolls = selectedFaction?.warscrolls || [];
  const groupedUnits = groupWarscrollsByRole(warscrolls);
  const alphabeticalUnits = [...warscrolls].sort((a, b) => a.name.localeCompare(b.name));

  if (!selectedFaction) {
    return null;
  }

  return (
    <div className={`aos-units-page ${grandAlliance}`}>
      {/* Header */}
      <div className="aos-units-header">
        <button className="aos-units-back" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="aos-units-title">{selectedFaction.name}</h1>
        <div className="aos-units-count">{warscrolls.length} warscrolls</div>
      </div>

      {/* View Toggle */}
      <div className="aos-units-toggle">
        <button
          className={`aos-units-toggle-btn ${viewMode === "grouped" ? "active" : ""}`}
          onClick={() => handleViewModeChange("grouped")}>
          <LayoutGrid size={16} />
          <span>Grouped</span>
        </button>
        <button
          className={`aos-units-toggle-btn ${viewMode === "alphabetical" ? "active" : ""}`}
          onClick={() => handleViewModeChange("alphabetical")}>
          <SortAsc size={16} />
          <span>A-Z</span>
        </button>
      </div>

      {/* Units List */}
      <div className="aos-units-list">
        {viewMode === "grouped" ? (
          <>
            {groupedUnits.heroes.length > 0 && (
              <div className="aos-units-section">
                <SectionHeader title="Heroes" count={groupedUnits.heroes.length} />
                {groupedUnits.heroes
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <WarscrollItem key={unit.id} warscroll={unit} onClick={() => handleWarscrollClick(unit)} />
                  ))}
              </div>
            )}

            {groupedUnits.battleline.length > 0 && (
              <div className="aos-units-section">
                <SectionHeader title="Battleline" count={groupedUnits.battleline.length} />
                {groupedUnits.battleline
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <WarscrollItem key={unit.id} warscroll={unit} onClick={() => handleWarscrollClick(unit)} />
                  ))}
              </div>
            )}

            {groupedUnits.other.length > 0 && (
              <div className="aos-units-section">
                <SectionHeader title="Other" count={groupedUnits.other.length} />
                {groupedUnits.other
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <WarscrollItem key={unit.id} warscroll={unit} onClick={() => handleWarscrollClick(unit)} />
                  ))}
              </div>
            )}
          </>
        ) : (
          <div className="aos-units-section">
            {alphabeticalUnits.map((unit) => (
              <WarscrollItem key={unit.id} warscroll={unit} onClick={() => handleWarscrollClick(unit)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
