import { Button, Col, Collapse, Form, Layout, Row, Select, Slider, Spin } from "antd";
import { domToBlob } from "modern-screenshot";
import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import "../Components/Print/Print.css";
import { AppHeader } from "../Components/AppHeader";
import { CardRenderer } from "../Components/Print/CardRenderer";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import JSZip from "jszip";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { buildUniqueFilenames } from "../Helpers/export.helpers";

// Helper to get all cards from a category including sub-categories
const getAllCategoryCards = (category, allCategories) => {
  const mainCards = category.cards || [];
  if (category.type !== "list") {
    const subCategories = allCategories.filter((cat) => cat.parentId === category.uuid);
    const subCategoryCards = subCategories.flatMap((sub) => sub.cards || []);
    return [...mainCards, ...subCategoryCards];
  }
  return mainCards;
};

const { Sider, Content } = Layout;
const { Panel } = Collapse;
export const ImageExport = () => {
  const { CategoryId } = useParams();

  const cardsFrontRef = useRef([]);
  const cardsBackRef = useRef([]);
  const navigate = useNavigate();

  const overlayRef = useRef(null);
  const { cardStorage } = useCardStorage();

  const { settings, updateSettings } = useSettingsStorage();
  const [backgrounds, setBackgrounds] = useState(settings.printSettings?.backgrounds || "standard");
  const [pixelScaling, setPixelScaling] = useState(1.5);

  // Get all cards including sub-category cards
  const category = cardStorage.categories[CategoryId];
  const allCards = category ? getAllCategoryCards(category, cardStorage.categories) : [];

  const getPics = async () => {
    const zip = new JSZip();
    overlayRef.current.style.display = "inline-flex";
    await sleep(100);

    const uniqueNames = buildUniqueFilenames(allCards);
    const screenshotOpts = { scale: pixelScaling };

    for (let index = 0; index < cardsFrontRef.current.length; index++) {
      const card = cardsFrontRef.current[index];
      if (!card) continue;
      const blob = await domToBlob(card, screenshotOpts);
      const hasBack = cardsBackRef.current[index] != null;
      const suffix =
        !hasBack || allCards[index]?.variant === "full" || settings.showCardsAsDoubleSided !== false
          ? ".png"
          : "-front.png";
      zip.file(`${category.name}/${uniqueNames[index]}${suffix}`, blob);
    }

    if (settings.showCardsAsDoubleSided !== true) {
      for (let index = 0; index < cardsBackRef.current.length; index++) {
        const card = cardsBackRef.current[index];
        if (!card) continue;
        const blob = await domToBlob(card, screenshotOpts);
        zip.file(`${category.name}/${uniqueNames[index]}-back.png`, blob);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      const categoryName = category?.name || "untitled";
      link.download = `datacards_${categoryName.toLowerCase()}.zip`;
      link.click();
      overlayRef.current.style.display = "none";
    });
  };
  if (CategoryId && CategoryId < cardStorage?.categories?.length) {
    return (
      <Layout>
        <AppHeader pageTitle="Image Export" showNav={false} showActions={false} className="no-print" />
        <Layout>
          <div
            ref={overlayRef}
            style={{
              display: "none",
              position: "absolute",
              height: "100vh",
              width: "100vw",
              backgroundColor: "#000000CC",
              top: "0px",
              bottom: "0px",
              zIndex: 9999,
              alignItems: "center",
              justifyContent: "center",
              overflowX: "hidden",
              overflowY: "hidden",
              color: "white",
            }}>
            <Spin tip="Preparing download..." size="large"></Spin>
          </div>
          <Sider className="no-print print-sider small-form">
            <div className="print-sider-header">
              <h4 className="print-sider-title">Export Settings</h4>
            </div>
            <div className="print-settings-scroll">
              <Form layout="vertical">
                <Collapse defaultActiveKey={["other"]}>
                  <Panel header={"Other"} key={"other"}>
                    <Form.Item label={"Background"}>
                      <Select
                        defaultValue={backgrounds}
                        onChange={(val) => {
                          setBackgrounds(val);
                        }}
                        options={[
                          { label: "Standard Background", value: "standard" },
                          { label: "Light Background", value: "light" },
                          { label: "Coloured Ink Saver", value: "colourprint" },
                          { label: "Greyscale Ink Saver", value: "greyprint" },
                        ]}
                        size={"small"}
                      />
                    </Form.Item>
                    <Form.Item label={`Image pixel scaling (${pixelScaling})`}>
                      <Slider
                        min={0.5}
                        max={2.5}
                        step={0.25}
                        onChange={(val) => {
                          setPixelScaling(val);
                        }}
                        value={pixelScaling}
                      />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </Form>
            </div>
            <div className="print-sider-footer">
              <Form.Item>
                <Button
                  block
                  type="primary"
                  onClick={() => {
                    overlayRef.current.style.display = "inline-flex";
                    getPics();
                  }}>
                  Download
                </Button>
              </Form.Item>
              <Form.Item>
                <Button block type="default" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </Form.Item>
            </div>
          </Sider>
          <Content
            style={{ minHeight: "calc(100vh - 64px)", maxHeight: "calc(100vh - 64px)", overflowX: "hidden" }}
            className="image-generator">
            <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
              <>
                {allCards.map((card, index) => {
                  return (
                    <div key={card.uuid}>
                      <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                        <Row>
                          <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                            <div ref={(el) => (cardsFrontRef.current[index] = el)}>
                              <CardRenderer card={card} cardScaling={100} printSide="front" backgrounds={backgrounds} />
                            </div>
                            {card?.source === "40k-10e" &&
                              settings.showCardsAsDoubleSided !== true &&
                              card?.cardType === "DataCard" &&
                              card?.variant !== "full" && (
                                <div ref={(el) => (cardsBackRef.current[index] = el)}>
                                  <CardRenderer
                                    card={card}
                                    cardScaling={100}
                                    printSide="back"
                                    backgrounds={backgrounds}
                                  />
                                </div>
                              )}
                          </Col>
                        </Row>
                      </Col>
                    </div>
                  );
                })}
              </>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
  return <Navigate to="/" replace={true} />;
};
