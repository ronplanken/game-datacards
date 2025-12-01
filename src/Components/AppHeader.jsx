import { Badge, Button, Col, Grid, Image, Layout, Row, Space, Typography } from "antd";
import { Tooltip } from "./Tooltip/Tooltip";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCardStorage } from "../Hooks/useCardStorage";
import { Discord } from "../Icons/Discord";
import logo from "../Images/logo.png";
import { AboutModal } from "./AboutModal";
import { ServiceMessage } from "./ServiceMessage";
import { SettingsModal } from "./SettingsModal";
import { ShareModal } from "./ShareModal";
import { UpdateReminder } from "./UpdateReminder";
import { WelcomeWizard } from "./WelcomeWizard";
import { WhatsNew } from "./WhatsNew";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

export const AppHeader = ({ selectedTreeKey, setSelectedTreeKey }) => {
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const { activeCategory } = useCardStorage();

  return (
    <>
      <WelcomeWizard />
      <WhatsNew />
      <ServiceMessage />
      <UpdateReminder />
      <Header
        style={{
          paddingLeft: screens.xs ? "8px" : "32px",
          paddingRight: screens.xs ? "12px" : "32px",
        }}>
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
              <Space>
                <div className="nav-menu-item selected" onClick={() => navigate("/")}>
                  <Typography.Text style={{ marginBottom: 0, lineHeight: "4rem" }}>
                    <Link to={"/"} style={{ fontSize: "1.1rem", color: "white" }}>
                      Editor
                    </Link>
                  </Typography.Text>
                </div>
                <div className="nav-menu-item" onClick={() => navigate("/viewer")}>
                  <Typography.Text style={{ marginBottom: 0, lineHeight: "4rem" }}>
                    <Link to={"/viewer"} style={{ fontSize: "1.1rem", color: "white" }}>
                      Viewer
                    </Link>
                  </Typography.Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              {activeCategory && activeCategory.cards.length > 0 && <ShareModal />}
              <AboutModal />
              <Tooltip content="Join us on discord!" placement="bottom-end">
                <Button
                  className="button-bar"
                  type="ghost"
                  size="large"
                  icon={<Discord />}
                  onClick={() => window.open("https://discord.gg/anfn4qTYC4", "_blank")}></Button>
              </Tooltip>
              <SettingsModal />
            </Space>
          </Col>
        </Row>
      </Header>
    </>
  );
};
