import { MenuOutlined } from "@ant-design/icons";
import { Button, Col, Image, Row, Space, Typography } from "antd";
import logo from "../../Images/logo.png";

export const MobileHeader = ({ setOpen, padding }) => {
  return (
    <Row style={{ justifyContent: "space-between", position: "fixed", width: `calc(100vw - ${padding})` }}>
      <Col>
        <Space size={"large"}>
          <Image preview={false} src={logo} width={50} />
          <Typography.Title level={4} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
            Game Datacards
          </Typography.Title>
        </Space>
      </Col>
      <Col>
        <Button
          className="button-bar"
          type="ghost"
          size="large"
          onClick={() => setOpen(true)}
          icon={<MenuOutlined />}
        />
      </Col>
    </Row>
  );
};
