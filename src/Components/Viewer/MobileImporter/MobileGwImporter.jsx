import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft, AlertCircle, Check, X, AlertTriangle, Star, Sparkles, CheckCircle } from "lucide-react";
import { message } from "../../Toast/message";
import { MobileModal } from "../Mobile/MobileModal";
import { useMobileList } from "../useMobileList";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import {
  parseGwAppText,
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
  matchEnhancementsToFaction,
} from "../../../Helpers/gwAppImport.helpers";
import "./MobileImporter.shared.css";
import "./MobileGwImporter.css";

// Status icon component
const StatusIcon = ({ status }) => {
  if (status === "exact" || status === "confident") {
    return (
      <span className="mi-status-icon matched">
        <Check size={12} />
      </span>
    );
  }
  if (status === "ambiguous") {
    return (
      <span className="mi-status-icon ambiguous">
        <AlertTriangle size={12} />
      </span>
    );
  }
  return (
    <span className="mi-status-icon unmatched">
      <X size={12} />
    </span>
  );
};

// Unit card component for review step
const UnitCard = ({ unit, onSkip, onSelect, datasheets }) => {
  const [showSelect, setShowSelect] = useState(false);

  return (
    <div className={`mi-unit-card ${unit.skipped ? "skipped" : ""}`}>
      <div className="mi-unit-main">
        <StatusIcon status={unit.matchStatus} />
        <div className="mi-unit-content">
          <div className="mi-unit-header">
            <span className="mi-unit-name">{unit.originalName}</span>
            <span className="mi-unit-points">{unit.points} pts</span>
          </div>
          {unit.models > 1 && <span className="mi-unit-size">{unit.models} models</span>}
          <div className="mi-unit-badges">
            {unit.isWarlord && (
              <span className="mi-badge warlord">
                <Star size={10} /> Warlord
              </span>
            )}
            {unit.enhancement && (
              <span className="mi-badge enhancement">
                <Sparkles size={10} /> {unit.enhancement.name} (+
                {unit.enhancement.cost})
              </span>
            )}
          </div>
          {unit.matchedCard && !unit.skipped && (
            <div className="mi-unit-match">
              <span className="mi-match-arrow">→</span>
              <span className="mi-match-name">{unit.matchedCard.name}</span>
            </div>
          )}
          {(unit.matchStatus === "ambiguous" || unit.matchStatus === "none") &&
            !unit.skipped &&
            datasheets?.length > 0 && (
              <>
                {showSelect ? (
                  <select
                    className="mi-unit-select"
                    value={unit.matchedCard?.id || ""}
                    onChange={(e) => {
                      onSelect(e.target.value);
                      setShowSelect(false);
                    }}
                    autoFocus
                    onBlur={() => setShowSelect(false)}>
                    <option value="">Select unit...</option>
                    {datasheets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button className="mi-change-btn" onClick={() => setShowSelect(true)}>
                    {unit.matchedCard ? "Change" : "Select unit"}
                  </button>
                )}
              </>
            )}
        </div>
      </div>
      <button className={`mi-skip-btn ${unit.skipped ? "skipped" : ""}`} onClick={onSkip}>
        {unit.skipped ? "Undo" : "Skip"}
      </button>
    </div>
  );
};

export const MobileGwImporter = ({ isOpen, onClose }) => {
  const { dataSource } = useDataSourceStorage();
  const { createListWithCards } = useMobileList();

  // Wizard state
  const [step, setStep] = useState(1); // 1=paste, 2=review, 3=confirm
  const [gwAppText, setGwAppText] = useState("");
  const [error, setError] = useState(null);
  const [parsedDetachment, setParsedDetachment] = useState(null);
  const [matchedFaction, setMatchedFaction] = useState(null);
  const [units, setUnits] = useState([]);
  const [listName, setListName] = useState("");

  const resetState = () => {
    setStep(1);
    setGwAppText("");
    setError(null);
    setParsedDetachment(null);
    setMatchedFaction(null);
    setUnits([]);
    setListName("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Parse
  const handleParse = () => {
    setError(null);

    const parsed = parseGwAppText(gwAppText);

    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    if (!parsed.units.length) {
      setError("No units found in the list");
      return;
    }

    setParsedDetachment(parsed.detachment);

    // Match faction
    const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
    setMatchedFaction(factionMatch.matchedFaction);

    // Set list name
    const categoryName = parsed.listName || parsed.factionName || "Imported List";
    setListName(categoryName);

    // Match units
    if (factionMatch.matchedFaction) {
      let matchedUnits = matchUnitsToDatasheets(parsed.units, factionMatch.matchedFaction, dataSource?.data || []);
      matchedUnits = matchEnhancementsToFaction(matchedUnits, factionMatch.matchedFaction, parsed.detachment);
      setUnits(matchedUnits);
    } else {
      setUnits(
        parsed.units.map((u) => ({
          ...u,
          matchStatus: "none",
          matchedCard: null,
          alternatives: [],
        })),
      );
    }

    setStep(2);
  };

  // Step 2: Handle faction change
  const handleFactionChange = (factionId) => {
    const faction = dataSource?.data?.find((f) => f.id === factionId);
    if (faction) {
      setMatchedFaction(faction);
      const parsed = parseGwAppText(gwAppText);
      let matchedUnits = matchUnitsToDatasheets(parsed.units, faction, dataSource?.data || []);
      matchedUnits = matchEnhancementsToFaction(matchedUnits, faction, parsedDetachment);
      setUnits(matchedUnits);
    }
  };

  // Step 2: Handle unit selection
  const handleUnitSelect = (unitIndex, datasheetId) => {
    const datasheet = matchedFaction?.datasheets?.find((d) => d.id === datasheetId);
    if (datasheet) {
      setUnits((prev) =>
        prev.map((unit, idx) =>
          idx === unitIndex ? { ...unit, matchedCard: datasheet, matchStatus: "confident", skipped: false } : unit,
        ),
      );
    }
  };

  // Step 2: Handle skip
  const handleSkip = (unitIndex) => {
    setUnits((prev) => prev.map((unit, idx) => (idx === unitIndex ? { ...unit, skipped: !unit.skipped } : unit)));
  };

  // Step 3: Import
  const handleImport = () => {
    const importableUnits = getImportableUnits(units);

    if (!importableUnits.length) {
      setError("No units to import");
      return;
    }

    // Build cards array
    const cardsToImport = importableUnits.map((unit) => {
      let card = { ...unit.matchedCard };
      card.uuid = uuidv4();
      card.isCustom = true;

      // Build points object
      const points = {
        cost: unit.points - (unit.enhancement?.cost || 0),
        models: unit.models || 1,
      };

      // Get enhancement if present
      let enhancement = null;
      if (unit.enhancement) {
        enhancement = {
          name: unit.enhancement.name,
          cost: unit.enhancement.cost || 0,
          ...(unit.enhancement.matched ? unit.enhancement : {}),
        };
        // Set detachment from matched enhancement
        if (unit.detachment) {
          card.detachment = unit.detachment;
        }
      }

      // Filter weapons
      if (unit.weapons?.length) {
        card = filterCardWeapons(card, unit.weapons);
      }

      return { card, points, enhancement, isWarlord: unit.isWarlord };
    });

    // Create list with all cards atomically
    createListWithCards(listName || "Imported List", cardsToImport);

    message.success(`Imported ${importableUnits.length} units to "${listName || "Imported List"}"`);
    handleClose();
  };

  const matchCounts = countMatchStatuses(units);
  const importableCount = getImportableUnits(units).length;

  const getTitle = () => {
    if (step === 1) return "Import Army List";
    if (step === 2) return "Review Units";
    return "Ready to Import";
  };

  return (
    <MobileModal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="mi-container">
        {/* Step 1: Paste */}
        {step === 1 && (
          <div className="mi-step mgw-step-paste">
            <p className="mi-description">Paste your army list from the official Warhammer 40,000 app</p>

            <textarea
              className="mgw-textarea"
              value={gwAppText}
              onChange={(e) => setGwAppText(e.target.value)}
              placeholder={
                "Blood Angels\n\nCHARACTERS\n\nCaptain (120 pts)\n• Warlord\n\nBATTLELINE\n\nAssault Intercessors (75 pts)"
              }
            />

            {error && (
              <div className="mi-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button className="mi-primary-btn" onClick={handleParse} disabled={!gwAppText.trim()}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="mi-step mgw-step-review">
            <button className="mi-back-btn" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> Back
            </button>

            {/* Faction selector */}
            <div className="mi-faction-row">
              <label className="mi-faction-label">Faction</label>
              <div className="mi-faction-select-wrapper">
                <StatusIcon status={matchedFaction ? "exact" : "none"} />
                <select
                  className="mi-faction-select"
                  value={matchedFaction?.id || ""}
                  onChange={(e) => handleFactionChange(e.target.value)}>
                  {!matchedFaction && <option value="">Select faction...</option>}
                  {dataSource?.data?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit list */}
            <div className="mi-unit-list">
              {units.map((unit, idx) => (
                <UnitCard
                  key={idx}
                  unit={unit}
                  onSkip={() => handleSkip(idx)}
                  onSelect={(datasheetId) => handleUnitSelect(idx, datasheetId)}
                  datasheets={matchedFaction?.datasheets}
                />
              ))}
            </div>

            {/* Summary bar */}
            <div className="mi-summary">
              <span className="mi-summary-item ready">
                <Check size={14} /> {matchCounts.ready}
              </span>
              {matchCounts.needsReview > 0 && (
                <span className="mi-summary-item review">
                  <AlertTriangle size={14} /> {matchCounts.needsReview}
                </span>
              )}
              {matchCounts.notMatched > 0 && (
                <span className="mi-summary-item unmatched">
                  <X size={14} /> {matchCounts.notMatched}
                </span>
              )}
              {matchCounts.skipped > 0 && (
                <span className="mi-summary-item skipped">{matchCounts.skipped} skipped</span>
              )}
            </div>

            <button className="mi-primary-btn" onClick={() => setStep(3)} disabled={importableCount === 0}>
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="mi-step mi-step-confirm">
            <button className="mi-back-btn" onClick={() => setStep(2)}>
              <ChevronLeft size={16} /> Back
            </button>

            <div className="mi-confirm-icon">
              <CheckCircle size={48} />
            </div>

            <h2 className="mi-confirm-title">Ready to Import</h2>
            <p className="mi-confirm-subtitle">
              {importableCount} unit{importableCount !== 1 ? "s" : ""} will be added to your list
            </p>

            <div className="mi-name-field">
              <label className="mi-name-label">List Name</label>
              <input
                type="text"
                className="mi-name-input"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="My Army List"
              />
            </div>

            <button className="mi-primary-btn" onClick={handleImport} disabled={importableCount === 0}>
              Import {importableCount} Unit{importableCount !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </MobileModal>
  );
};
