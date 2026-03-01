import { Select, Segmented } from "antd";
import { Check, X, AlertTriangle, ChevronLeft, Star, Sparkles } from "lucide-react";

const filterOption = (input, option) => option?.label?.toLowerCase().includes(input.toLowerCase());

export const ImportReviewPanel = ({
  parsedFaction,
  matchedFaction,
  units,
  categoryName,
  matchCounts,
  importableCount,
  factionOptions,
  onFactionChange,
  onUnitChange,
  onUnitSkip,
  onCategoryNameChange,
  onBack,
  backLabel,
  extraRows,
  importMode,
  onImportModeChange,
}) => {
  const isDirectMode = importMode === "direct";

  return (
    <div className="gw-import-container">
      <button className="gw-import-back-btn" onClick={onBack}>
        <ChevronLeft size={14} /> {backLabel}
      </button>

      {/* Import Mode Toggle (only shown when props are provided) */}
      {onImportModeChange && (
        <div className="gw-import-mode-row">
          <Segmented
            value={importMode || "match"}
            onChange={onImportModeChange}
            options={[
              { value: "match", label: "Match to datasource" },
              { value: "direct", label: "Read from export" },
            ]}
            size="small"
            block
          />
        </div>
      )}

      {/* Faction Row */}
      <div className="gw-import-faction-row">
        <span className="gw-import-faction-label">{isDirectMode ? "Faction (optional)" : "Faction"}</span>
        <div className="gw-import-faction-value">
          {matchedFaction ? (
            <>
              {!isDirectMode && (
                <span
                  className={`gw-import-unit-status ${parsedFaction === matchedFaction.name ? "exact" : "confident"}`}>
                  <Check size={12} />
                </span>
              )}
              <Select
                className="gw-import-faction-select"
                value={matchedFaction.id}
                onChange={onFactionChange}
                size="small"
                showSearch
                filterOption={filterOption}
                options={factionOptions}
              />
            </>
          ) : (
            <>
              {!isDirectMode && (
                <span className="gw-import-unit-status none">
                  <X size={12} />
                </span>
              )}
              <Select
                className="gw-import-faction-select"
                placeholder="Select faction..."
                onChange={onFactionChange}
                size="small"
                showSearch
                filterOption={filterOption}
                options={factionOptions}
              />
            </>
          )}
        </div>
      </div>

      {/* Extra rows (e.g., detachment selector) */}
      {extraRows}

      {/* Unit List */}
      {units.length > 0 && (
        <div className="gw-import-unit-list">
          {units.map((unit, idx) => (
            <div key={idx} className={`gw-import-unit-item ${unit.skipped ? "skipped" : ""}`}>
              <span className={`gw-import-unit-status ${isDirectMode ? "exact" : unit.matchStatus || "none"}`}>
                {isDirectMode || unit.matchStatus === "exact" || unit.matchStatus === "confident" ? (
                  <Check size={12} />
                ) : unit.matchStatus === "ambiguous" ? (
                  <AlertTriangle size={12} />
                ) : (
                  <X size={12} />
                )}
              </span>
              <div className="gw-import-unit-content">
                <div className="gw-import-unit-header">
                  <span className="gw-import-unit-name">{unit.originalName}</span>
                  {unit.alliedFactionName && (
                    <span className="gw-import-unit-faction-badge">{unit.alliedFactionName}</span>
                  )}
                  <span className="gw-import-unit-meta">
                    {unit.models > 1 && <span className="gw-import-unit-size">{unit.models}x</span>}
                    <span className="gw-import-unit-points">{unit.points ? `${unit.points} pts` : "? pts"}</span>
                  </span>
                </div>
                <div className="gw-import-unit-details">
                  {unit.isWarlord && (
                    <span className="gw-import-unit-badge warlord">
                      <Star size={10} /> Warlord
                    </span>
                  )}
                  {unit.enhancement && (
                    <span className="gw-import-unit-badge enhancement">
                      <Sparkles size={10} /> {unit.enhancement.name} (+{unit.enhancement.cost} pts)
                    </span>
                  )}
                </div>
                {isDirectMode && unit.matchedCard && !unit.skipped && (
                  <div className="gw-import-unit-direct-info">
                    <span className="gw-import-unit-match-label">
                      {unit.matchedCard.stats?.length || 0} stat line
                      {(unit.matchedCard.stats?.length || 0) !== 1 ? "s" : ""}
                      {" / "}
                      {(unit.matchedCard.rangedWeapons?.[0]?.profiles?.length || 0) +
                        (unit.matchedCard.meleeWeapons?.[0]?.profiles?.length || 0)}{" "}
                      weapon
                      {(unit.matchedCard.rangedWeapons?.[0]?.profiles?.length || 0) +
                        (unit.matchedCard.meleeWeapons?.[0]?.profiles?.length || 0) !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                )}
                {!isDirectMode && unit.matchedCard && !unit.skipped && (
                  <div className="gw-import-unit-match">
                    <span className="gw-import-unit-match-label">Matched: </span>
                    <span className="gw-import-unit-match-name">{unit.matchedCard.name}</span>
                  </div>
                )}
                {!isDirectMode &&
                  (unit.matchStatus === "ambiguous" || unit.matchStatus === "none") &&
                  !unit.skipped &&
                  matchedFaction && (
                    <Select
                      className="gw-import-unit-select"
                      size="small"
                      value={unit.matchedCard?.id}
                      placeholder="Select unit..."
                      onChange={(value) => onUnitChange(idx, value)}
                      showSearch
                      filterOption={filterOption}
                      options={matchedFaction.datasheets?.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                    />
                  )}
              </div>
              <div className="gw-import-unit-actions">
                <button
                  className={`gw-import-skip-btn ${unit.skipped ? "skipped" : ""}`}
                  onClick={() => onUnitSkip(idx)}>
                  {unit.skipped ? "Undo" : "Skip"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {units.length > 0 && (
        <div className="gw-import-summary">
          {isDirectMode ? (
            <span className="gw-import-summary-item ready">
              <Check size={14} /> {importableCount} ready
            </span>
          ) : (
            <>
              <span className="gw-import-summary-item ready">
                <Check size={14} /> {matchCounts.ready} ready
              </span>
              {matchCounts.needsReview > 0 && (
                <span className="gw-import-summary-item review">
                  <AlertTriangle size={14} /> {matchCounts.needsReview} needs review
                </span>
              )}
              {matchCounts.notMatched > 0 && (
                <span className="gw-import-summary-item unmatched">
                  <X size={14} /> {matchCounts.notMatched} not matched
                </span>
              )}
            </>
          )}
          {matchCounts.skipped > 0 && (
            <span className="gw-import-summary-item skipped">{matchCounts.skipped} skipped</span>
          )}
        </div>
      )}

      {/* Category Name */}
      <div className="gw-import-category-row">
        <span className="gw-import-category-label">Category name:</span>
        <input
          type="text"
          className="gw-import-category-input"
          value={categoryName}
          onChange={(e) => onCategoryNameChange(e.target.value)}
          placeholder="My Army List"
        />
      </div>
    </div>
  );
};
