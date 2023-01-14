import { Button, Col, Form, Grid, Image, Input, Layout, Row, Select, Slider, Space, Typography } from "antd";
import split from "just-split";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { Page } from "../Components/Print/Page";
import { Printer } from "../Components/Print/Printer";
import { PrintFaq } from "../Components/PrintFaq";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { useCardStorage } from "../Hooks/useCardStorage";
import logo from "../Images/logo.png";

const { useBreakpoint } = Grid;

const { Header, Footer, Sider, Content } = Layout;

export const Print = () => {
  const { CategoryId } = useParams();
  const navigate = useNavigate();

  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [pagePadding, setPagePadding] = useState(0);
  const [rowGap, setRowGap] = useState(0);
  const [cardScaling, setCardScaling] = useState(100);
  const [columnGap, setColumnGap] = useState(0);
  const [pageSize, setPageSize] = useState("A4");
  const [pageOrientation, setPageOrientation] = useState("portrait");
  const [cardAlignment, setCardAlignment] = useState("space-evenly");
  const [customSize, setCustomSize] = useState({ height: "15cm", width: "15cm" });
  const [verticalAlignment, setVerticalAlignment] = useState("flex-start");

  const { cardStorage } = useCardStorage();

  const screens = useBreakpoint();

  if (CategoryId && CategoryId < cardStorage?.categories?.length) {
    return (
      <Layout>
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
                <Typography.Title level={5}>Settings</Typography.Title>
              </Col>
              <Col flex="48px">
                <PrintFaq />
              </Col>
            </Row>
            <Form layout="vertical" style={{ padding: 8, borderRightWidth: 1, borderRightColor: "#0070D6" }}>
              <Form.Item label={"Page size"}>
                <Select
                  defaultValue={pageSize}
                  onChange={(val) => setPageSize(val)}
                  options={[
                    { label: "A4", value: "A4" },
                    { label: "A4", value: "A4" },
                    { label: "A5", value: "A5" },
                    { label: "Letter (US)", value: "Letter (US)" },
                    { label: "Half-letter (US)", value: "Half-letter (US)" },
                    { label: "Custom", value: "custom" },
                  ]}
                />
              </Form.Item>
              <Form.Item label={"Orientation"}>
                <Select
                  defaultValue={pageOrientation}
                  onChange={(val) => setPageOrientation(val)}
                  options={[
                    { label: "Portrait", value: "portrait" },
                    { label: "Landscape", value: "landscape" },
                  ]}
                />
              </Form.Item>
              {pageSize === "custom" && (
                <>
                  <Form.Item label={"Custom height"}>
                    <Input
                      type={"text"}
                      placeholder={"Height"}
                      value={customSize.height}
                      onChange={(e) =>
                        setCustomSize((current) => {
                          return { ...current, height: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={"Custom width)"}>
                    <Input
                      type={"text"}
                      placeholder={"Width"}
                      value={customSize.width}
                      onChange={(e) =>
                        setCustomSize((current) => {
                          return { ...current, width: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </>
              )}
              <Form.Item label={"Card spread"}>
                <Select
                  defaultValue={cardAlignment}
                  onChange={(val) => setCardAlignment(val)}
                  options={[
                    { label: "Normal", value: "normal" },
                    { label: "Start", value: "flex-start" },
                    { label: "Center", value: "center" },
                    { label: "End", value: "flex-end" },
                    { label: "Space between", value: "space-between" },
                    { label: "Space evenly", value: "space-evenly" },
                    { label: "Space around", value: "space-around" },
                  ]}
                />
              </Form.Item>
              <Form.Item label={"Vertical alignment"}>
                <Select
                  defaultValue={verticalAlignment}
                  onChange={(val) => setVerticalAlignment(val)}
                  options={[
                    { label: "Normal", value: "normal" },
                    { label: "Start", value: "flex-start" },
                    { label: "Center", value: "center" },
                    { label: "End", value: "flex-end" },
                    { label: "Space between", value: "space-between" },
                    { label: "Space evenly", value: "space-evenly" },
                    { label: "Space around", value: "space-around" },
                  ]}
                />
              </Form.Item>
              <Form.Item label={`Cards per page (${cardsPerPage})`}>
                <Slider min={1} max={12} onChange={(val) => setCardsPerPage(val)} value={cardsPerPage}></Slider>
              </Form.Item>
              <Form.Item label={`Page padding (${pagePadding}px)`}>
                <Slider min={0} max={64} step={2} onChange={(val) => setPagePadding(val)} value={pagePadding}></Slider>
              </Form.Item>
              <Form.Item label={`Row padding (${rowGap}px)`}>
                <Slider min={0} max={64} step={2} onChange={(val) => setRowGap(val)} value={rowGap}></Slider>
              </Form.Item>
              <Form.Item label={`Column padding (${columnGap}px)`}>
                <Slider min={0} max={64} step={2} onChange={(val) => setColumnGap(val)} value={columnGap}></Slider>
              </Form.Item>
              <Form.Item label={`Card scaling (${cardScaling}%)`}>
                <Slider
                  min={25}
                  max={200}
                  step={1}
                  onChange={(val) => setCardScaling(val)}
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
                  <Page
                    key={rowIndex}
                    size={pageSize}
                    customSize={customSize}
                    orientation={pageOrientation}
                    style={{
                      padding: pagePadding,
                      justifyContent: cardAlignment,
                      alignContent: verticalAlignment,
                      rowGap: rowGap,
                      columnGap: columnGap,
                    }}>
                    {row.map((card, index) => {
                      return (
                        <>
                          {card?.source === "40k" && (
                            <Warhammer40KCardDisplay
                              card={card}
                              type="print"
                              key={`${rowIndex}-${index}`}
                              cardScaling={cardScaling}
                            />
                          )}
                          {card?.source === "basic" && (
                            <Warhammer40KCardDisplay
                              card={card}
                              type="print"
                              key={`${rowIndex}-${index}`}
                              cardScaling={cardScaling}
                            />
                          )}
                          {card?.source === "necromunda" && (
                            <NecromundaCardDisplay
                              card={card}
                              type="print"
                              key={`${rowIndex}-${index}`}
                              cardScaling={cardScaling}
                            />
                          )}
                        </>
                      );
                    })}
                  </Page>
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
