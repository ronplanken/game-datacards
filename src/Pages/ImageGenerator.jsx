import { Badge, Button, Col, Grid, Image, Layout, Progress, Row, Select, Space, Typography } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import "../Images.css";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { message } from "antd";
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
  const overlayRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setIsPercentage] = useState(false);

  const [selectedFactions, setSelectedFactions] = useState([]);

  const { Id } = useParams();
  const navigate = useNavigate();

  const getPics = async () => {
    const zip = new JSZip();
    overlayRef.current.style.display = "inline-flex";
    setIsLoading(true);
    await sleep(100);

    selectedFactions.forEach((faction) => {
      const files = cardsFrontRef.current[faction].map(async (card, index) => {
        const data = await toBlob(card, { cacheBust: false });
        return data;
      });
      const backFiles = cardsBackRef.current[faction].map(async (card, index) => {
        const data = await toBlob(card, { cacheBust: false });
        return data;
      });

      files.forEach(async (file, index) => {
        zip.file(
          `${faction}/${dataSource.data
            .filter((f) => f.id === faction)[0]
            ?.datasheets[index].name.replaceAll(" ", "_")
            .toLowerCase()}-front.png`,
          file
        );
      });

      backFiles.forEach(async (file, index) => {
        zip.file(
          `${faction}/${dataSource.data
            .filter((f) => f.id === faction)[0]
            ?.datasheets[index].name.replaceAll(" ", "_")
            .toLowerCase()}-back.png`,
          file
        );
      });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `datacards_${selectedFactions.join("_")}.zip`;
      link.click();
      overlayRef.current.style.display = "none";
      setIsLoading(false);
    });
  };
  const { settings, updateSettings } = useSettingsStorage();
  const { dataSource, selectedFaction, updateSelectedFaction, selectedFactionIndex } = useDataSourceStorage();

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
      <Content style={{ minHeight: "calc(100vh - 64px)" }}>
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
          }}></div>
        <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
          {dataSource?.data
            .filter((faction) => {
              return selectedFactions.includes(faction.id);
            })
            .map((faction) => {
              return faction.datasheets.map((card, index) => {
                return (
                  <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                    <Row>
                      <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                        <div ref={(el) => (cardsFrontRef.current[faction.id][index] = el)}>
                          {card?.source === "40k-10e" && (
                            <Warhammer40K10eCardDisplay card={card} type="print" side={"front"} />
                          )}
                        </div>
                        <div ref={(el) => (cardsBackRef.current[faction.id][index] = el)}>
                          {card?.source === "40k-10e" && (
                            <Warhammer40K10eCardDisplay card={card} type="print" side={"back"} />
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                );
              });
            })}
        </Row>
      </Content>
    </Layout>
  );
};
