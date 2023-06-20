import { Button, Col, Space } from "antd";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";

export const MobileSharingMenu = ({ isVisible, setIsVisible, shareFullCard, shareMobileCard, shareLink }) => {
  return (
    <Col
      style={{
        display: isVisible ? "block" : "none",
        backgroundColor: "#001529",
        height: "23%",
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
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            size="large"
            type="primary"
            block
            onClick={() => {
              shareLink();
              setIsVisible(false);
            }}>
            Share link to DataCard
          </Button>
          <Button
            size="large"
            type="primary"
            block
            onClick={() => {
              shareFullCard();
              setIsVisible(false);
            }}>
            Share full DataCard
          </Button>
          <Button
            size="large"
            type="primary"
            block
            onClick={() => {
              shareMobileCard();
              setIsVisible(false);
            }}>
            Share mobile DataCard
          </Button>

          <Button
            size="large"
            type="ghost"
            style={{ color: "white" }}
            block
            onClick={() => {
              setIsVisible(false);
            }}>
            Close
          </Button>
        </Space>
      </OutsideClickHandler>
    </Col>
  );
};
