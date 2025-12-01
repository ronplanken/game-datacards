import { DownloadOutlined } from "@ant-design/icons";
import { Button, Tooltip, message } from "antd";
import React, { useState } from "react";
import * as ReactDOM from "react-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../../Helpers/external.helpers";
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

  const handleClose = () => {
    setIsModalVisible(false);
    setActiveTab("json");
  };

  const handleExportJson = () => {
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
    const url = window.URL.createObjectURL(
      new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeCategory.name}-${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyGwApp = () => {
    let listText = activeCategory.name;
    // Get all cards including sub-category cards
    const allCards = getAllCategoryCards(activeCategory, cardStorage.categories);
    const sortedCards = allCards?.reduce(
      (exportCards, card) => {
        if (card.keywords.includes("Character")) {
          exportCards.characters.push(card);
          return exportCards;
        }
        if (card.keywords.includes("Battleline")) {
          exportCards.battleline.push(card);
          return exportCards;
        }
        exportCards.other.push(card);
        return exportCards;
      },
      { characters: [], battleline: [], other: [], allied: [] }
    );

    if (sortedCards.characters.length > 0) {
      listText += "\n\nCHARACTERS";
      sortedCards.characters.forEach((val) => {
        listText += `\n\n${val.name} ${val.unitSize?.models > 1 ? val.unitSize?.models + "x" : ""} (${
          Number(val?.unitSize?.cost) + (Number(val.selectedEnhancement?.cost) || 0) || "?"
        } pts)`;
        if (val.isWarlord) {
          listText += `\n   ${val.isWarlord ? "• Warlord" : ""}`;
        }
        if (val.selectedEnhancement) {
          listText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${
            val.selectedEnhancement?.cost
          } pts)`;
        }
      });
    }

    if (sortedCards.battleline.length > 0) {
      listText += "\n\nBATTLELINE";
      sortedCards.battleline.forEach((val) => {
        listText += `\n\n${val.name} ${val.unitSize?.models > 1 ? val.unitSize?.models + "x" : ""} (${
          Number(val?.unitSize?.cost) + (Number(val.selectedEnhancement?.cost) || 0) || "?"
        } pts)`;
        if (val.isWarlord) {
          listText += `\n   ${val.isWarlord ? "• Warlord" : ""}`;
        }
        if (val.selectedEnhancement) {
          listText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${
            val.selectedEnhancement?.cost
          } pts)`;
        }
      });
    }

    if (sortedCards.other.length > 0) {
      listText += "\n\nOTHER";
      sortedCards.other.forEach((val) => {
        listText += `\n\n${val.name} ${val.unitSize?.models > 1 ? val.unitSize?.models + "x" : ""} (${
          Number(val?.unitSize?.cost) + (Number(val.selectedEnhancement?.cost) || 0) || "?"
        } pts)`;
        if (val.isWarlord) {
          listText += `\n   ${val.isWarlord ? "• Warlord" : ""}`;
        }
        if (val.selectedEnhancement) {
          listText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${
            val.selectedEnhancement?.cost
          } pts)`;
        }
      });
    }

    listText += "\n\nCreated with https://game-datacards.eu";
    navigator.clipboard.writeText(listText);
    message.success("List copied to clipboard.");
  };

  const isGwAppDisabled = activeCategory?.type !== "list";

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
                  <div
                    className={`import-export-tab ${activeTab === "gwapp" ? "active" : ""} ${
                      isGwAppDisabled ? "disabled" : ""
                    }`}
                    onClick={() => !isGwAppDisabled && setActiveTab("gwapp")}>
                    GW 40k App
                  </div>
                </div>
                <div className="import-export-content">
                  {activeTab === "json" && (
                    <>
                      <p className="import-export-description">
                        Export your current selected category to the GameDatacards JSON format. This can only be used to
                        import it into GameDatacards itself.
                      </p>
                      <button className="ie-action-btn" onClick={handleExportJson}>
                        Export to JSON
                      </button>
                    </>
                  )}
                  {activeTab === "gwapp" && (
                    <>
                      <p className="import-export-description">
                        Export your current selected category to the GW Warhammer 40k app format. Please note this is
                        currently missing some features such as wargear selection.
                      </p>
                      <button className="ie-action-btn" onClick={handleCopyGwApp}>
                        Copy to clipboard
                      </button>
                    </>
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
          modalRoot
        )}
      <Tooltip title={activeCategory ? "Export category" : "Select a category first"} placement="bottomLeft">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<DownloadOutlined />}
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
