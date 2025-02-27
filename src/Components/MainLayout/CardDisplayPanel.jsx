import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Menu, Row, Space } from "antd";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { AddCard } from "../../Icons/AddCard";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";

export const CardDisplayPanel = ({ activeCard, cardFaction, setSelectedTreeIndex }) => {
  const {
    cardStorage,
    updateActiveCard,
    setActiveCard: changeActiveCard,
    setActiveCategory,
    addCardToCategory,
  } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  // Add to category functionality
  const renderAddToCategory = () => {
    if (!activeCard || activeCard.isCustom) {
      return null;
    }

    const categoryMenu = (
      <Menu
        onClick={(e) => {
          const newCard = {
            ...activeCard,
            isCustom: true,
            uuid: uuidv4(),
          };
          const cat = { ...cardStorage.categories.find((c) => c.uuid === e.key) };
          addCardToCategory(newCard, cat.uuid);
          changeActiveCard(newCard);
          setActiveCategory(cat);
          setSelectedTreeIndex(`card-${newCard.uuid}`);
        }}
        items={cardStorage.categories
          .map((cat, index) => {
            if (index === 0) return null;
            return {
              key: cat.uuid,
              label: `Add to ${cat.name}`,
            };
          })
          .filter(Boolean)}
      />
    );

    if (cardStorage.categories?.length > 1) {
      return (
        <Dropdown.Button
          overlay={categoryMenu}
          icon={<AddCard />}
          type={"primary"}
          onClick={() => {
            const newCard = {
              ...activeCard,
              isCustom: true,
              uuid: uuidv4(),
            };
            const cat = { ...cardStorage.categories[0] };
            addCardToCategory(newCard);
            changeActiveCard(newCard);
            setActiveCategory(cat);
            setSelectedTreeIndex(`card-${newCard.uuid}`);
          }}>
          Add card to {cardStorage.categories[0].name}
        </Dropdown.Button>
      );
    }

    return (
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
          changeActiveCard(newCard);
          setActiveCategory(cat);
          setSelectedTreeIndex(`card-${newCard.uuid}`);
        }}>
        Add card to {cardStorage.categories[0].name}
      </Button>
    );
  };

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
          <Space>
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
                        newZoom = 25;
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
                        updateActiveCard({ ...activeCard, print_side: "front" }, true);
                      } else {
                        updateActiveCard({ ...activeCard, print_side: "back" }, true);
                      }
                    }}>
                    {activeCard.print_side === "back" ? "Show front" : "Show back"}
                  </Button>
                )}
              </>
            )}
            {renderAddToCategory()}
          </Space>
        </Col>
      </Row>
    </div>
  );
};
