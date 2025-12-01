import { useMemo } from "react";
import { Badge, Button, Col, Collapse, Form, Image, Layout, Row, Select, Slider, Input, Space, Typography } from "antd";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import split from "just-split";

import logo from "../Images/logo.png";
import "../App.css";
import "../Components/Print/Print.css";

import { Page } from "../Components/Print/Page";
import { Printer } from "../Components/Print/Printer";
import { CardRenderer } from "../Components/Print/CardRenderer";
import { PrintFaq } from "../Components/PrintFaq";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { usePrintSettings } from "../Hooks/usePrintSettings";

const { Panel } = Collapse;
const { Header, Sider, Content } = Layout;

// Helper to get all cards from a category including sub-categories
const getAllCategoryCards = (category, allCategories) => {
  const mainCards = category.cards || [];
  // Get cards from sub-categories (only for regular categories, not lists)
  if (category.type !== "list") {
    const subCategories = allCategories.filter((cat) => cat.parentId === category.uuid);
    const subCategoryCards = subCategories.flatMap((sub) => sub.cards || []);
    return [...mainCards, ...subCategoryCards];
  }
  return mainCards;
};

export const Print = () => {
  const { CategoryId } = useParams();
  const navigate = useNavigate();

  const { settings, updateSettings } = useSettingsStorage();
  const { cardStorage } = useCardStorage();

  // Use the custom hook for all print settings
  const printSettings = usePrintSettings(settings, updateSettings);

  // Memoize cards to prevent unnecessary recalculations
  const cards = useMemo(() => {
    if (!CategoryId || CategoryId >= cardStorage?.categories?.length) return [];
    return getAllCategoryCards(cardStorage.categories[CategoryId], cardStorage.categories);
  }, [CategoryId, cardStorage.categories]);

  // Memoize pages split
  const pages = useMemo(() => {
    return split(cards, printSettings.cardsPerPage);
  }, [cards, printSettings.cardsPerPage]);

  // Redirect if invalid category
  if (!CategoryId || CategoryId >= cardStorage?.categories?.length) {
    return <Navigate to="/" replace={true} />;
  }

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
                Print
              </Typography.Title>
            </Space>
          </Col>
          <Col></Col>
        </Row>
      </Header>
      <Layout>
        <Sider width={220} className="no-print small-form print-sider">
          {/* Header */}
          <div className="print-sider-header">
            <Typography.Text className="print-sider-title">Print Settings</Typography.Text>
            <PrintFaq />
          </div>

          {/* Scrollable settings area */}
          <div className="print-settings-scroll">
            <Form layout="vertical" style={{ padding: 0 }}>
              <Collapse defaultActiveKey={["page"]}>
                {/* Page Settings */}
                <Panel header="Page" key="page">
                  <Form.Item label="Page size">
                    <Select
                      value={printSettings.pageSize}
                      onChange={printSettings.setPageSize}
                      options={[
                        { label: "A4", value: "A4" },
                        { label: "A5", value: "A5" },
                        { label: "Letter (US)", value: "Letter (US)" },
                        { label: "Half-letter (US)", value: "Half-letter (US)" },
                        { label: "Custom", value: "custom" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  {printSettings.pageSize === "custom" && (
                    <Row gutter={8} style={{ marginTop: -8 }}>
                      <Col span={12}>
                        <Form.Item label="Height">
                          <Input
                            type="text"
                            placeholder="Height"
                            value={printSettings.customSize.height}
                            onChange={(e) =>
                              printSettings.setCustomSize({
                                ...printSettings.customSize,
                                height: e.target.value,
                              })
                            }
                            size="small"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Width">
                          <Input
                            type="text"
                            placeholder="Width"
                            value={printSettings.customSize.width}
                            onChange={(e) =>
                              printSettings.setCustomSize({
                                ...printSettings.customSize,
                                width: e.target.value,
                              })
                            }
                            size="small"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  <Form.Item label="Orientation">
                    <Select
                      value={printSettings.pageOrientation}
                      onChange={printSettings.setPageOrientation}
                      options={[
                        { label: "Portrait", value: "portrait" },
                        { label: "Landscape", value: "landscape" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  <Form.Item label={`Page padding (${printSettings.pagePadding}px)`}>
                    <Slider
                      min={0}
                      max={64}
                      step={2}
                      value={printSettings.pagePadding}
                      onChange={printSettings.setPagePadding}
                    />
                  </Form.Item>
                </Panel>

                {/* Card Settings */}
                <Panel header="Cards" key="cards">
                  <Form.Item label="Card spread">
                    <Select
                      value={printSettings.cardAlignment}
                      onChange={printSettings.setCardAlignment}
                      options={[
                        { label: "Normal", value: "normal" },
                        { label: "Start", value: "flex-start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "flex-end" },
                        { label: "Space between", value: "space-between" },
                        { label: "Space evenly", value: "space-evenly" },
                        { label: "Space around", value: "space-around" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  <Form.Item label="Vertical alignment">
                    <Select
                      value={printSettings.verticalAlignment}
                      onChange={printSettings.setVerticalAlignment}
                      options={[
                        { label: "Normal", value: "normal" },
                        { label: "Start", value: "flex-start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "flex-end" },
                        { label: "Space between", value: "space-between" },
                        { label: "Space evenly", value: "space-evenly" },
                        { label: "Space around", value: "space-around" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  <Form.Item label={`Cards per page (${printSettings.cardsPerPage})`}>
                    <Slider
                      min={1}
                      max={12}
                      value={printSettings.cardsPerPage}
                      onChange={printSettings.setCardsPerPage}
                    />
                  </Form.Item>
                  <Form.Item label={`Card scaling (${printSettings.cardScaling}%)`}>
                    <Slider
                      min={25}
                      max={200}
                      step={1}
                      value={printSettings.cardScaling}
                      onChange={printSettings.setCardScaling}
                    />
                  </Form.Item>
                  <Form.Item label={`Row padding (${printSettings.rowGap}px)`}>
                    <Slider min={0} max={64} step={2} value={printSettings.rowGap} onChange={printSettings.setRowGap} />
                  </Form.Item>
                  <Form.Item label={`Column padding (${printSettings.columnGap}px)`}>
                    <Slider
                      min={0}
                      max={64}
                      step={2}
                      value={printSettings.columnGap}
                      onChange={printSettings.setColumnGap}
                    />
                  </Form.Item>
                </Panel>

                {/* Other Settings */}
                <Panel header="Other" key="other">
                  <Form.Item label="Background">
                    <Select
                      value={printSettings.backgrounds}
                      onChange={printSettings.setBackgrounds}
                      options={[
                        { label: "Standard Background", value: "standard" },
                        { label: "Light Background", value: "light" },
                        { label: "Coloured Ink Saver", value: "colourprint" },
                        { label: "Greyscale Ink Saver", value: "greyprint" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  <Form.Item label="Force Print Side" tooltip="Force the print side even if datacards have one saved">
                    <Select
                      value={printSettings.force_print_side}
                      disabled={settings.showCardsAsDoubleSided === true}
                      onChange={printSettings.setForcePrintSide}
                      options={[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                  <Form.Item label="Print Side" tooltip="Set the print side if the datacard does not have one saved">
                    <Select
                      value={printSettings.print_side}
                      disabled={settings.showCardsAsDoubleSided === true}
                      onChange={printSettings.setPrintSide}
                      options={[
                        { label: "Front", value: "front" },
                        { label: "Back", value: "back" },
                        { label: "Front & Back", value: "frontAndBack" },
                      ]}
                      size="small"
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
            </Form>
          </div>

          {/* Footer buttons */}
          <div className="print-sider-footer">
            <Form>
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
          </div>
        </Sider>

        <Content className="print-content">
          <Printer>
            {pages.map((pageCards, pageIndex) => (
              <Page
                key={pageIndex}
                pageNumber={pageIndex + 1}
                totalPages={pages.length}
                size={printSettings.pageSize}
                customSize={printSettings.customSize}
                orientation={printSettings.pageOrientation}
                style={{
                  padding: printSettings.pagePadding,
                  justifyContent: printSettings.cardAlignment,
                  alignContent: printSettings.verticalAlignment,
                  rowGap: printSettings.rowGap,
                  columnGap: printSettings.columnGap,
                }}>
                {pageCards.map((card, index) => (
                  <CardRenderer
                    key={`${card.name}-${index}`}
                    card={card}
                    cardScaling={printSettings.cardScaling}
                    printSide={printSettings.print_side}
                    forcePrintSide={printSettings.force_print_side}
                    backgrounds={printSettings.backgrounds}
                  />
                ))}
              </Page>
            ))}
          </Printer>
        </Content>
      </Layout>
    </Layout>
  );
};
