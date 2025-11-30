import {
  Badge,
  Button,
  Col,
  Collapse,
  Form,
  Grid,
  Image,
  Layout,
  Row,
  Select,
  Slider,
  Space,
  Spin,
  Typography,
} from "antd";
import { toBlob } from "html-to-image";
import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";

import logo from "../Images/logo.png";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import JSZip from "jszip";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

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

const { Header, Footer, Sider, Content } = Layout;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;
const { Option } = Select;
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

    const files = cardsFrontRef?.current?.map(async (card, index) => {
      const data = await toBlob(card, { cacheBust: false, pixelRatio: pixelScaling });
      return data;
    });

    files?.forEach(async (file, index) => {
      zip.file(
        `${category.name}/${allCards[index].name.replaceAll(" ", "_").toLowerCase()}${
          allCards[index]?.variant === "full" || settings.showCardsAsDoubleSided !== false ? ".png" : "-front.png"
        }`,
        file
      );
    });
    if (settings.showCardsAsDoubleSided !== true) {
      const backFiles = cardsBackRef?.current?.map(async (card, index) => {
        const data = await toBlob(card, { cacheBust: false, pixelRatio: pixelScaling });
        return data;
      });

      backFiles?.forEach(async (file, index) => {
        zip.file(`${category.name}/${allCards[index].name.replaceAll(" ", "_").toLowerCase()}-back.png`, file);
      });
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `datacards_${category.name.toLowerCase()}.zip`;
      link.click();
      overlayRef.current.style.display = "none";
    });
  };
  if (CategoryId && CategoryId < cardStorage?.categories?.length) {
    return (
      <Layout>
        <Header className="no-print" style={{ paddingLeft: "32px" }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Col>
              <Space size={"large"}>
                {process.env.REACT_APP_IS_PRODUCTION === "false" ? (
                  <Badge.Ribbon color="red" text={process.env.REACT_APP_ENVIRONMENT}>
                    <Image preview={false} src={logo} width={50} />
                  </Badge.Ribbon>
                ) : (
                  <Image preview={false} src={logo} width={50} />
                )}
                <Typography.Title level={2} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                  Game Datacards
                </Typography.Title>
                <Typography.Title level={4} style={{ color: "white", marginBottom: 0 }}>
                  Image Export
                </Typography.Title>
              </Space>
            </Col>
            <Col></Col>
          </Row>
        </Header>
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
          <Sider
            style={{
              backgroundColor: "#F0F2F5",
              zIndex: 1000,
              borderRight: "1px solid lightgray",
              boxShadow: "1px 0px 8px 0px rgb(0 0 0 / 15%)",
              clipPath: "inset(0px -8px 0px 0px)",
              height: "calc(100vh - 64px)",
            }}
            className="no-print small-form">
            <Row style={{ paddingTop: 8, paddingLeft: 8, borderBottom: "1px solid lightgray" }}>
              <Col flex="auto">
                <Typography.Title level={5}>Settings</Typography.Title>
              </Col>
            </Row>
            <Form
              layout="vertical"
              style={{ padding: 0, maxHeight: "calc(100vh - 205px)", zIndex: 100, overflowY: "auto" }}>
              <Collapse>
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
                        // uncomment the below option to allow debug colour mode which clearly shows each element
                        // { label: "Debug Background", value: "debug" },
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
                      value={pixelScaling}></Slider>
                  </Form.Item>
                </Panel>
              </Collapse>
            </Form>
            <Form
              style={{
                padding: 8,
                maxHeight: "100px",
                background: "rgb(240, 242, 245)",
                position: "absolute",
                bottom: 0,
                width: "100%",
                borderTop: "1px solid lightgray",
                zIndex: 101,
              }}>
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
            </Form>
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
                              {card?.source === "40k" && <Warhammer40KCardDisplay card={card} type="print" />}
                              {card?.source === "40k-10e" && (
                                <Warhammer40K10eCardDisplay
                                  card={card}
                                  type="print"
                                  side={"front"}
                                  backgrounds={backgrounds}
                                />
                              )}
                              {card?.source === "basic" && <Warhammer40KCardDisplay card={card} type="print" />}
                              {card?.source === "necromunda" && <NecromundaCardDisplay card={card} type="print" />}
                            </div>
                            {card?.source === "40k-10e" &&
                              settings.showCardsAsDoubleSided !== true &&
                              card?.cardType === "DataCard" &&
                              card?.variant !== "full" && (
                                <div ref={(el) => (cardsBackRef.current[index] = el)}>
                                  <Warhammer40K10eCardDisplay
                                    card={card}
                                    type="print"
                                    side={"back"}
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
