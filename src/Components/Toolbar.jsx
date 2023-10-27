import { DownloadOutlined, FolderAddOutlined, PrinterOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Col, Row, Tooltip, message } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";

import { Parser } from "xml2js";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { ListCards } from "../Icons/ListCards";
import { Importer } from "./Importer/Importer";

const parser = new Parser({ mergeAttrs: true, explicitArray: false });

const parseString = parser.parseString;

export const Toolbar = ({ selectedTreeKey, setSelectedTreeKey }) => {
  const { settings } = useSettingsStorage();

  const navigate = useNavigate();

  const { logScreenView } = useFirebase();

  const { cardStorage, activeCategory, saveActiveCard, cardUpdated, addCategory } = useCardStorage();

  return (
    <Row>
      <Col
        span={16}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "start",
          background: "white",
          borderBottom: "1px solid #E5E5E5",
        }}>
        <Tooltip title={"Print cards from category"} placement="bottomLeft">
          <Button
            type={"text"}
            shape={"circle"}
            disabled={!(activeCategory && activeCategory.cards.length > 0)}
            onClick={() => {
              const categoryIndex = cardStorage?.categories?.findIndex((cat) => cat.uuid === activeCategory.uuid);
              logScreenView("Print");
              if (settings.legacyPrinting) {
                navigate(`/legacy-print/${categoryIndex}`);
              } else {
                navigate(`/print/${categoryIndex}`);
              }
            }}
            icon={<PrinterOutlined />}
          />
        </Tooltip>
        <Tooltip title={"Export category to JSON"} placement="bottomLeft">
          <Button
            type={"text"}
            shape={"circle"}
            disabled={!(activeCategory && activeCategory.cards.length > 0)}
            onClick={() => {
              logScreenView("Export Category");
              const exportCategory = {
                ...activeCategory,
                closed: false,
                uuid: uuidv4(),
                cards: activeCategory.cards.map((card) => {
                  return { ...card, uuid: uuidv4() };
                }),
              };
              const exportData = {
                category: exportCategory,
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
            }}
            icon={<DownloadOutlined />}
          />
        </Tooltip>
        <Importer />
        <Tooltip title={"Add new category"} placement="bottomLeft">
          <Button
            type={"text"}
            shape={"circle"}
            icon={<FolderAddOutlined />}
            onClick={() => {
              addCategory("New Category");
            }}
          />
        </Tooltip>
        <Tooltip title={"Add new list"} placement="bottomLeft">
          <Button
            type={"text"}
            shape={"circle"}
            icon={<ListCards />}
            onClick={() => {
              addCategory("New List", "list");
            }}
          />
        </Tooltip>
      </Col>
      <Col
        span={8}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
          background: "white",
          borderBottom: "1px solid #E5E5E5",
          alignItems: "center",
          paddingRight: "4px",
        }}>
        {selectedTreeKey?.includes("card") && (
          <>
            <Tooltip title={"Update selected card"} placement="bottom">
              <Button
                icon={<SaveOutlined />}
                type={"ghost"}
                size={"small"}
                disabled={!cardUpdated}
                onClick={() => {
                  saveActiveCard();
                  message.success("Card has been updated");
                }}>
                save
              </Button>
            </Tooltip>
          </>
        )}
      </Col>
    </Row>
  );
};
