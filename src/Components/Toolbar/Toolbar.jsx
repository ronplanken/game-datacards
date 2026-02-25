import { Image, FolderPlus, Printer } from "lucide-react";
import { Button } from "antd";
import { Tooltip } from "../Tooltip/Tooltip";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";

import { Parser } from "xml2js";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { ListCards } from "../../Icons/ListCards";
import { Exporter } from "../Importer/Exporter";
import { Importer } from "../Importer/Importer";
import "./Toolbar.css";

const parser = new Parser({ mergeAttrs: true, explicitArray: false });

const parseString = parser.parseString;

// Helper to get total card count including sub-categories
const getTotalCardCount = (category, allCategories) => {
  if (!category) return 0;
  const mainCards = category.cards?.length || 0;
  if (category.type !== "list") {
    const subCategories = allCategories.filter((cat) => cat.parentId === category.uuid);
    const subCardCount = subCategories.reduce((sum, sub) => sum + (sub.cards?.length || 0), 0);
    return mainCards + subCardCount;
  }
  return mainCards;
};

export const Toolbar = () => {
  const { settings } = useSettingsStorage();

  const navigate = useNavigate();

  const { logScreenView } = useFirebase();

  const { cardStorage, activeCategory, addCategory } = useCardStorage();

  return (
    <div className="treeview-toolbar">
      <div className="treeview-toolbar-group">
        <Tooltip content="Print all cards in this category" placement="bottom-start">
          <Button
            type="text"
            disabled={getTotalCardCount(activeCategory, cardStorage.categories) === 0}
            onClick={() => {
              const categoryIndex = cardStorage?.categories?.findIndex((cat) => cat.uuid === activeCategory.uuid);
              logScreenView("Print");
              if (settings.legacyPrinting) {
                navigate(`/legacy-print/${categoryIndex}`);
              } else {
                navigate(`/print/${categoryIndex}`);
              }
            }}
            icon={<Printer size={16} />}
          />
        </Tooltip>
        <Tooltip content="Save cards as individual images" placement="bottom-start">
          <Button
            type="text"
            disabled={getTotalCardCount(activeCategory, cardStorage.categories) === 0}
            onClick={() => {
              const categoryIndex = cardStorage?.categories?.findIndex((cat) => cat.uuid === activeCategory.uuid);
              logScreenView("Export");
              navigate(`/image-export/${categoryIndex}`);
            }}
            icon={<Image size={16} />}
          />
        </Tooltip>
        <Exporter />
      </div>
      <div className="treeview-toolbar-divider" />
      <div className="treeview-toolbar-group">
        <Importer />
      </div>
      <div className="treeview-toolbar-divider" />
      <div className="treeview-toolbar-group">
        <Tooltip content="Create a new category folder" placement="bottom-start">
          <Button
            type="text"
            icon={<FolderPlus size={16} />}
            onClick={() => {
              addCategory("New Category");
            }}
          />
        </Tooltip>
        <Tooltip content="Start a new army list" placement="bottom-start">
          <Button
            type="text"
            icon={<ListCards style={{ fontSize: 16 }} />}
            onClick={() => {
              addCategory("New List", "list", settings.selectedDataSource);
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
};
