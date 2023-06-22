import { FileImageOutlined, LinkOutlined } from "@ant-design/icons";
import { Col, List, Row, Space, Typography } from "antd";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";

export const MobileSharingMenu = ({ isVisible, setIsVisible, shareFullCard, shareMobileCard, shareLink }) => {
  return (
    <>
      <div
        style={{
          display: isVisible ? "block" : "none",
          position: "absolute",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#00000099",
          top: "0px",
          bottom: "0px",
          zIndex: 888,
        }}
      />
      <Col
        style={{
          display: isVisible ? "block" : "none",
          backgroundColor: "#FFFFFF",
          height: "24%",
          width: "100vw",
          position: "sticky",
          bottom: "0",
          zIndex: "999",
          padding: "8px",
          borderTop: "2px solid #f0f2f5",
        }}
        className="mobile-menu">
        <OutsideClickHandler
          onOutsideClick={() => {
            setIsVisible(false);
          }}>
          <Typography.Text>Share</Typography.Text>
          <Space direction="vertical" style={{ width: "100%" }}>
            <List
              bordered
              dataSource={[
                {
                  title: "Link",
                  icon: <LinkOutlined />,
                  onClick: () => {
                    shareLink();
                    setIsVisible(false);
                  },
                },
                {
                  title: "Full datacard",
                  icon: <FileImageOutlined />,
                  onClick: () => {
                    shareFullCard();
                    setIsVisible(false);
                  },
                },
                {
                  title: "Mobile datacard",
                  icon: <FileImageOutlined />,
                  onClick: () => {
                    shareMobileCard();
                    setIsVisible(false);
                  },
                },
              ]}
              renderItem={(item) => {
                return (
                  <List.Item onClick={item.onClick}>
                    <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                      <Col span={2}>{item.icon}</Col>
                      <Col span={18}>
                        <Typography.Text>{item.title}</Typography.Text>
                      </Col>
                    </Row>
                  </List.Item>
                );
              }}></List>
          </Space>
        </OutsideClickHandler>
      </Col>
    </>
  );
};
