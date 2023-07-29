import { Button, Col, Form, Grid, Image, Input, Layout, Row, Select, Slider, Space, Typography } from "antd";
import split from "just-split";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { Page } from "../Components/Print/Page";
import { Printer } from "../Components/Print/Printer";
import { PrintFaq } from "../Components/PrintFaq";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import logo from "../Images/logo.png";

const { useBreakpoint } = Grid;

const { Header, Footer, Sider, Content } = Layout;

export const Print = () => {
  const { CategoryId } = useParams();
  const navigate = useNavigate();

  const { settings, updateSettings } = useSettingsStorage();

  const [cardsPerPage, setCardsPerPage] = useState(settings.printSettings?.cardsPerPage || 1);
  const [pagePadding, setPagePadding] = useState(settings.printSettings?.pagePadding || 0);
  const [rowGap, setRowGap] = useState(settings.printSettings?.rowGap || 0);
  const [cardScaling, setCardScaling] = useState(settings.printSettings?.cardScaling || 100);
  const [columnGap, setColumnGap] = useState(settings.printSettings?.columnGap || 0);
  const [pageSize, setPageSize] = useState(settings.printSettings?.pageSize || "A4");
  const [pageOrientation, setPageOrientation] = useState(settings.printSettings?.pageOrientation || "portrait");
  const [cardAlignment, setCardAlignment] = useState(settings.printSettings?.cardAlignment || "space-evenly");
  const [customSize, setCustomSize] = useState(settings.printSettings?.customSize || { height: "15cm", width: "15cm" });
  const [verticalAlignment, setVerticalAlignment] = useState(settings.printSettings?.verticalAlignment || "flex-start");
  const [backgrounds, setBackgrounds] = useState(settings.printSettings?.backgrounds || "standard");
  const [print_side, setPrintSide] = useState(settings.printSettings?.print_side || "front");
  const [force_print_side, setForcePrintSide] = useState(settings.printSettings?.force_print_side || false);

  const { cardStorage } = useCardStorage();

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
              <Col flex="48px">
                <PrintFaq />
              </Col>
            </Row>
            <Form
              layout="vertical"
              style={{ padding: 8, maxHeight: "calc(100vh - 205px)", zIndex: 100, overflowY: "auto" }}>
              <Form.Item label={"Page size"}>
                <Select
                  defaultValue={pageSize}
                  onChange={(val) => {
                    setPageSize(val);
                    updateSettings({ ...settings, printSettings: { ...settings.printSettings, pageSize: val } });
                  }}
                  options={[
                    { label: "A4", value: "A4" },
                    { label: "A5", value: "A5" },
                    { label: "Letter (US)", value: "Letter (US)" },
                    { label: "Half-letter (US)", value: "Half-letter (US)" },
                    { label: "Custom", value: "custom" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              {pageSize === "custom" && (
                <Row style={{ marginTop: -8, paddingLeft: 8, paddingRight: 8, overflow: "hidden" }} gutter={8}>
                  <Col span={12}>
                    <Form.Item label={"Height"}>
                      <Input
                        type={"text"}
                        placeholder={"Height"}
                        value={customSize.height}
                        onChange={(e) => {
                          setCustomSize((current) => {
                            return { ...current, height: e.target.value };
                          });
                          updateSettings({
                            ...settings,
                            printSettings: {
                              ...settings.printSettings,
                              customSize: { ...settings.printSettings.customSize, height: e.target.value },
                            },
                          });
                        }}
                        size={"small"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={"Width"} labelCol={12}>
                      <Input
                        type={"text"}
                        placeholder={"Width"}
                        value={customSize.width}
                        onChange={(e) => {
                          setCustomSize((current) => {
                            return { ...current, width: e.target.value };
                          });
                          updateSettings({
                            ...settings,
                            printSettings: {
                              ...settings.printSettings,
                              customSize: { ...settings.printSettings.customSize, width: e.target.value },
                            },
                          });
                        }}
                        size={"small"}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Form.Item label={"Orientation"}>
                <Select
                  defaultValue={pageOrientation}
                  onChange={(val) => {
                    setPageOrientation(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, pageOrientation: val },
                    });
                  }}
                  options={[
                    { label: "Portrait", value: "portrait" },
                    { label: "Landscape", value: "landscape" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              <Form.Item label={"Card spread"}>
                <Select
                  defaultValue={cardAlignment}
                  onChange={(val) => {
                    setCardAlignment(val);
                    updateSettings({ ...settings, printSettings: { ...settings.printSettings, cardAlignment: val } });
                  }}
                  options={[
                    { label: "Normal", value: "normal" },
                    { label: "Start", value: "flex-start" },
                    { label: "Center", value: "center" },
                    { label: "End", value: "flex-end" },
                    { label: "Space between", value: "space-between" },
                    { label: "Space evenly", value: "space-evenly" },
                    { label: "Space around", value: "space-around" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              <Form.Item label={"Vertical alignment"}>
                <Select
                  defaultValue={verticalAlignment}
                  onChange={(val) => {
                    setVerticalAlignment(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, verticalAlignment: val },
                    });
                  }}
                  options={[
                    { label: "Normal", value: "normal" },
                    { label: "Start", value: "flex-start" },
                    { label: "Center", value: "center" },
                    { label: "End", value: "flex-end" },
                    { label: "Space between", value: "space-between" },
                    { label: "Space evenly", value: "space-evenly" },
                    { label: "Space around", value: "space-around" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              <Form.Item label={`Cards per page (${cardsPerPage})`}>
                <Slider
                  min={1}
                  max={12}
                  onChange={(val) => {
                    setCardsPerPage(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, cardsPerPage: val },
                    });
                  }}
                  value={cardsPerPage}></Slider>
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
                      printSettings: { ...settings.printSettings, cardScaling: val },
                    });
                  }}
                  value={cardScaling}></Slider>
              </Form.Item>
              <Form.Item label={`Page padding (${pagePadding}px)`}>
                <Slider
                  min={0}
                  max={64}
                  step={2}
                  onChange={(val) => {
                    setPagePadding(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, pagePadding: val },
                    });
                  }}
                  value={pagePadding}></Slider>
              </Form.Item>
              <Form.Item label={`Row padding (${rowGap}px)`}>
                <Slider
                  min={0}
                  max={64}
                  step={2}
                  onChange={(val) => {
                    setRowGap(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, rowGap: val },
                    });
                  }}
                  value={rowGap}></Slider>
              </Form.Item>
              <Form.Item label={`Column padding (${columnGap}px)`}>
                <Slider
                  min={0}
                  max={64}
                  step={2}
                  onChange={(val) => {
                    setColumnGap(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, columnGap: val },
                    });
                  }}
                  value={columnGap}></Slider>
              </Form.Item>
              <Form.Item label={"Background"}>
                <Select
                  defaultValue={backgrounds}
                  onChange={(val) => {
                    setBackgrounds(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, backgrounds: val },
                    });
                  }}
                  options={[
                    { label: "Standard Backgrounds", value: "standard" },
                    { label: "Light Backgrounds", value: "light" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              <Form.Item label={"Force Print Side"}>
                <Select
                  defaultValue={force_print_side}
                  onChange={(val) => {
                    setForcePrintSide(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, force_print_side: val },
                    });
                  }}
                  options={[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ]}
                  size={"small"}
                />
              </Form.Item>
              <Form.Item label={"Print Side"}>
                <Select
                  defaultValue={print_side}
                  onChange={(val) => {
                    setPrintSide(val);
                    updateSettings({
                      ...settings,
                      printSettings: { ...settings.printSettings, print_side: val },
                    });
                  }}
                  options={[
                    { label: "Front", value: "front" },
                    { label: "Back", value: "back" },
                  ]}
                  size={"small"}
                />
              </Form.Item>
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
                          {card?.source === "40k-10e" && (
                            <Warhammer40K10eCardDisplay
                              card={card}
                              type="print"
                              key={`${rowIndex}-${index}`}
                              cardScaling={cardScaling}
                              side={force_print_side ? print_side : card.print_side}
                              backgrounds={backgrounds}
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
