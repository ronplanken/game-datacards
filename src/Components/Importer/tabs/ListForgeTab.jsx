import { useMemo, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { Select } from "antd";
import { Trash2, File, Inbox, Check, X, Shield } from "lucide-react";
import { message } from "../../Toast/message";
import { v4 as uuidv4 } from "uuid";
import Fuse from "fuse.js";
import {
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
} from "../../../Helpers/gwAppImport.helpers";
import {
  validateListforgeJson,
  parseListforgeRoster,
  matchDetachment,
  buildCardFromSelection,
  buildCoreAbilitySet,
} from "../../../Helpers/listforgeImport.helpers";

const matchEnhancementsToFaction = (units, faction, listDetachment) => {
  if (!faction?.enhancements?.length) return units;

  return units.map((unit) => {
    if (!unit.enhancement) return unit;

    const enhancements = faction.enhancements;
    let factionEnhancement = null;

    if (listDetachment) {
      factionEnhancement = enhancements.find(
        (e) =>
          e.name.toLowerCase() === unit.enhancement.name.toLowerCase() &&
          e.detachment?.toLowerCase() === listDetachment.toLowerCase(),
      );
    }

    if (!factionEnhancement) {
      factionEnhancement = enhancements.find((e) => e.name.toLowerCase() === unit.enhancement.name.toLowerCase());
    }

    if (!factionEnhancement) {
      const enhancementFuse = new Fuse(enhancements, {
        keys: ["name"],
        threshold: 0.4,
        includeScore: true,
      });
      const results = enhancementFuse.search(unit.enhancement.name);
      if (results.length > 0) {
        factionEnhancement = results[0].item;
      }
    }

    if (factionEnhancement) {
      return {
        ...unit,
        enhancement: {
          ...unit.enhancement,
          ...factionEnhancement,
          cost: unit.enhancement.cost || factionEnhancement.cost,
          matched: true,
        },
        detachment: factionEnhancement.detachment,
      };
    }

    return unit;
  });
};

const buildCardsFromUnits = (units) => {
  return units.map((unit) => {
    let card = { ...unit.matchedCard };
    card.uuid = uuidv4();
    card.isCustom = true;

    if (unit.points) {
      card.unitSize = {
        ...(card.unitSize || {}),
        cost: unit.points - (unit.enhancement?.cost || 0),
        models: unit.models || 1,
      };
    }

    if (unit.isWarlord) {
      card.isWarlord = true;
    }

    if (unit.enhancement) {
      card.selectedEnhancement = {
        name: unit.enhancement.name,
        cost: unit.enhancement.cost || 0,
        ...(unit.enhancement.matched ? unit.enhancement : {}),
      };
      if (unit.detachment) {
        card.detachment = unit.detachment;
      }
    }

    if (unit.weapons?.length && !card._directRead) {
      card = filterCardWeapons(card, unit.weapons);
    }

    return card;
  });
};
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import { ImportReviewPanel } from "../ImportReviewPanel";

const filterOption = (input, option) => option?.label?.toLowerCase().includes(input.toLowerCase());

export const ListForgeTab = ({ dataSource, settings, importCategory, onClose, footerNode }) => {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [phase, setPhase] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [parsedFaction, setParsedFaction] = useState(null);
  const [matchedFaction, setMatchedFaction] = useState(null);
  const [units, setUnits] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [detachment, setDetachment] = useState(null);
  const [parsedDetachment, setParsedDetachment] = useState(null);
  const [importMode, setImportMode] = useState("match");

  const factionOptions = dataSource?.data?.map((f) => ({ value: f.id, label: f.name })) || [];
  const coreAbilityNames = useMemo(() => buildCoreAbilitySet(dataSource?.data), [dataSource?.data]);

  const processData = (data, fileName) => {
    const validation = validateListforgeJson(data);
    if (!validation.isValid) {
      setFileError(validation.errors.join(", "));
      if (fileName) {
        setFileInfo({ name: fileName, valid: false });
      }
      setFile(null);
      return;
    }

    setFile(data);
    setFileError(null);
    if (fileName) {
      setFileInfo({ name: `${fileName} [${data.name || "Roster"}]`, valid: true });
    }
  };

  const processFile = (uploadedFile) => {
    setFileError(null);
    setFileInfo(null);
    setFile(null);

    if (!uploadedFile.name.endsWith(".json")) {
      setFileError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        processData(data, uploadedFile.name);
      } catch (e) {
        setFileError("Invalid JSON file");
        setFileInfo({ name: uploadedFile.name, valid: false });
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleClearFile = () => {
    setFile(null);
    setFileInfo(null);
    setFileError(null);
    setJsonText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseJsonText = () => {
    setFileInfo(null);
    setFileError(null);
    setFile(null);

    try {
      const data = JSON.parse(jsonText);
      processData(data, null);
    } catch (e) {
      setFileError("Invalid JSON text");
    }
  };

  const handleParse = () => {
    if (!file) return;

    const parsed = parseListforgeRoster(file);

    if (parsed.error) {
      setFileError(parsed.error);
      return;
    }

    if (!parsed.units.length) {
      setFileError("No units found in the roster");
      return;
    }

    setParsedFaction(parsed.factionName);
    setParsedDetachment(parsed.detachmentName);

    const name = parsed.rosterName || parsed.factionName || "Imported List";
    setCategoryName(name);

    if (importMode === "direct") {
      // Match faction first for theming, but don't fail if not found
      const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
      setMatchedFaction(factionMatch.matchedFaction);
      if (factionMatch.matchedFaction?.detachments) {
        const detachmentMatch = matchDetachment(parsed.detachmentName, factionMatch.matchedFaction.detachments);
        setDetachment(detachmentMatch.matchedDetachment);
      }

      // Direct mode: build cards from export data, no datasource matching
      const factionId = factionMatch.matchedFaction?.id || null;
      const directUnits = parsed.units.map((unit) => ({
        ...unit,
        matchedCard: buildCardFromSelection(unit._selection, unit, coreAbilityNames, factionId),
        matchStatus: "exact",
      }));
      setUnits(directUnits);
    } else {
      // Match mode: existing behavior
      const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
      setMatchedFaction(factionMatch.matchedFaction);

      if (factionMatch.matchedFaction?.detachments) {
        const detachmentMatch = matchDetachment(parsed.detachmentName, factionMatch.matchedFaction.detachments);
        setDetachment(detachmentMatch.matchedDetachment);
      }

      if (factionMatch.matchedFaction) {
        let matchedUnits = matchUnitsToDatasheets(parsed.units, factionMatch.matchedFaction, dataSource?.data || []);
        matchedUnits = matchEnhancementsToFaction(matchedUnits, factionMatch.matchedFaction, parsed.detachmentName);
        setUnits(matchedUnits);
      } else {
        setUnits(parsed.units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
      }
    }

    setPhase("review");
  };

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

      // In direct mode, faction change is for theming only — don't re-match units
      if (importMode !== "direct") {
        const parsed = parseListforgeRoster(file);
        let matchedUnits = matchUnitsToDatasheets(parsed.units, faction, dataSource?.data || []);
        matchedUnits = matchEnhancementsToFaction(matchedUnits, faction, parsed.detachmentName);
        setUnits(matchedUnits);
      }
    }
  };

  const handleDetachmentChange = (detachmentName) => {
    setDetachment(detachmentName);
  };

  const handleUnitChange = (unitIndex, datasheetId) => {
    const datasheet = matchedFaction?.datasheets?.find((d) => d.id === datasheetId);
    if (datasheet) {
      setUnits((prev) =>
        prev.map((unit, idx) =>
          idx === unitIndex ? { ...unit, matchedCard: datasheet, matchStatus: "confident", skipped: false } : unit,
        ),
      );
    }
  };

  const handleUnitSkip = (unitIndex) => {
    setUnits((prev) => prev.map((unit, idx) => (idx === unitIndex ? { ...unit, skipped: !unit.skipped } : unit)));
  };

  const handleImportModeChange = (mode) => {
    setImportMode(mode);
    // If already in review phase, re-parse with new mode
    if (phase === "review" && file) {
      const parsed = parseListforgeRoster(file);
      if (parsed.error || !parsed.units.length) return;

      if (mode === "direct") {
        const directUnits = parsed.units.map((unit) => ({
          ...unit,
          matchedCard: buildCardFromSelection(unit._selection, unit, coreAbilityNames, matchedFaction?.id),
          matchStatus: "exact",
        }));
        setUnits(directUnits);
      } else {
        if (matchedFaction) {
          let matchedUnits = matchUnitsToDatasheets(parsed.units, matchedFaction, dataSource?.data || []);
          matchedUnits = matchEnhancementsToFaction(matchedUnits, matchedFaction, parsed.detachmentName);
          setUnits(matchedUnits);
        } else {
          setUnits(parsed.units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
        }
      }
    }
  };

  const handleBack = () => {
    setPhase("upload");
    setFileError(null);
  };

  const handleImport = () => {
    const importableUnits = getImportableUnits(units);

    if (!importableUnits.length) {
      message.error("No units to import");
      return;
    }

    const cards = buildCardsFromUnits(importableUnits);

    const category = {
      uuid: uuidv4(),
      name: categoryName || "Imported List",
      type: "list",
      dataSource: settings.selectedDataSource,
      factionId: matchedFaction?.id || null,
      factionName: matchedFaction?.name || null,
      detachment: detachment || null,
      cards,
    };

    importCategory(category);
    message.success(`Imported ${cards.length} units to "${category.name}"`);
    onClose();
  };

  const matchCounts = countMatchStatuses(units);
  const importableCount = getImportableUnits(units).length;

  const detachmentRow = matchedFaction?.detachments?.length > 0 && (
    <div className="gw-import-faction-row">
      <span className="gw-import-faction-label">
        <Shield size={12} /> Detachment
      </span>
      <div className="gw-import-faction-value">
        <span className={`gw-import-unit-status ${detachment ? "exact" : "none"}`}>
          {detachment ? <Check size={12} /> : <X size={12} />}
        </span>
        <Select
          className="gw-import-faction-select"
          value={detachment}
          onChange={handleDetachmentChange}
          size="small"
          placeholder="Select detachment..."
          showSearch
          filterOption={filterOption}
          options={matchedFaction.detachments.map((d) => ({
            value: getDetachmentName(d),
            label: getDetachmentName(d),
          }))}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Upload Phase */}
      {phase === "upload" && (
        <div className="gw-import-container">
          <p className="import-export-description">
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
              <div
                className={`import-dropzone ${dragging ? "dragging" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}>
                <div className="import-dropzone-icon">
                  <Inbox size={24} />
                </div>
                <p className="import-dropzone-text">Click or drag a JSON file to upload</p>
                <p className="import-dropzone-hint">Only .json files exported from List Forge</p>
              </div>

              <div className="ie-import-divider">
                <span>or</span>
              </div>

              <textarea
                className="gw-import-textarea"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste List Forge JSON export here..."
              />
              {jsonText.trim() && (
                <div className="gw-import-actions">
                  <button className="gw-import-parse-btn" onClick={handleParseJsonText}>
                    Load JSON
                  </button>
                </div>
              )}
            </>
          )}

          {fileInfo && (
            <div className={`import-file-item ${fileInfo.valid ? "success" : "error"}`}>
              <File size={14} className="import-file-icon" />
              <span className="import-file-name">{fileInfo.name}</span>
              <button className="import-file-remove" onClick={handleClearFile}>
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {file && !fileInfo && (
            <div className="import-file-item success">
              <File size={14} className="import-file-icon" />
              <span className="import-file-name">{file.name || "List Forge Roster"}</span>
              <button className="import-file-remove" onClick={handleClearFile}>
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {fileError && <p className="import-file-error-text">{fileError}</p>}

          {file && (
            <div className="gw-import-actions">
              <button className="gw-import-parse-btn" onClick={handleParse}>
                Parse Roster
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Phase */}
      {phase === "review" && (
        <ImportReviewPanel
          parsedFaction={parsedFaction}
          matchedFaction={matchedFaction}
          units={units}
          categoryName={categoryName}
          matchCounts={matchCounts}
          importableCount={importableCount}
          factionOptions={factionOptions}
          onFactionChange={handleFactionChange}
          onUnitChange={handleUnitChange}
          onUnitSkip={handleUnitSkip}
          onCategoryNameChange={setCategoryName}
          onBack={handleBack}
          backLabel="Back to upload"
          extraRows={detachmentRow}
          importMode={importMode}
          onImportModeChange={handleImportModeChange}
        />
      )}

      {/* Footer button rendered via portal into parent's footer slot */}
      {phase === "review" &&
        footerNode &&
        ReactDOM.createPortal(
          <button className="ie-btn-primary" onClick={handleImport} disabled={importableCount === 0}>
            Import {importableCount} Unit{importableCount !== 1 ? "s" : ""}
          </button>,
          footerNode,
        )}
    </>
  );
};
