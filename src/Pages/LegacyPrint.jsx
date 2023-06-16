import { Button, Col, Form, Grid, Image, Layout, Row, Slider, Space, Typography } from "antd";
import split from "just-split";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { Printer } from "../Components/Print/Printer";
import { PrintFaq } from "../Components/PrintFaq";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import logo from "../Images/logo.png";

const { useBreakpoint } = Grid;

const { Header, Footer, Sider, Content } = Layout;

export const LegacyPrint = () => {
  const { CategoryId } = useParams();
  const navigate = useNavigate();

  const { settings, updateSettings } = useSettingsStorage();

  const [cardsPerPage, setCardsPerPage] = useState(settings.legacyPrintSettings?.cardsPerPage || 9);
  const [cardsPerRow, setCardsPerRow] = useState(settings.legacyPrintSettings?.cardsPerRow || 3);
  const [cardScaling, setCardScaling] = useState(settings.legacyPrintSettings?.cardScaling || 100);

  const { cardStorage } = useCardStorage();

  if (CategoryId && CategoryId < cardStorage?.categories?.length) {
    return (
      <Layout style={{ height: "calc(100vh)" }}>
        <Header className="no-print">
          <Row style={{ justifyContent: "space-between" }}>
            <Col>
              <Space size={"large"}>
                <Image preview={false} src={logo} width={50} />
                <Typography.Title level={2} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                  Game Datacards
                </Typography.Title>
              </Space>
            </Col>
          </Row>
        </Header>
        <Layout>
          <Sider style={{ backgroundColor: "#F0F2F5", zIndex: 1000 }} className="no-print">
            <Row style={{ paddingTop: 8, paddingLeft: 8 }}>
              <Col flex="auto">
                <Typography.Title level={5}>Legacy print settings</Typography.Title>
              </Col>
              <Col flex="48px">
                <PrintFaq />
              </Col>
            </Row>
            <Form layout="vertical" style={{ padding: 8, borderRightWidth: 1, borderRightColor: "#0070D6" }}>
              <Form.Item label={`Cards per Page (${cardsPerPage})`}>
                <Slider
                  value={cardsPerPage}
                  min={1}
                  max={9}
                  onChange={(val) => {
                    setCardsPerPage(val);
                    updateSettings({
                      ...settings,
                      legacyPrintSettings: { ...settings.legacyPrintSettings, cardsPerPage: val },
                    });
                  }}></Slider>
              </Form.Item>
              <Form.Item label={`Cards per Row (${cardsPerRow})`}>
                <Slider
                  min={1}
                  max={10}
                  onChange={(val) => {
                    setCardsPerRow(val);
                    updateSettings({
                      ...settings,
                      legacyPrintSettings: { ...settings.legacyPrintSettings, cardsPerRow: val },
                    });
                  }}
                  value={cardsPerRow}></Slider>
              </Form.Item>
              <Form.Item label={`Card scaling (${cardScaling}%)`}>
                <Slider
                  min={25}
                  max={200}
                  step={1}
                  onChange={(val) => {
                    setCardScaling(val);
                    updateSettings({
                      ...settings,
                      legacyPrintSettings: { ...settings.legacyPrintSettings, cardScaling: val },
                    });
                  }}
                  value={cardScaling}></Slider>
              </Form.Item>
              <Form.Item>
                <Button block type="primary" onClick={() => window.print()}>
                  Print
                </Button>
              </Form.Item>
              <Form.Item>
                <Button block type="default" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Sider>
          <Content className={"print-content"}>
            <Printer>
              {split(cardStorage.categories[CategoryId].cards, cardsPerPage).map((row, rowIndex) => {
                return (
                  <div
                    className="flex"
                    key={`print-${rowIndex}`}
                    style={{
                      pageBreakAfter: "always",
                      gridTemplateColumns: `${cardsPerRow}fr `.repeat(cardsPerRow),
                    }}>
                    {row.map((card, index) => {
                      return (
                        <div className={`data-${card?.source}`} key={`${card.id}-${index}`}>
                          {card?.source === "40k" && (
                            <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />
                          )}
                          {card?.source === "basic" && (
                            <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />
                          )}
                          {card?.source === "necromunda" && (
                            <NecromundaCardDisplay card={card} type="print" cardScaling={cardScaling} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Printer>
          </Content>
        </Layout>
      </Layout>
    );
  }
  return <Navigate to="/" replace={true} />;
};
