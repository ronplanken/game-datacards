import { Image, FolderPlus, Printer } from "lucide-react";
import { Button, Col, Row } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";

import { Parser } from "xml2js";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { ListCards } from "../Icons/ListCards";
import { Exporter } from "./Importer/Exporter";
import { Importer } from "./Importer/Importer";

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
    <Row style={{ justifyContent: "space-between", background: "white", borderBottom: "1px solid #E5E5E5" }}>
      <Col
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "start",
          background: "white",
        }}>
        <Tooltip content="Print cards from category" placement="bottom-start">
          <Button
            type={"text"}
            shape={"circle"}
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
            icon={<Printer size={14} />}
          />
        </Tooltip>
        <Tooltip content="Export category to images" placement="bottom-start">
          <Button
            type={"text"}
            shape={"circle"}
            disabled={getTotalCardCount(activeCategory, cardStorage.categories) === 0}
            onClick={() => {
              const categoryIndex = cardStorage?.categories?.findIndex((cat) => cat.uuid === activeCategory.uuid);
              logScreenView("Export");
              navigate(`/image-export/${categoryIndex}`);
            }}
            icon={<Image size={14} />}
          />
        </Tooltip>
        <Exporter />
        <Importer />
        <Tooltip content="Add new category" placement="bottom-start">
          <Button
            type={"text"}
            shape={"circle"}
            icon={<FolderPlus size={14} />}
            onClick={() => {
              addCategory("New Category");
            }}
          />
        </Tooltip>
        <Tooltip content="Add new list" placement="bottom-start">
          <Button
            type={"text"}
            shape={"circle"}
            icon={<ListCards />}
            onClick={() => {
              addCategory("New List", "list", settings.selectedDataSource);
            }}
          />
        </Tooltip>
      </Col>
    </Row>
  );
};
