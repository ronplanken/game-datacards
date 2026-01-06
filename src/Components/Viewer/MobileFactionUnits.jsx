import { useState } from "react";
import { ArrowLeft, LayoutGrid, SortAsc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import "./MobileFactionUnits.css";

// Group units by role
const groupUnitsByRole = (datasheets) => {
  return (datasheets || []).reduce(
    (groups, unit) => {
      if (unit.keywords?.includes("Character")) {
        groups.characters.push(unit);
      } else if (unit.keywords?.includes("Battleline")) {
        groups.battleline.push(unit);
      } else {
        groups.other.push(unit);
      }
      return groups;
    },
    { characters: [], battleline: [], other: [] }
  );
};

// Get lowest points cost for a unit
const getLowestPoints = (unit) => {
  const activePoints = unit.points?.filter((p) => p.active);
  if (!activePoints || activePoints.length === 0) return null;
  return Math.min(...activePoints.map((p) => Number(p.cost)));
};

// Unit list item component
const UnitItem = ({ unit, factionSlug, onClick }) => {
  const points = getLowestPoints(unit);

  return (
    <button className="faction-units-item" onClick={onClick}>
      <span className="faction-units-item-name">{unit.name}</span>
      {points !== null && <span className="faction-units-item-points">{points} pts</span>}
    </button>
  );
};

// Section header component
const SectionHeader = ({ title, count }) => (
  <div className="faction-units-section-header">
    <span>{title}</span>
    <span className="faction-units-section-count">{count}</span>
  </div>
);

export const MobileFactionUnits = () => {
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

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleUnitClick = (unit) => {
    const unitSlug = unit.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/${unitSlug}`);
  };

  // Get units data
  const datasheets = selectedFaction?.datasheets || [];
  const groupedUnits = groupUnitsByRole(datasheets);
  const alphabeticalUnits = [...datasheets].sort((a, b) => a.name.localeCompare(b.name));

  if (!selectedFaction) {
    return null;
  }

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
        <div className="faction-units-count">{datasheets.length} units</div>
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

      {/* Units List */}
      <div className="faction-units-list">
        {viewMode === "grouped" ? (
          <>
            {groupedUnits.characters.length > 0 && (
              <div className="faction-units-section">
                <SectionHeader title="Characters" count={groupedUnits.characters.length} />
                {groupedUnits.characters
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <UnitItem
                      key={unit.id}
                      unit={unit}
                      factionSlug={factionSlug}
                      onClick={() => handleUnitClick(unit)}
                    />
                  ))}
              </div>
            )}

            {groupedUnits.battleline.length > 0 && (
              <div className="faction-units-section">
                <SectionHeader title="Battleline" count={groupedUnits.battleline.length} />
                {groupedUnits.battleline
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <UnitItem
                      key={unit.id}
                      unit={unit}
                      factionSlug={factionSlug}
                      onClick={() => handleUnitClick(unit)}
                    />
                  ))}
              </div>
            )}

            {groupedUnits.other.length > 0 && (
              <div className="faction-units-section">
                <SectionHeader title="Other" count={groupedUnits.other.length} />
                {groupedUnits.other
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((unit) => (
                    <UnitItem
                      key={unit.id}
                      unit={unit}
                      factionSlug={factionSlug}
                      onClick={() => handleUnitClick(unit)}
                    />
                  ))}
              </div>
            )}
          </>
        ) : (
          <div className="faction-units-section">
            {alphabeticalUnits.map((unit) => (
              <UnitItem key={unit.id} unit={unit} factionSlug={factionSlug} onClick={() => handleUnitClick(unit)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
