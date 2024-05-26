import { BorderOutlined, CheckSquareOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Grid, Image, Layout, Row, Select, Space, Spin, Typography } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { toBlob } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import "../App.css";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import "../Images.css";
import logo from "../Images/logo.png";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import JSZip from "jszip";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const { useBreakpoint } = Grid;
const { Option } = Select;
export const ImageGenerator = () => {
  const cardsFrontRef = useRef({
    AS: [],
    AC: [],
    AdM: [],
    AE: [],
    AoI: [],
    AM: [],
    CHBT: [],
    CHBA: [],
    CSM: [],
    CD: [],
    QT: [],
    CHDA: [],
    DG: [],
    LGEC: [],
    CHDW: [],
    DRU: [],
    GK: [],
    GSC: [],
    QI: [],
    NEC: [],
    ORK: [],
    SM: [],
    CHSW: [],
    TAU: [],
    TS: [],
    TYR: [],
    UN: [],
    LoV: [],
    WE: [],
  });
  const cardsBackRef = useRef({
    AS: [],
    AC: [],
    AdM: [],
    AE: [],
    AoI: [],
    AM: [],
    CHBT: [],
    CHBA: [],
    CSM: [],
    CD: [],
    QT: [],
    CHDA: [],
    DG: [],
    LGEC: [],
    CHDW: [],
    DRU: [],
    GK: [],
    GSC: [],
    QI: [],
    NEC: [],
    ORK: [],
    SM: [],
    CHSW: [],
    TAU: [],
    TS: [],
    TYR: [],
    UN: [],
    LoV: [],
    WE: [],
  });
  const cardsStratagems = useRef({
    AS: [],
    AC: [],
    AdM: [],
    AE: [],
    AoI: [],
    AM: [],
    CHBT: [],
    CHBA: [],
    CSM: [],
    CD: [],
    QT: [],
    CHDA: [],
    DG: [],
    LGEC: [],
    CHDW: [],
    DRU: [],
    GK: [],
    GSC: [],
    QI: [],
    NEC: [],
    ORK: [],
    SM: [],
    CHSW: [],
    TAU: [],
    TS: [],
    TYR: [],
    UN: [],
    LoV: [],
    WE: [],
  });
  const basicStratagems = useRef([]);
  const overlayRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFactions, setSelectedFactions] = useState([]);
  const [addStratagems, setAddStratagems] = useState(false);
  const [addDatasheets, setAddDatasheets] = useState(true);

  const { settings, updateSettings } = useSettingsStorage();

  const getPics = async () => {
    const zip = new JSZip();
    overlayRef.current.style.display = "inline-flex";
    setIsLoading(true);
    await sleep(100);

    selectedFactions.forEach((faction) => {
      const factionName = dataSource.data.find((f) => f.id === faction).name;
      if (addDatasheets) {
        const files = cardsFrontRef?.current?.[faction]?.map(async (card, index) => {
          const data = await toBlob(card, { cacheBust: false, pixelRatio: 1.5 });
          return data;
        });

        files?.forEach(async (file, index) => {
          zip.file(
            `${factionName}/${dataSource.data
              .filter((f) => f.id === faction)[0]
              ?.datasheets[index].name.replaceAll(" ", "_")
              .toLowerCase()}-front.png`,
            file
          );
        });
        if (settings.showCardsAsDoubleSided !== true) {
          const backFiles = cardsBackRef?.current?.[faction]?.map(async (card, index) => {
            const data = await toBlob(card, { cacheBust: false, pixelRatio: 1.5 });
            return data;
          });

          backFiles?.forEach(async (file, index) => {
            zip.file(
              `${factionName}/${dataSource.data
                .filter((f) => f.id === faction)[0]
                ?.datasheets[index].name.replaceAll(" ", "_")
                .toLowerCase()}-back.png`,
              file
            );
          });
        }
      }
      if (addStratagems) {
        const stratagems = cardsStratagems?.current?.[faction]?.map(async (card, index) => {
          const data = await toBlob(card, { cacheBust: false, pixelRatio: 1.5 });
          return data;
        });

        stratagems?.forEach(async (file, index) => {
          zip.file(
            `${factionName}/${
              dataSource.data.filter((f) => f.id === faction)[0]?.stratagems[index].detachment
            }/${dataSource.data
              .filter((f) => f.id === faction)[0]
              ?.stratagems[index].name.replaceAll(" ", "_")
              .replaceAll("&", "and")
              .toLowerCase()}.png`,
            file
          );
        });
      }
    });

    if (addStratagems) {
      const basicStrats = basicStratagems?.current?.map(async (card, index) => {
        const data = await toBlob(card, { cacheBust: false, pixelRatio: 1.5 });
        return data;
      });

      basicStrats?.forEach(async (file, index) => {
        zip.file(
          `basic/${dataSource.data[0]?.basicStratagems[index].name.replaceAll(" ", "_").toLowerCase()}.png`,
          file
        );
      });
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `datacards_${selectedFactions.join("_")}.zip`;
      link.click();
      overlayRef.current.style.display = "none";
      setIsLoading(false);
    });
  };

  const { dataSource } = useDataSourceStorage();

  useEffect(() => {
    updateSettings({
      ...settings,
      selectedDataSource: "40k-10e",
    });
  }, []);

  return (
    <Layout>
      <Header style={{ paddingLeft: 8 }}>
        <Row style={{ justifyContent: "space-between" }} gutter={0}>
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
                Image Generator
              </Typography.Title>
              <Typography.Title level={3} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                <Space>
                  <Select
                    mode="multiple"
                    style={{ minWidth: "650px" }}
                    maxTagCount="responsive"
                    onChange={(value) => {
                      setSelectedFactions(value);
                    }}
                    placeholder="Select a faction"
                    value={selectedFactions}>
                    {dataSource.data.map((faction, index) => (
                      <Option value={faction.id} key={`${faction.id}-${index}`}>
                        {faction.name}
                      </Option>
                    ))}
                  </Select>
                  <Button type={addStratagems ? "primary" : "default"} onClick={() => setAddStratagems((val) => !val)}>
                    {addStratagems ? <CheckSquareOutlined /> : <BorderOutlined />}Stratagems
                  </Button>
                  <Button type={addDatasheets ? "primary" : "default"} onClick={() => setAddDatasheets((val) => !val)}>
                    {addDatasheets ? <CheckSquareOutlined /> : <BorderOutlined />}Datasheets
                  </Button>
                </Space>
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                className="button-bar"
                type="ghost"
                size="large"
                loading={isLoading}
                disabled={selectedFactions.length === 0}
                onClick={() => {
                  setIsLoading(true);
                  overlayRef.current.style.display = "block";
                  getPics();
                }}>
                Generate
              </Button>
            </Space>
          </Col>
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
            backgroundColor: "#00000099",
            top: "0px",
            bottom: "0px",
            zIndex: 9999,
            alignItems: "center",
            justifyContent: "center",
            overflowX: "hidden",
            overflowY: "hidden",
          }}>
          <Spin tip="Preparing download..." size="large"></Spin>
        </div>
        <Content style={{ minHeight: "calc(100vh - 64px)", overflowX: "hidden" }} className="image-generator">
          <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
            {dataSource?.data
              .filter((faction) => {
                return selectedFactions.includes(faction.id);
              })
              .map((faction) => {
                return (
                  <>
                    {addDatasheets &&
                      faction?.datasheets?.map((card, index) => {
                        return (
                          <div
                            style={{
                              "--banner-colour": faction?.colours?.banner,
                              "--header-colour": faction?.colours?.header,
                            }}
                            key={faction.id}>
                            <Col
                              key={`${card.name}-${index}`}
                              className={`data-${card?.source ? card?.source : "40k"}`}>
                              <Row>
                                <Col
                                  key={`${card.name}-${index}`}
                                  className={`data-${card?.source ? card?.source : "40k"}`}>
                                  <div
                                    ref={(el) => (cardsFrontRef.current[faction.id][index] = el)}
                                    style={{
                                      "--banner-colour": faction?.colours?.banner,
                                      "--header-colour": faction?.colours?.header,
                                    }}>
                                    {card?.source === "40k-10e" && (
                                      <Warhammer40K10eCardDisplay card={card} side={"front"} />
                                    )}
                                  </div>
                                  <div
                                    ref={(el) => (cardsBackRef.current[faction.id][index] = el)}
                                    style={{
                                      "--banner-colour": faction?.colours?.banner,
                                      "--header-colour": faction?.colours?.header,
                                    }}>
                                    {card?.source === "40k-10e" && settings.showCardsAsDoubleSided !== true && (
                                      <Warhammer40K10eCardDisplay card={card} side={"back"} />
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </Col>
                          </div>
                        );
                      })}
                    {addStratagems &&
                      faction?.stratagems?.map((card, index) => {
                        return (
                          <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                            <Row>
                              <Col
                                key={`${card.name}-${index}`}
                                className={`data-${card?.source ? card?.source : "40k"}`}>
                                <div
                                  ref={(el) => (cardsStratagems.current[faction.id][index] = el)}
                                  style={{
                                    "--banner-colour": faction?.colours?.banner,
                                    "--header-colour": faction?.colours?.header,
                                  }}>
                                  {card?.source === "40k-10e" && <Warhammer40K10eCardDisplay card={card} />}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        );
                      })}
                  </>
                );
              })}
            {addStratagems &&
              dataSource.data[0]?.basicStratagems?.map((card, index) => {
                return (
                  <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                    <Row>
                      <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                        <div ref={(el) => (basicStratagems.current[index] = el)}>
                          {card?.source === "40k-10e" && <Warhammer40K10eCardDisplay card={card} />}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                );
              })}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};
