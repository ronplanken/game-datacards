import { Download, Hash, Copy } from "lucide-react";
import { Button, message, Input } from "antd";
import { Tooltip } from "../Tooltip/Tooltip";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useFirebase } from "../../Hooks/useFirebase";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../../Helpers/external.helpers";
import {
  createDatasourceExport,
  generateDatasourceFilename,
  generateIdFromName,
  countCardsByType,
  formatCardBreakdown,
} from "../../Helpers/customDatasource.helpers";
import "./ImportExport.css";

const modalRoot = document.getElementById("modal-root");

// Helper to get all cards from a category including sub-categories
const getAllCategoryCards = (category, allCategories) => {
  const mainCards = category?.cards || [];
  if (category?.type !== "list") {
    const subCategories = allCategories.filter((cat) => cat.parentId === category?.uuid);
    const subCategoryCards = subCategories.flatMap((sub) => sub.cards || []);
    return [...mainCards, ...subCategoryCards];
  }
  return mainCards;
};

export const Exporter = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("json");
  const { logScreenView } = useFirebase();
  const { activeCategory, cardStorage } = useCardStorage();
  const { settings } = useSettingsStorage();

  // Preview state
  const [jsonPreview, setJsonPreview] = useState("");
  const [gwAppPreview, setGwAppPreview] = useState("");

  // Datasource export state
  const [dsName, setDsName] = useState("");
  const [dsId, setDsId] = useState("");
  const [dsVersion, setDsVersion] = useState("1.0.0");
  const [dsAuthor, setDsAuthor] = useState("");
  const [dsHeaderColor, setDsHeaderColor] = useState("#1a1a1a");
  const [dsBannerColor, setDsBannerColor] = useState("#4a4a4a");

  // Initialize datasource form when modal opens or category changes
  useEffect(() => {
    if (isModalVisible && activeCategory) {
      setDsName(activeCategory.name || "");
      setDsId(generateIdFromName(activeCategory.name || ""));
      setDsVersion("1.0.0");
      setDsAuthor("");
      setDsHeaderColor("#1a1a1a");
      setDsBannerColor("#4a4a4a");
    }
  }, [isModalVisible, activeCategory]);

  // Auto-generate ID when name changes
  useEffect(() => {
    if (dsName) {
      setDsId(generateIdFromName(dsName));
    }
  }, [dsName]);

  const handleClose = () => {
    setIsModalVisible(false);
    setActiveTab("json");
  };

  // Get all cards for datasource export
  const allCategoryCards = useMemo(() => {
    return getAllCategoryCards(activeCategory, cardStorage.categories);
  }, [activeCategory, cardStorage.categories]);

  const { counts: cardCounts, total: cardTotal } = useMemo(
    () => countCardsByType(allCategoryCards),
    [allCategoryCards],
  );
  const cardBreakdown = useMemo(() => formatCardBreakdown(cardCounts), [cardCounts]);

  const isDatasourceValid = dsName.trim() && dsVersion.trim();

  const handleExportDatasource = () => {
    if (!isDatasourceValid) return;

    try {
      const datasource = createDatasourceExport({
        name: dsName.trim(),
        id: dsId.trim() || generateIdFromName(dsName),
        version: dsVersion.trim(),
        author: dsAuthor.trim() || undefined,
        cards: allCategoryCards,
        factionName: activeCategory.name,
        colours: {
          header: dsHeaderColor,
          banner: dsBannerColor,
        },
      });

      const json = JSON.stringify(datasource, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = generateDatasourceFilename(dsName);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success(`Datasource exported as ${filename}`);
      handleClose();
    } catch (error) {
      message.error("Failed to export datasource");
      console.error("Export error:", error);
    }
  };

  // Generate JSON export string
  const generateJsonExport = useCallback(() => {
    if (!activeCategory) return "";

    // Get sub-categories for this category
    const subCategories = cardStorage.categories.filter((cat) => cat.parentId === activeCategory?.uuid);

    // Export parent category with only its direct cards
    const exportCategory = {
      ...activeCategory,
      closed: false,
      uuid: uuidv4(),
      cards: activeCategory?.cards?.map((card) => {
        return { ...card, uuid: uuidv4() };
      }),
    };
    // Remove parentId from export (will be set on import)
    delete exportCategory.parentId;

    // Export sub-categories with their own cards
    const exportSubCategories = subCategories.map((sub) => {
      const exportedSub = {
        ...sub,
        closed: false,
        uuid: uuidv4(),
        cards: sub.cards?.map((card) => {
          return { ...card, uuid: uuidv4() };
        }),
      };
      // Remove parentId - will be regenerated on import
      delete exportedSub.parentId;
      return exportedSub;
    });

    const exportData = {
      category: exportCategory,
      subCategories: exportSubCategories.length > 0 ? exportSubCategories : undefined,
      createdAt: new Date().toISOString(),
      version: process.env.REACT_APP_VERSION,
      website: "https://game-datacards.eu",
    };

    return JSON.stringify(exportData, null, 2);
  }, [activeCategory, cardStorage.categories]);

  const handleDownloadJson = () => {
    if (!jsonPreview) return;

    const url = window.URL.createObjectURL(new Blob([jsonPreview], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeCategory.name}-${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success("JSON file downloaded");
  };

  const handleCopyJson = () => {
    if (!jsonPreview) return;
    navigator.clipboard.writeText(jsonPreview);
    message.success("JSON copied to clipboard");
  };

  // Generate GW App text export string
  const generateGwAppText = useCallback(() => {
    if (!activeCategory) return "";

    // Get all cards including sub-category cards
    const allCards = getAllCategoryCards(activeCategory, cardStorage.categories);

    // Calculate total points
    const totalPoints = allCards?.reduce((sum, card) => {
      const unitCost = Number(card?.unitSize?.cost) || 0;
      const enhancementCost = Number(card?.selectedEnhancement?.cost) || 0;
      return sum + unitCost + enhancementCost;
    }, 0);

    // Sort cards into sections
    const sortedCards = allCards?.reduce(
      (exportCards, card) => {
        const keywords = card.keywords || [];
        if (keywords.includes("Character")) {
          exportCards.characters.push(card);
        } else if (keywords.includes("Battleline")) {
          exportCards.battleline.push(card);
        } else if (keywords.includes("Transport") || keywords.includes("Dedicated Transport")) {
          exportCards.transports.push(card);
        } else if (card.faction_id && card.faction_id !== activeCategory.factionId) {
          // Allied units have different faction
          exportCards.allied.push(card);
        } else {
          exportCards.other.push(card);
        }
        return exportCards;
      },
      { characters: [], battleline: [], transports: [], other: [], allied: [] },
    );

    // Helper to format a unit entry
    const formatUnit = (val) => {
      let unitText = `\n\n${val.name}`;
      if (val.unitSize?.models > 1) {
        unitText += ` ${val.unitSize.models}x`;
      }
      const unitCost = Number(val?.unitSize?.cost) || 0;
      const enhancementCost = Number(val?.selectedEnhancement?.cost) || 0;
      unitText += ` (${unitCost + enhancementCost || "?"} pts)`;

      if (val.isWarlord) {
        unitText += `\n   • Warlord`;
      }
      if (val.selectedEnhancement) {
        unitText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${
          val.selectedEnhancement?.cost
        } pts)`;
      }
      return unitText;
    };

    // Build the export text
    // Header: List name with total points
    let listText = `${activeCategory.name} (${totalPoints} points)`;

    // Faction name (use stored faction or category name)
    const factionName = activeCategory.factionName || activeCategory.name;
    listText += `\n\n${factionName}`;

    // CHARACTERS section
    if (sortedCards.characters.length > 0) {
      listText += "\n\nCHARACTERS";
      sortedCards.characters.forEach((val) => {
        listText += formatUnit(val);
      });
    }

    // BATTLELINE section
    if (sortedCards.battleline.length > 0) {
      listText += "\n\nBATTLELINE";
      sortedCards.battleline.forEach((val) => {
        listText += formatUnit(val);
      });
    }

    // DEDICATED TRANSPORTS section
    if (sortedCards.transports.length > 0) {
      listText += "\n\nDEDICATED TRANSPORTS";
      sortedCards.transports.forEach((val) => {
        listText += formatUnit(val);
      });
    }

    // OTHER DATASHEETS section
    if (sortedCards.other.length > 0) {
      listText += "\n\nOTHER DATASHEETS";
      sortedCards.other.forEach((val) => {
        listText += formatUnit(val);
      });
    }

    // ALLIED UNITS section
    if (sortedCards.allied.length > 0) {
      listText += "\n\nALLIED UNITS";
      sortedCards.allied.forEach((val) => {
        listText += formatUnit(val);
      });
    }

    listText += "\n\nCreated with https://game-datacards.eu";
    return listText;
  }, [activeCategory, cardStorage.categories]);

  const handleCopyGwApp = () => {
    if (!gwAppPreview) return;
    navigator.clipboard.writeText(gwAppPreview);
    message.success("List copied to clipboard");
  };

  // Check if GW 40k App export should be disabled
  const isGwAppDisabled = settings.selectedDataSource !== "40k-10e" || activeCategory?.type !== "list";

  // Generate previews when modal opens or category changes
  useEffect(() => {
    if (isModalVisible && activeCategory) {
      setJsonPreview(generateJsonExport());
    }
  }, [isModalVisible, activeCategory, generateJsonExport]);

  useEffect(() => {
    if (isModalVisible && activeTab === "gwapp" && !isGwAppDisabled) {
      setGwAppPreview(generateGwAppText());
    }
  }, [isModalVisible, activeTab, isGwAppDisabled, generateGwAppText]);

  return (
    <>
      {isModalVisible &&
        ReactDOM.createPortal(
          <div className="import-export-modal-overlay" onClick={handleClose}>
            <div className="import-export-modal" onClick={(e) => e.stopPropagation()}>
              <div className="import-export-modal-header">
                <h2 className="import-export-modal-title">Export</h2>
              </div>
              <div className="import-export-modal-body">
                <div className="import-export-tabs">
                  <div
                    className={`import-export-tab ${activeTab === "json" ? "active" : ""}`}
                    onClick={() => setActiveTab("json")}>
                    GDC JSON
                  </div>
                  <Tooltip
                    content={isGwAppDisabled ? "Only available for 10th Edition 40k lists" : ""}
                    placement="bottom">
                    <div
                      className={`import-export-tab ${activeTab === "gwapp" ? "active" : ""} ${
                        isGwAppDisabled ? "disabled" : ""
                      }`}
                      onClick={() => !isGwAppDisabled && setActiveTab("gwapp")}>
                      GW 40k App
                    </div>
                  </Tooltip>
                  <div
                    className={`import-export-tab ${activeTab === "datasource" ? "active" : ""}`}
                    onClick={() => setActiveTab("datasource")}>
                    Datasource
                  </div>
                </div>
                <div className="import-export-content">
                  {activeTab === "json" && (
                    <>
                      <p className="import-export-description">
                        Export your current selected category to the GameDatacards JSON format. This can only be used to
                        import it into GameDatacards itself.
                      </p>
                      <textarea className="export-preview" value={jsonPreview || "No cards to export"} readOnly />
                      <div className="export-actions">
                        <button className="ie-btn" onClick={handleCopyJson} disabled={!jsonPreview}>
                          <Copy size={14} /> Copy to Clipboard
                        </button>
                        <button className="ie-btn-primary" onClick={handleDownloadJson} disabled={!jsonPreview}>
                          <Download size={14} /> Download JSON
                        </button>
                      </div>
                    </>
                  )}
                  {activeTab === "gwapp" && (
                    <>
                      <p className="import-export-description">
                        Export your list in GW Warhammer 40k app format. Please note this is currently missing some
                        features such as wargear selection.
                      </p>
                      <textarea className="export-preview" value={gwAppPreview || "No cards to export"} readOnly />
                      <div className="export-actions">
                        <button className="ie-btn-primary" onClick={handleCopyGwApp} disabled={!gwAppPreview}>
                          <Copy size={14} /> Copy to Clipboard
                        </button>
                      </div>
                    </>
                  )}
                  {activeTab === "datasource" && (
                    <div className="ie-datasource-tab">
                      <p className="import-export-description">
                        Export this category as a standalone datasource that can be imported and shared with others.
                      </p>
                      <div className="ie-ds-summary">
                        <span className="ie-ds-category">
                          Category: <strong>{activeCategory?.name}</strong>
                        </span>
                        <span className="ie-ds-count">
                          {cardTotal} card{cardTotal !== 1 ? "s" : ""}
                          {cardBreakdown && ` (${cardBreakdown})`}
                        </span>
                      </div>
                      <div className="ie-ds-form">
                        <div className="ie-ds-field">
                          <label className="ie-ds-label">
                            Datasource Name <span className="ie-ds-required">*</span>
                          </label>
                          <Input
                            value={dsName}
                            onChange={(e) => setDsName(e.target.value)}
                            placeholder="My Custom Army"
                            size="small"
                          />
                        </div>
                        <div className="ie-ds-row">
                          <div className="ie-ds-field ie-ds-half">
                            <label className="ie-ds-label">
                              Version <span className="ie-ds-required">*</span>
                            </label>
                            <Input
                              value={dsVersion}
                              onChange={(e) => setDsVersion(e.target.value)}
                              placeholder="1.0.0"
                              size="small"
                            />
                          </div>
                          <div className="ie-ds-field ie-ds-half">
                            <label className="ie-ds-label">Author</label>
                            <Input
                              value={dsAuthor}
                              onChange={(e) => setDsAuthor(e.target.value)}
                              placeholder="Your name"
                              size="small"
                            />
                          </div>
                        </div>
                        <div className="ie-ds-field">
                          <label className="ie-ds-label">Datasource ID</label>
                          <Input
                            value={dsId}
                            onChange={(e) => setDsId(e.target.value)}
                            placeholder="my-custom-army"
                            size="small"
                            prefix={<Hash size={14} style={{ color: "rgba(0,0,0,0.45)" }} />}
                          />
                          <span className="ie-ds-help">Used for linking updates to this datasource</span>
                        </div>
                        <div className="ie-ds-field">
                          <label className="ie-ds-label">Faction Colors</label>
                          <div className="ie-ds-color-row">
                            <div className="ie-ds-color-picker">
                              <span className="ie-ds-color-label">Header</span>
                              <div className="ie-ds-color-input-wrapper">
                                <input
                                  type="color"
                                  value={dsHeaderColor}
                                  onChange={(e) => setDsHeaderColor(e.target.value)}
                                  className="ie-ds-color-input"
                                />
                                <span className="ie-ds-color-value">{dsHeaderColor}</span>
                              </div>
                            </div>
                            <div className="ie-ds-color-picker">
                              <span className="ie-ds-color-label">Banner</span>
                              <div className="ie-ds-color-input-wrapper">
                                <input
                                  type="color"
                                  value={dsBannerColor}
                                  onChange={(e) => setDsBannerColor(e.target.value)}
                                  className="ie-ds-color-input"
                                />
                                <span className="ie-ds-color-value">{dsBannerColor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="ie-action-btn" onClick={handleExportDatasource} disabled={!isDatasourceValid}>
                        <Download size={14} />
                        Export Datasource JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="import-export-modal-footer">
                <button className="ie-btn" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <Tooltip content={activeCategory ? "Export category" : "Select a category first"} placement="bottom-start">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<Download size={14} />}
          disabled={!activeCategory}
          onClick={() => {
            logScreenView("Export Category");
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
