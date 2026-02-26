import {
  Trash2,
  File,
  Inbox,
  Upload,
  Link,
  Download,
  CheckCircle,
  AlertCircle,
  Settings,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  Star,
  Sparkles,
  Users,
  FileJson,
  Gamepad2,
  Database,
} from "lucide-react";
import { Button, Select } from "antd";
import { message } from "../Toast/message";
import { Tooltip } from "../Tooltip/Tooltip";
import { compare } from "compare-versions";
import React, { useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { v4 as uuidv4 } from "uuid";
import { validateCustomDatasource, countDatasourceCards } from "../../Helpers/customDatasource.helpers";
import {
  parseGwAppText,
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
} from "../../Helpers/gwAppImport.helpers";
import Fuse from "fuse.js";
import "./ImportExport.css";

const modalRoot = document.getElementById("modal-root");

export const Importer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("json");

  // GDC JSON tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Datasource tab state
  const [dsUrl, setDsUrl] = useState("");
  const [dsFetching, setDsFetching] = useState(false);
  const [dsUrlError, setDsUrlError] = useState(null);
  const [dsFileInfo, setDsFileInfo] = useState(null);
  const [dsFileError, setDsFileError] = useState(null);
  const [dsPreview, setDsPreview] = useState(null);
  const [dsDragging, setDsDragging] = useState(false);
  const dsFileInputRef = useRef(null);

  // Post-import state
  const [showActivationPrompt, setShowActivationPrompt] = useState(false);
  const [importedDatasource, setImportedDatasource] = useState(null);

  // GW 40k App tab state
  const [gwAppText, setGwAppText] = useState("");
  const [gwAppPhase, setGwAppPhase] = useState("paste"); // "paste" or "review"
  const [gwAppError, setGwAppError] = useState(null);
  const [gwAppParsedFaction, setGwAppParsedFaction] = useState(null);
  const [gwAppMatchedFaction, setGwAppMatchedFaction] = useState(null);
  const [gwAppUnits, setGwAppUnits] = useState([]);
  const [gwAppCategoryName, setGwAppCategoryName] = useState("");

  const { importCategory } = useCardStorage();
  const { importCustomDatasource, dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const handleClose = () => {
    setIsModalVisible(false);
    setActiveTab("json");
    // Reset GDC JSON state
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
    // Reset Datasource state
    setDsUrl("");
    setDsUrlError(null);
    setDsFileInfo(null);
    setDsFileError(null);
    setDsPreview(null);
    setShowActivationPrompt(false);
    setImportedDatasource(null);
    // Reset GW 40k App state
    setGwAppText("");
    setGwAppPhase("paste");
    setGwAppError(null);
    setGwAppParsedFaction(null);
    setGwAppMatchedFaction(null);
    setGwAppUnits([]);
    setGwAppCategoryName("");
  };

  // Check if GW 40k App tab should be enabled
  const isGwAppEnabled = settings.selectedDataSource === "40k-10e";

  // ===========================================
  // GDC JSON Tab Handlers
  // ===========================================

  const handleImport = () => {
    if (!uploadFile) return;

    const subCategories = uploadFile.subCategories || [];

    if (compare(uploadFile.version, "0.4.0", "=")) {
      importCategory({
        uuid: uuidv4(),
        name: "Imported Cards",
        cards: uploadFile.cards,
      });
    }
    if (compare(uploadFile.version, "0.5.0", ">=") && compare(uploadFile.version, "1.2.0", "<=")) {
      importCategory({
        ...uploadFile.category,
        cards: uploadFile.category.cards.map((card) => {
          return { ...card, source: "40k" };
        }),
      });
    }
    if (compare(uploadFile.version, "1.3.0", ">=")) {
      const importedSubCategories = subCategories.map((sub) => ({
        ...sub,
        uuid: uuidv4(),
        cards: sub.cards?.map((card) => ({ ...card, uuid: uuidv4() })),
      }));
      importCategory(uploadFile.category, importedSubCategories);
    }

    handleClose();
  };

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedJson = JSON.parse(event.target.result);
        if (importedJson.website && importedJson.website === "https://game-datacards.eu") {
          setFileInfo({
            name: `${file.name} [ver. ${importedJson.version}]`,
            size: file.size,
          });
          setUploadFile(importedJson);
          setFileError(false);
        } else {
          setFileInfo({
            name: file.name,
            size: file.size,
          });
          setUploadFile(null);
          setFileError(true);
        }
      } catch (e) {
        setFileInfo({
          name: file.name,
          size: file.size,
        });
        setUploadFile(null);
        setFileError(true);
      }
    };

    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".json")) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===========================================
  // Datasource Tab Handlers
  // ===========================================

  const handleFetchUrl = async () => {
    if (!dsUrl.trim()) {
      setDsUrlError("Please enter a URL");
      return;
    }

    setDsFetching(true);
    setDsUrlError(null);
    setDsPreview(null);
    setDsFileInfo(null);
    setDsFileError(null);

    try {
      const response = await fetch(dsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const validation = validateCustomDatasource(data);

      if (!validation.isValid) {
        setDsUrlError(validation.errors.join(", "));
        return;
      }

      setDsPreview({ data, sourceType: "url", sourceUrl: dsUrl });
    } catch (error) {
      setDsUrlError(error.message || "Failed to fetch datasource");
    } finally {
      setDsFetching(false);
    }
  };

  const processDsFile = (file) => {
    setDsFileError(null);
    setDsFileInfo(null);
    setDsPreview(null);
    setDsUrlError(null);

    if (!file.name.endsWith(".json")) {
      setDsFileError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const validation = validateCustomDatasource(data);

        if (!validation.isValid) {
          setDsFileError(validation.errors.join(", "));
          setDsFileInfo({ name: file.name, size: file.size, valid: false });
          return;
        }

        setDsFileInfo({ name: file.name, size: file.size, valid: true });
        setDsPreview({ data, sourceType: "local" });
      } catch (e) {
        setDsFileError("Invalid JSON file");
        setDsFileInfo({ name: file.name, size: file.size, valid: false });
      }
    };
    reader.readAsText(file);
  };

  const handleDsFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processDsFile(file);
    }
  };

  const handleDsDrop = (e) => {
    e.preventDefault();
    setDsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processDsFile(file);
    }
  };

  const handleDsDragOver = (e) => {
    e.preventDefault();
    setDsDragging(true);
  };

  const handleDsDragLeave = () => {
    setDsDragging(false);
  };

  const handleClearDsFile = () => {
    setDsFileInfo(null);
    setDsFileError(null);
    setDsPreview(null);
    setDsUrl("");
    setDsUrlError(null);
    if (dsFileInputRef.current) {
      dsFileInputRef.current.value = "";
    }
  };

  const handleImportDatasource = async () => {
    if (!dsPreview) return;

    const result = await importCustomDatasource(
      dsPreview.data,
      dsPreview.sourceType,
      dsPreview.sourceType === "url" ? dsPreview.sourceUrl : undefined,
    );

    if (result.success) {
      setImportedDatasource({
        id: result.id,
        name: dsPreview.data.name,
      });
      setShowActivationPrompt(true);
    } else {
      message.error(result.error || "Failed to import datasource");
    }
  };

  const handleActivateDatasource = () => {
    if (importedDatasource) {
      updateSettings({
        ...settings,
        selectedDataSource: importedDatasource.id,
      });
      message.success(`Switched to "${importedDatasource.name}"`);
    }
    handleClose();
  };

  const handleKeepCurrent = () => {
    message.success(`Datasource "${importedDatasource?.name}" imported successfully`);
    handleClose();
  };

  // ===========================================
  // GW 40k App Tab Handlers
  // ===========================================

  // Match enhancements to faction data and update units with cost/detachment
  // listDetachment: the detachment from the list header (e.g., "Nightmare Hunt")
  const matchEnhancementsToFaction = (units, faction, listDetachment) => {
    if (!faction?.enhancements?.length) return units;

    return units.map((unit) => {
      if (!unit.enhancement) return unit;

      const enhancements = faction.enhancements;
      let factionEnhancement = null;

      // 1. First try exact match with BOTH name AND detachment (if detachment is known)
      if (listDetachment) {
        factionEnhancement = enhancements.find(
          (e) =>
            e.name.toLowerCase() === unit.enhancement.name.toLowerCase() &&
            e.detachment?.toLowerCase() === listDetachment.toLowerCase(),
        );
      }

      // 2. If no detachment-specific match, try just name match
      if (!factionEnhancement) {
        factionEnhancement = enhancements.find((e) => e.name.toLowerCase() === unit.enhancement.name.toLowerCase());
      }

      // 3. If still no match, try Fuse.js
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

  const handleParseGwApp = () => {
    setGwAppError(null);

    const parsed = parseGwAppText(gwAppText);

    if (parsed.error) {
      setGwAppError(parsed.error);
      return;
    }

    if (!parsed.units.length) {
      setGwAppError("No units found in the list");
      return;
    }

    setGwAppParsedFaction(parsed.factionName);

    // Try to match faction
    const factionMatch = matchFaction(parsed.factionName, dataSource?.data || []);
    setGwAppMatchedFaction(factionMatch.matchedFaction);

    // Use list name if available, otherwise faction name
    const categoryName = parsed.listName || parsed.factionName || "Imported List";

    // If we have a faction, match units (include all factions for allied unit matching)
    if (factionMatch.matchedFaction) {
      let matchedUnits = matchUnitsToDatasheets(parsed.units, factionMatch.matchedFaction, dataSource?.data || []);
      // Also match enhancements to get cost and detachment
      matchedUnits = matchEnhancementsToFaction(matchedUnits, factionMatch.matchedFaction, parsed.detachment);
      setGwAppUnits(matchedUnits);
      setGwAppCategoryName(categoryName);
    } else {
      // Set units without matches for now
      setGwAppUnits(parsed.units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] })));
      setGwAppCategoryName(categoryName);
    }

    setGwAppPhase("review");
  };

  const handleGwAppFactionChange = (factionId) => {
    const faction = dataSource?.data?.find((f) => f.id === factionId);
    if (faction) {
      setGwAppMatchedFaction(faction);
      // Re-match units with new faction (include all factions for allied unit matching)
      const parsed = parseGwAppText(gwAppText);
      let matchedUnits = matchUnitsToDatasheets(parsed.units, faction, dataSource?.data || []);
      // Also match enhancements to get cost and detachment
      matchedUnits = matchEnhancementsToFaction(matchedUnits, faction, parsed.detachment);
      setGwAppUnits(matchedUnits);
    }
  };

  const handleGwAppUnitChange = (unitIndex, datasheetId) => {
    const datasheet = gwAppMatchedFaction?.datasheets?.find((d) => d.id === datasheetId);
    if (datasheet) {
      setGwAppUnits((prev) =>
        prev.map((unit, idx) =>
          idx === unitIndex ? { ...unit, matchedCard: datasheet, matchStatus: "confident", skipped: false } : unit,
        ),
      );
    }
  };

  const handleGwAppUnitSkip = (unitIndex) => {
    setGwAppUnits((prev) => prev.map((unit, idx) => (idx === unitIndex ? { ...unit, skipped: !unit.skipped } : unit)));
  };

  const handleGwAppBack = () => {
    setGwAppPhase("paste");
    setGwAppError(null);
  };

  const handleGwAppImport = () => {
    const importableUnits = getImportableUnits(gwAppUnits);

    if (!importableUnits.length) {
      message.error("No units to import");
      return;
    }

    // Create cards from matched units
    const cards = importableUnits.map((unit) => {
      let card = { ...unit.matchedCard };
      card.uuid = uuidv4();
      card.isCustom = true;

      // Set unit size and cost
      if (unit.points) {
        card.unitSize = {
          ...(card.unitSize || {}),
          cost: unit.points - (unit.enhancement?.cost || 0),
          models: unit.models || 1,
        };
      }

      // Set warlord
      if (unit.isWarlord) {
        card.isWarlord = true;
      }

      // Set enhancement (already matched during review phase)
      if (unit.enhancement) {
        card.selectedEnhancement = {
          name: unit.enhancement.name,
          cost: unit.enhancement.cost || 0,
          ...(unit.enhancement.matched ? unit.enhancement : {}),
        };
        // Set detachment from matched enhancement
        if (unit.detachment) {
          card.detachment = unit.detachment;
        }
      }

      // Filter weapons based on imported list (hide non-selected weapons)
      if (unit.weapons?.length) {
        card = filterCardWeapons(card, unit.weapons);
      }

      return card;
    });

    // Create category
    const category = {
      uuid: uuidv4(),
      name: gwAppCategoryName || "Imported List",
      type: "list",
      dataSource: settings.selectedDataSource,
      cards,
    };

    importCategory(category);
    message.success(`Imported ${cards.length} units to "${category.name}"`);
    handleClose();
  };

  const gwAppMatchCounts = countMatchStatuses(gwAppUnits);
  const gwAppImportableCount = getImportableUnits(gwAppUnits).length;

  return (
    <>
      {isModalVisible &&
        ReactDOM.createPortal(
          <div className="import-export-modal-overlay" onClick={handleClose}>
            <div className="import-export-modal" onClick={(e) => e.stopPropagation()}>
              <div className="import-export-modal-header">
                <span className="import-export-modal-title">
                  <Upload size={18} />
                  Import
                </span>
                <button className="import-export-modal-close" onClick={handleClose}>
                  <X size={18} />
                </button>
              </div>
              <div className="import-export-modal-body">
                {/* Sidebar */}
                <nav className="import-export-sidebar">
                  <div
                    className={`import-export-nav-item ${activeTab === "json" ? "active" : ""}`}
                    onClick={() => setActiveTab("json")}>
                    <FileJson size={16} className="import-export-nav-icon" />
                    <span>GDC JSON</span>
                  </div>
                  <Tooltip content={!isGwAppEnabled ? "Only available for 10th Edition 40k" : ""} placement="right">
                    <div
                      className={`import-export-nav-item ${activeTab === "gwapp" ? "active" : ""} ${
                        !isGwAppEnabled ? "disabled" : ""
                      }`}
                      onClick={() => isGwAppEnabled && setActiveTab("gwapp")}>
                      <Gamepad2 size={16} className="import-export-nav-icon" />
                      <span>GW 40k App</span>
                    </div>
                  </Tooltip>
                  <div
                    className={`import-export-nav-item ${activeTab === "datasource" ? "active" : ""}`}
                    onClick={() => setActiveTab("datasource")}>
                    <Database size={16} className="import-export-nav-icon" />
                    <span>Datasource</span>
                  </div>
                </nav>

                {/* Content */}
                <div className="import-export-content">
                  {/* GDC JSON Tab */}
                  {activeTab === "json" && (
                    <>
                      <p className="import-export-description">
                        Import a category that was previously exported from GameDatacards.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                      <div
                        className={`import-dropzone ${isDragging ? "dragging" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}>
                        <div className="import-dropzone-icon">
                          <Inbox size={24} />
                        </div>
                        <p className="import-dropzone-text">Click or drag a file to this area to upload</p>
                        <p className="import-dropzone-hint">Support for a single file upload. Only .json files.</p>
                      </div>

                      {fileInfo && (
                        <div className={`import-file-item ${fileError ? "error" : "success"}`}>
                          <File size={14} className="import-file-icon" />
                          <span className="import-file-name">{fileInfo.name}</span>
                          <span className="import-file-size">{Math.round(fileInfo.size / 1024)}KiB</span>
                          <button className="import-file-remove" onClick={handleRemoveFile}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      {fileError && (
                        <p className="import-file-error-text">This file cannot be read as a Game Datacards export.</p>
                      )}
                    </>
                  )}

                  {/* GW 40k App Tab */}
                  {activeTab === "gwapp" && gwAppPhase === "paste" && (
                    <div className="gw-import-container">
                      <p className="import-export-description">
                        Paste your army list from the GW Warhammer 40k app or any compatible text format.
                      </p>
                      <textarea
                        className="gw-import-textarea"
                        value={gwAppText}
                        onChange={(e) => setGwAppText(e.target.value)}
                        placeholder={`Blood Angels\n\nCHARACTERS\n\nCaptain (120 pts)\n   • Warlord\n\nBATTLELINE\n\nAssault Intercessors 5x (75 pts)\n\nCreated with https://game-datacards.eu`}
                      />
                      {gwAppError && (
                        <div className="gw-import-error">
                          <AlertCircle size={14} />
                          <span>{gwAppError}</span>
                        </div>
                      )}
                      <div className="gw-import-actions">
                        <button className="gw-import-parse-btn" onClick={handleParseGwApp} disabled={!gwAppText.trim()}>
                          Parse List
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "gwapp" && gwAppPhase === "review" && (
                    <div className="gw-import-container">
                      <button className="gw-import-back-btn" onClick={handleGwAppBack}>
                        <ChevronLeft size={14} /> Back to paste
                      </button>

                      {/* Faction Row */}
                      <div className="gw-import-faction-row">
                        <span className="gw-import-faction-label">Faction</span>
                        <div className="gw-import-faction-value">
                          {gwAppMatchedFaction ? (
                            <>
                              <span
                                className={`gw-import-unit-status ${
                                  gwAppParsedFaction === gwAppMatchedFaction.name ? "exact" : "confident"
                                }`}>
                                <Check size={12} />
                              </span>
                              <Select
                                className="gw-import-faction-select"
                                value={gwAppMatchedFaction.id}
                                onChange={handleGwAppFactionChange}
                                size="small"
                                showSearch
                                filterOption={(input, option) =>
                                  option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                                options={dataSource?.data?.map((f) => ({ value: f.id, label: f.name })) || []}
                              />
                            </>
                          ) : (
                            <>
                              <span className="gw-import-unit-status none">
                                <X size={12} />
                              </span>
                              <Select
                                className="gw-import-faction-select"
                                placeholder="Select faction..."
                                onChange={handleGwAppFactionChange}
                                size="small"
                                showSearch
                                filterOption={(input, option) =>
                                  option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                                options={dataSource?.data?.map((f) => ({ value: f.id, label: f.name })) || []}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Unit List */}
                      {gwAppUnits.length > 0 && (
                        <div className="gw-import-unit-list">
                          {gwAppUnits.map((unit, idx) => (
                            <div key={idx} className={`gw-import-unit-item ${unit.skipped ? "skipped" : ""}`}>
                              <span className={`gw-import-unit-status ${unit.matchStatus || "none"}`}>
                                {unit.matchStatus === "exact" || unit.matchStatus === "confident" ? (
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
                                    <span className="gw-import-unit-points">
                                      {unit.points ? `${unit.points} pts` : "? pts"}
                                    </span>
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
                                {unit.matchedCard && !unit.skipped && (
                                  <div className="gw-import-unit-match">
                                    <span className="gw-import-unit-match-label">Matched: </span>
                                    <span className="gw-import-unit-match-name">{unit.matchedCard.name}</span>
                                  </div>
                                )}
                                {(unit.matchStatus === "ambiguous" || unit.matchStatus === "none") &&
                                  !unit.skipped &&
                                  gwAppMatchedFaction && (
                                    <Select
                                      className="gw-import-unit-select"
                                      size="small"
                                      value={unit.matchedCard?.id}
                                      placeholder="Select unit..."
                                      onChange={(value) => handleGwAppUnitChange(idx, value)}
                                      showSearch
                                      filterOption={(input, option) =>
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                      }
                                      options={gwAppMatchedFaction.datasheets?.map((d) => ({
                                        value: d.id,
                                        label: d.name,
                                      }))}
                                    />
                                  )}
                              </div>
                              <div className="gw-import-unit-actions">
                                <button
                                  className={`gw-import-skip-btn ${unit.skipped ? "skipped" : ""}`}
                                  onClick={() => handleGwAppUnitSkip(idx)}>
                                  {unit.skipped ? "Undo" : "Skip"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      {gwAppUnits.length > 0 && (
                        <div className="gw-import-summary">
                          <span className="gw-import-summary-item ready">
                            <Check size={14} /> {gwAppMatchCounts.ready} ready
                          </span>
                          {gwAppMatchCounts.needsReview > 0 && (
                            <span className="gw-import-summary-item review">
                              <AlertTriangle size={14} /> {gwAppMatchCounts.needsReview} needs review
                            </span>
                          )}
                          {gwAppMatchCounts.notMatched > 0 && (
                            <span className="gw-import-summary-item unmatched">
                              <X size={14} /> {gwAppMatchCounts.notMatched} not matched
                            </span>
                          )}
                          {gwAppMatchCounts.skipped > 0 && (
                            <span className="gw-import-summary-item skipped">{gwAppMatchCounts.skipped} skipped</span>
                          )}
                        </div>
                      )}

                      {/* Category Name */}
                      <div className="gw-import-category-row">
                        <span className="gw-import-category-label">Category name:</span>
                        <input
                          type="text"
                          className="gw-import-category-input"
                          value={gwAppCategoryName}
                          onChange={(e) => setGwAppCategoryName(e.target.value)}
                          placeholder="My Army List"
                        />
                      </div>
                    </div>
                  )}

                  {/* Datasource Tab */}
                  {activeTab === "datasource" && !showActivationPrompt && (
                    <div className="ie-datasource-import">
                      <input
                        type="file"
                        ref={dsFileInputRef}
                        accept=".json"
                        onChange={handleDsFileSelect}
                        style={{ display: "none" }}
                      />

                      {/* Show inputs only when no preview exists */}
                      {!dsPreview && (
                        <>
                          <p className="import-export-description">
                            Import a custom datasource from a URL or local file. Datasources provide card data for
                            custom factions or game systems.
                          </p>

                          {/* URL Input */}
                          <div className="ie-ds-url-section">
                            <div className="ie-ds-url-group">
                              <div className="ie-ds-url-input-wrapper">
                                <Link size={14} className="ie-ds-url-icon" />
                                <input
                                  type="text"
                                  className="ie-ds-url-input"
                                  placeholder="https://example.com/datasource.json"
                                  value={dsUrl}
                                  onChange={(e) => setDsUrl(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                                />
                              </div>
                              <button
                                className="ie-ds-fetch-btn"
                                onClick={handleFetchUrl}
                                disabled={dsFetching || !dsUrl.trim()}>
                                {dsFetching ? <span className="ie-loading-spinner" /> : <Download size={14} />}
                                Fetch
                              </button>
                            </div>
                            {dsUrlError && (
                              <div className="ie-ds-error">
                                <AlertCircle size={14} />
                                <span>{dsUrlError}</span>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="ie-import-divider">
                            <span>or</span>
                          </div>

                          {/* File Upload */}
                          <div
                            className={`import-dropzone ${dsDragging ? "dragging" : ""}`}
                            onClick={() => dsFileInputRef.current?.click()}
                            onDrop={handleDsDrop}
                            onDragOver={handleDsDragOver}
                            onDragLeave={handleDsDragLeave}>
                            <div className="import-dropzone-icon">
                              <Inbox size={24} />
                            </div>
                            <p className="import-dropzone-text">Click or drag a file to upload</p>
                            <p className="import-dropzone-hint">Only .json datasource files</p>
                          </div>

                          {dsFileError && <p className="import-file-error-text">{dsFileError}</p>}
                        </>
                      )}

                      {/* Show file info and preview when data is loaded */}
                      {dsPreview && (
                        <div className="ie-ds-file-selected">
                          <div className={`ie-ds-file-item success`}>
                            <span className="ie-ds-file-icon">
                              <CheckCircle size={16} />
                            </span>
                            <div className="ie-ds-file-details">
                              <span className="ie-ds-file-name">{dsFileInfo?.name || dsPreview.data.name}</span>
                              <span className="ie-ds-file-meta">
                                {dsPreview.sourceType === "url" ? "External URL" : "Local File"}
                              </span>
                            </div>
                            <button className="ie-ds-file-remove" onClick={handleClearDsFile} title="Remove">
                              <X size={14} />
                            </button>
                          </div>

                          <div className="ie-ds-preview">
                            <div className="ie-ds-preview-header">
                              <CheckCircle size={16} className="ie-ds-preview-icon" />
                              <span>Ready to import</span>
                            </div>
                            <div className="ie-ds-preview-details">
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Name</span>
                                <span className="ie-ds-preview-value">{dsPreview.data.name}</span>
                              </div>
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Version</span>
                                <span className="ie-ds-preview-value">{dsPreview.data.version}</span>
                              </div>
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Cards</span>
                                <span className="ie-ds-preview-value">{countDatasourceCards(dsPreview.data)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activation Prompt */}
                  {activeTab === "datasource" && showActivationPrompt && (
                    <div className="ie-ds-activation">
                      <div className="ie-ds-activation-icon">
                        <CheckCircle size={48} />
                      </div>
                      <h3 className="ie-ds-activation-title">Datasource Imported</h3>
                      <p className="ie-ds-activation-name">&quot;{importedDatasource?.name}&quot;</p>
                      <p className="ie-ds-activation-text">Would you like to switch to this datasource now?</p>
                      <div className="ie-ds-activation-buttons">
                        <button className="ie-btn" onClick={handleKeepCurrent}>
                          Keep Current
                        </button>
                        <button className="ie-btn-primary" onClick={handleActivateDatasource}>
                          Switch Now
                        </button>
                      </div>
                      <a
                        href="#"
                        className="ie-ds-settings-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClose();
                        }}>
                        <Settings size={12} />
                        Manage datasources in Settings
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="import-export-modal-footer">
                {!showActivationPrompt && (
                  <>
                    <button className="ie-btn" onClick={handleClose}>
                      Cancel
                    </button>
                    {activeTab === "json" && (
                      <button className="ie-btn-primary" onClick={handleImport} disabled={!uploadFile}>
                        Import
                      </button>
                    )}
                    {activeTab === "gwapp" && gwAppPhase === "review" && (
                      <button
                        className="ie-btn-primary"
                        onClick={handleGwAppImport}
                        disabled={gwAppImportableCount === 0}>
                        Import {gwAppImportableCount} Unit{gwAppImportableCount !== 1 ? "s" : ""}
                      </button>
                    )}
                    {activeTab === "datasource" && (
                      <button className="ie-btn-primary" onClick={handleImportDatasource} disabled={!dsPreview}>
                        Import Datasource
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <Tooltip content="Import cards, lists, or datasources" placement="bottom-start">
        <Button
          type="text"
          icon={<Upload size={16} />}
          onClick={() => {
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
