import { FileImage, Link } from "lucide-react";
import { Col, List, Row, Space, Typography } from "antd";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";

export const MobileSharingMenu = ({ setIsVisible, shareFullCard, shareMobileCard, shareLink }) => {
  return (
    <>
      <div
        style={{
          display: "block",
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
          display: "block",
          backgroundColor: "#001529",
          height: "auto",
          padding: "8px",
          paddingBottom: "64px",
          width: "100vw",
          position: "sticky",
          bottom: "0",
          zIndex: "999",
          borderTop: "2px solid #f0f2f5",
        }}
        className="mobile-menu">
        <OutsideClickHandler
          onOutsideClick={() => {
            setIsVisible(false);
          }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Typography.Text style={{ color: "white" }}>Share</Typography.Text>
            <List
              bordered
              dataSource={[
                {
                  title: "Link",
                  icon: <Link size={14} />,
                  onClick: () => {
                    shareLink();
                    setIsVisible(false);
                  },
                },
                {
                  title: "Full datacard",
                  icon: <FileImage size={14} />,
                  onClick: () => {
                    shareFullCard();
                    setIsVisible(false);
                  },
                },
                {
                  title: "Mobile datacard",
                  icon: <FileImage size={14} />,
                  onClick: () => {
                    shareMobileCard();
                    setIsVisible(false);
                  },
                },
              ]}
              renderItem={(item) => {
                return (
                  <List.Item onClick={item.onClick} style={{ backgroundColor: "white" }}>
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
