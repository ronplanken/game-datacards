import { DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, Tabs, Tooltip, message } from "antd";
import React from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../../Helpers/external.helpers";

export const Exporter = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState(null);
  const [fileList, setFileList] = React.useState([]);
  const { importCategory } = useCardStorage();
  const { logScreenView } = useFirebase();

  const { activeCategory } = useCardStorage();

  return (
    <>
      <Modal
        title="Export"
        visible={isModalVisible}
        okButtonProps={{ disabled: !uploadFile }}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}>
        <Tabs>
          <Tabs.TabPane tab={"GDC JSON"} key={"json"} style={{ minHeight: 250 }}>
            <p>
              Export your current selected category to the GameDatacards JSON format. This can only be used to import it
              into GameDatacards itself.
            </p>
            <Button
              onClick={() => {
                const exportCategory = {
                  ...activeCategory,
                  closed: false,
                  uuid: uuidv4(),
                  cards: activeCategory?.cards?.map((card) => {
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
              }}>
              Export to JSON
            </Button>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={"GW 40k App"}
            key={"gwapp"}
            style={{ minHeight: 250 }}
            disabled={activeCategory?.type !== "list"}>
            <p>
              Export your current selected category to the GW Warhammer 40k app format. Please note this is currently
              missing some features such as wargear selection.
            </p>
            <Button
              onClick={() => {
                let listText = activeCategory.name;
                const sortedCards = activeCategory?.cards?.reduce(
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
              }}>
              Copy to clipboard
            </Button>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
      <Tooltip title={"Export category"} placement="bottomLeft">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<DownloadOutlined />}
          onClick={() => {
            logScreenView("Export Category");
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
