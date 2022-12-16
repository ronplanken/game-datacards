import { Col, Form, Grid, Image, Layout, Row, Select, Slider, Space, Typography } from "antd";
import split from "just-split";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { NecromundaCardDisplay } from '../Components/Necromunda/CardDisplay';
import { Page } from "../Components/Print/Page";
import { Printer } from "../Components/Print/Printer";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { useCardStorage } from "../Hooks/useCardStorage";
import logo from "../Images/logo.png";

const { useBreakpoint } = Grid;

const { Header, Footer, Sider, Content } = Layout;

export const Print = () => {
  const { Id } = useParams();
  const navigate = useNavigate();

  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [pageSize, setPageSize] = useState("A4");

  const { cardStorage } = useCardStorage();

  const screens = useBreakpoint();

  return (
    <Layout>
      <Header className="no-print">
        <Row style={{ justifyContent: "space-between" }} gutter={0}>
          <Col>
            <Space size={"large"}>
              <Image preview={false} src={logo} width={50} />
              <Typography.Title level={3} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
                Game Datacards
              </Typography.Title>
            </Space>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider style={{ backgroundColor: "#F0F2F5" }} className="no-print">
          <Form layout="vertical" style={{ padding: 8, borderRightWidth: 1, borderRightColor: "#0070D6" }}>
            <Form.Item label={"Page size"}>
              <Select
                defaultValue={pageSize}
                onChange={(val) => setPageSize(val)}
                options={[
                  { label: "A4", value: "A4" },
                  { label: "Letter (US)", value: "Letter (US)" },
                ]}
              />
            </Form.Item>
            <Form.Item label={"Cards per page"}>
              <Slider min={1} max={12} onChange={(val) => setCardsPerPage(val)} value={cardsPerPage}></Slider>
            </Form.Item>
          </Form>
        </Sider>
        <Content>
          <Printer>
            {split(cardStorage.categories[1].cards, cardsPerPage).map((row, rowIndex) => {
              return (
                <Page key={rowIndex} size={pageSize}>
                  {row.map((card, index) => {
                    return (
                      <>
                        {card?.source === "40k" && (
                          <Warhammer40KCardDisplay card={card} type="print" key={`${rowIndex}-${index}`} />
                        )}
                        {card?.source === "basic" && (
                          <Warhammer40KCardDisplay card={card} type="print" key={`${rowIndex}-${index}`} />
                        )}
                        {card?.source === "necromunda" && (
                          <NecromundaCardDisplay card={card} type="print" key={`${rowIndex}-${index}`} />
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
};
