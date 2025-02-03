import React from "react";
import { Row, Col, Space, Button, Space as AntSpace } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Warhammer40KCardDisplay } from "./Warhammer40k/CardDisplay";
import { Warhammer40K10eCardDisplay } from "./Warhammer40k-10e/CardDisplay";
import { NecromundaCardDisplay } from "./Necromunda/CardDisplay";
import { AddCard } from "../Icons/AddCard";
import { Dropdown } from "antd";

const CardDisplayArea = ({
  activeCard,
  settings,
  updateSettings,
  cardFaction,
  categoryMenu,
  cardStorage,
  setActiveCard,
  addCardToCategory,
  setActiveCategory,
  setSelectedTreeIndex,
  activeCategory,
}) => {
  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "block",
        overflow: "auto",
        "--card-scaling-factor": settings.zoom / 100,
        "--banner-colour": cardFaction?.colours?.banner,
        "--header-colour": cardFaction?.colours?.header,
      }}
      className={`data-${activeCard?.source}`}>
      <Row style={{ overflow: "hidden" }}>
        {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
        {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={activeCard.print_side || "front"} />}
        {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
        {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
      </Row>
      <Row style={{ overflow: "hidden", justifyContent: "center" }}>
        <Col
          span={20}
          style={{
            overflow: "hidden",
            justifyContent: "center",
            display: "flex",
            marginTop: "16px",
          }}>
          <AntSpace>
            {activeCard?.source === "40k-10e" && (
              <>
                <Space.Compact block>
                  <Button
                    type={"primary"}
                    icon={<ZoomInOutlined />}
                    disabled={settings.zoom === 100}
                    onClick={() => {
                      let newZoom = settings.zoom || 100;
                      newZoom = newZoom + 5;
                      if (newZoom >= 100) {
                        newZoom = 100;
                      }
                      updateSettings({ ...settings, zoom: newZoom });
                    }}
                  />
                  <Button
                    type={"primary"}
                    icon={<ZoomOutOutlined />}
                    disabled={settings.zoom === 25}
                    onClick={() => {
                      let newZoom = settings.zoom || 100;
                      newZoom = newZoom - 5;
                      if (newZoom <= 25) {
                        newZoom = newZoom = 25;
                      }
                      updateSettings({ ...settings, zoom: newZoom });
                    }}
                  />
                </Space.Compact>
                {settings.showCardsAsDoubleSided !== true && activeCard?.variant !== "full" && (
                  <Button
                    type={"primary"}
                    onClick={() => {
                      if (activeCard.print_side === "back") {
                        //updateActiveCard({ ...activeCard, print_side: "front" }, true); // Needs to be passed as prop or handled in parent
                      } else {
                        //updateActiveCard({ ...activeCard, print_side: "back" }, true); // Needs to be passed as prop or handled in parent
                      }
                    }}>
                    {activeCard.print_side === "back" ? "Show front" : "Show back"}
                  </Button>
                )}
              </>
            )}
            {activeCard && !activeCard.isCustom && (
              <>
                {cardStorage.categories?.length > 1 ? (
                  <Dropdown.Button
                    overlay={categoryMenu}
                    icon={<AddCard />}
                    type={"primary"}
                    style={{ width: "auto" }}
                    onClick={() => {
                      const newCard = {
                        ...activeCard,
                        isCustom: true,
                        uuid: uuidv4(),
                      };
                      const cat = { ...cardStorage.categories[0] };
                      addCardToCategory(newCard);
                      setActiveCard(newCard);
                      setActiveCategory(cat);
                      setSelectedTreeIndex(`card-${newCard.uuid}`);
                    }}>
                    Add card to {cardStorage.categories[0].name}
                  </Dropdown.Button>
                ) : (
                  <Button
                    type={"primary"}
                    onClick={() => {
                      const newCard = {
                        ...activeCard,
                        isCustom: true,
                        uuid: uuidv4(),
                      };
                      const cat = { ...cardStorage.categories[0] };
                      addCardToCategory(newCard);
                      setActiveCard(newCard);
                      setActiveCategory(cat);
                      setSelectedTreeIndex(`card-${newCard.uuid}`);
                    }}>
                    Add card to {cardStorage.categories[0].name}
                  </Button>
                )}
              </>
            )}
          </AntSpace>
        </Col>
      </Row>
    </div>
  );
};

export default CardDisplayArea;
