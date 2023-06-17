import { RedoOutlined, SettingOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Col, Row, Space } from "antd";

export const MobileNav = ({ setSide, side, setMenuVisible }) => {
  return (
    <div
      style={{
        height: "48px",
        position: "fixed",
        backgroundColor: "#001529",
        bottom: "0px",
        paddingTop: "4px",
        width: "100vw",
      }}>
      <Row>
        <Col span={8}></Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
            <Button
              icon={side === "front" ? <RedoOutlined /> : <UndoOutlined />}
              type="ghost"
              size="large"
              shape="round"
              className="button-bar"
              onClick={() => {
                setSide((current) => {
                  if (current === "front") {
                    return "back";
                  }
                  return "front";
                });
              }}></Button>
          </Space>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              type="text"
              style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
              size="large"
              onClick={() => setMenuVisible(true)}
              icon={<SettingOutlined />}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};
