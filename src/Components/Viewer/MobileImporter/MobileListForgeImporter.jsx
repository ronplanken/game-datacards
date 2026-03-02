import React, { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  AlertCircle,
  Check,
  X,
  AlertTriangle,
  Star,
  Sparkles,
  CheckCircle,
  Upload,
  File,
  Trash2,
  Shield,
  Search,
  FileText,
} from "lucide-react";
import { message } from "../../Toast/message";
import { MobileModal } from "../Mobile/MobileModal";
import { useMobileList } from "../useMobileList";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useUmami } from "../../../Hooks/useUmami";
import {
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  matchEnhancementsToFaction,
  buildCardsFromUnits,
} from "../../../Helpers/gwAppImport.helpers";
import {
  validateListforgeJson,
  parseListforgeRoster,
  matchDetachment,
  buildCardFromSelection,
  buildCoreAbilitySet,
} from "../../../Helpers/listforgeImport.helpers";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import "./MobileImporter.shared.css";
import "./MobileListForgeImporter.css";

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
const UnitCard = ({ unit, onSkip, onSelect, datasheets, importMode }) => {
  const [showSelect, setShowSelect] = useState(false);

  const rangedCount = unit.matchedCard?.rangedWeapons?.reduce((sum, w) => sum + (w.profiles?.length || 0), 0) || 0;
  const meleeCount = unit.matchedCard?.meleeWeapons?.reduce((sum, w) => sum + (w.profiles?.length || 0), 0) || 0;
  const statCount = unit.matchedCard?.stats?.length || 0;

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
          {importMode === "direct" && unit.matchedCard && !unit.skipped && (
            <span className="mlf-direct-info">
              {statCount} stat line{statCount !== 1 ? "s" : ""}, {rangedCount + meleeCount} weapon
              {rangedCount + meleeCount !== 1 ? "s" : ""}
            </span>
          )}
          {importMode !== "direct" && unit.matchedCard && !unit.skipped && (
            <div className="mi-unit-match">
              <span className="mi-match-arrow">→</span>
              <span className="mi-match-name">{unit.matchedCard.name}</span>
            </div>
          )}
          {importMode !== "direct" &&
            (unit.matchStatus === "ambiguous" || unit.matchStatus === "none") &&
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

export const MobileListForgeImporter = ({ isOpen, onClose }) => {
  const { dataSource } = useDataSourceStorage();
  const { createListWithCards } = useMobileList();
  const { trackEvent } = useUmami();
  const fileInputRef = useRef(null);

  // Wizard state
  const [step, setStep] = useState(1); // 1=upload, 2=review, 3=confirm
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);
  const [matchedFaction, setMatchedFaction] = useState(null);
  const [detachment, setDetachment] = useState(null);
  const [parsedDetachment, setParsedDetachment] = useState(null);
  const [units, setUnits] = useState([]);
  const [parsedUnits, setParsedUnits] = useState([]);
  const [listName, setListName] = useState("");
  const [importMode, setImportMode] = useState("match");

  const coreAbilityNames = useMemo(() => buildCoreAbilitySet(dataSource?.data), [dataSource?.data]);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setFileInfo(null);
    setJsonText("");
    setError(null);
    setMatchedFaction(null);
    setDetachment(null);
    setParsedDetachment(null);
    setUnits([]);
    setParsedUnits([]);
    setListName("");
    setImportMode("match");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Process data (from file or paste)
  const processData = (data, fileName) => {
    const validation = validateListforgeJson(data);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      if (fileName) {
        setFileInfo({ name: fileName, valid: false });
      }
      setFile(null);
      return;
    }

    setFile(data);
    setError(null);
    if (fileName) {
      setFileInfo({ name: `${fileName} [${data.name || "Roster"}]`, valid: true });
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFileInfo(null);
    setFile(null);

    if (!selectedFile.name.endsWith(".json")) {
      setError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        processData(data, selectedFile.name);
      } catch {
        setError("Invalid JSON file");
        setFileInfo({ name: selectedFile.name, valid: false });
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleClearFile = () => {
    setFile(null);
    setFileInfo(null);
    setError(null);
    setJsonText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseJsonText = () => {
    setFileInfo(null);
    setError(null);
    setFile(null);

    try {
      const data = JSON.parse(jsonText);
      processData(data, null);
    } catch {
      setError("Invalid JSON text");
    }
  };

  const handleParse = () => {
    if (!file) return;

    const parsed = parseListforgeRoster(file);

    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    if (!parsed.units.length) {
      setError("No units found in the roster");
      return;
    }

    setParsedDetachment(parsed.detachmentName);
    setParsedUnits(parsed.units);

    const name = parsed.rosterName || parsed.factionName || "Imported List";
    setListName(name);

    const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
    setMatchedFaction(factionMatch.matchedFaction);

    if (factionMatch.matchedFaction?.detachments) {
      const detachmentMatch = matchDetachment(parsed.detachmentName, factionMatch.matchedFaction.detachments);
      setDetachment(detachmentMatch.matchedDetachment);
    }

    if (importMode === "direct") {
      const factionId = factionMatch.matchedFaction?.id || null;
      const directUnits = parsed.units.map((unit) => ({
        ...unit,
        matchedCard: buildCardFromSelection(unit._selection, unit, coreAbilityNames, factionId),
        matchStatus: "exact",
      }));
      setUnits(directUnits);
    } else {
      if (factionMatch.matchedFaction) {
        let matchedUnits = matchUnitsToDatasheets(parsed.units, factionMatch.matchedFaction, dataSource?.data || []);
        matchedUnits = matchEnhancementsToFaction(matchedUnits, factionMatch.matchedFaction, parsed.detachmentName);
        setUnits(matchedUnits);
      } else {
        setUnits(parsed.units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
      }
    }

    setStep(2);
  };

  // Step 2: Handle faction change
  const handleFactionChange = (factionId) => {
    const faction = dataSource?.data?.find((f) => f.id === factionId);
    if (faction) {
      setMatchedFaction(faction);
      if (faction.detachments) {
        const detachmentMatch = matchDetachment(parsedDetachment, faction.detachments);
        setDetachment(detachmentMatch.matchedDetachment);
      } else {
        setDetachment(null);
      }

      if (importMode !== "direct") {
        let matchedUnits = matchUnitsToDatasheets(parsedUnits, faction, dataSource?.data || []);
        matchedUnits = matchEnhancementsToFaction(matchedUnits, faction, parsedDetachment);
        setUnits(matchedUnits);
      }
    }
  };

  const handleDetachmentChange = (detachmentName) => {
    setDetachment(detachmentName);
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

  // Step 2: Handle mode toggle
  const handleImportModeChange = (mode) => {
    setImportMode(mode);
    if (parsedUnits.length) {
      if (mode === "direct") {
        const directUnits = parsedUnits.map((unit) => ({
          ...unit,
          matchedCard: buildCardFromSelection(unit._selection, unit, coreAbilityNames, matchedFaction?.id),
          matchStatus: "exact",
        }));
        setUnits(directUnits);
      } else {
        if (matchedFaction) {
          let matchedUnits = matchUnitsToDatasheets(parsedUnits, matchedFaction, dataSource?.data || []);
          matchedUnits = matchEnhancementsToFaction(matchedUnits, matchedFaction, parsedDetachment);
          setUnits(matchedUnits);
        } else {
          setUnits(parsedUnits.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
        }
      }
    }
  };

  // Step 3: Import
  const handleImport = () => {
    const importableUnits = getImportableUnits(units);

    if (!importableUnits.length) {
      setError("No units to import");
      return;
    }

    const cards = buildCardsFromUnits(importableUnits);

    const cardsToImport = cards.map((card, idx) => {
      const unit = importableUnits[idx];
      const points = {
        cost: unit.points - (unit.enhancement?.cost || 0),
        models: unit.models || 1,
      };

      let enhancement = null;
      if (unit.enhancement) {
        enhancement = {
          name: unit.enhancement.name,
          cost: unit.enhancement.cost || 0,
          ...(unit.enhancement.matched ? unit.enhancement : {}),
        };
      }

      return { card, points, enhancement, isWarlord: unit.isWarlord };
    });

    createListWithCards(listName || "Imported List", cardsToImport);

    trackEvent("import-listforge", { faction: matchedFaction?.name, unitCount: cards.length, mode: importMode });
    message.success(`Imported ${cards.length} units to "${listName || "Imported List"}"`);
    handleClose();
  };

  const matchCounts = countMatchStatuses(units);
  const importableCount = getImportableUnits(units).length;

  const getTitle = () => {
    if (step === 1) return "Import from List Forge";
    if (step === 2) return "Review Units";
    return "Ready to Import";
  };

  return (
    <MobileModal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="mi-container">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="mi-step">
            <p className="mi-description">
              Import an army list exported from List Forge. Upload a JSON file or paste the JSON content.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {!file && (
              <>
                <button className="mlf-file-btn" onClick={() => fileInputRef.current?.click()} type="button">
                  <Upload size={20} />
                  <span>Choose JSON file</span>
                </button>

                <div className="mlf-or-divider">or</div>

                <textarea
                  className="mlf-textarea"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Paste List Forge JSON export here..."
                />

                {jsonText.trim() && (
                  <button className="mi-primary-btn" onClick={handleParseJsonText}>
                    Parse JSON
                  </button>
                )}
              </>
            )}

            {fileInfo && (
              <div className="mlf-file-info">
                <File size={16} />
                <span>{fileInfo.name}</span>
                <button onClick={handleClearFile} type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {file && !fileInfo && (
              <div className="mlf-file-info">
                <File size={16} />
                <span>{file.name || "List Forge Roster"}</span>
                <button onClick={handleClearFile} type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {error && (
              <div className="mi-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {file && (
              <button className="mi-primary-btn" onClick={handleParse}>
                Continue
              </button>
            )}
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="mi-step">
            <button className="mi-back-btn" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> Back
            </button>

            {/* Mode toggle */}
            <div className="mlf-mode-toggle">
              <button
                className={`mlf-mode-option ${importMode === "match" ? "active" : ""}`}
                onClick={() => handleImportModeChange("match")}
                type="button">
                <Search size={14} />
                Match
              </button>
              <button
                className={`mlf-mode-option ${importMode === "direct" ? "active" : ""}`}
                onClick={() => handleImportModeChange("direct")}
                type="button">
                <FileText size={14} />
                Direct
              </button>
            </div>

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

            {/* Detachment selector */}
            {matchedFaction?.detachments?.length > 0 && (
              <div className="mlf-detachment-row">
                <label className="mi-faction-label">
                  <Shield size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  Detachment
                </label>
                <div className="mi-faction-select-wrapper">
                  <StatusIcon status={detachment ? "exact" : "none"} />
                  <select
                    className="mi-faction-select"
                    value={detachment || ""}
                    onChange={(e) => handleDetachmentChange(e.target.value)}>
                    <option value="">Select detachment...</option>
                    {matchedFaction.detachments.map((d, i) => {
                      const name = getDetachmentName(d);
                      return (
                        <option key={i} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Unit list */}
            <div className="mi-unit-list">
              {units.map((unit, idx) => (
                <UnitCard
                  key={idx}
                  unit={unit}
                  onSkip={() => handleSkip(idx)}
                  onSelect={(datasheetId) => handleUnitSelect(idx, datasheetId)}
                  datasheets={matchedFaction?.datasheets}
                  importMode={importMode}
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
