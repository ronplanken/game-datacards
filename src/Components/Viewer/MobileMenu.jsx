import { DatabaseOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Space, message } from "antd";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

export const MobileMenu = ({ setIsVisible }) => {
  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);
  const { checkForUpdate } = useDataSourceStorage();
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
          height: "15%",
          width: "100vw",
          position: "sticky",
          bottom: "0",
          zIndex: 999,
          padding: "8px",
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
                setCheckingForUpdate(true);
                checkForUpdate().then(() => {
                  setCheckingForUpdate(false);
                  setIsVisible(false);
                  message.success({
                    content: "The datasource has been successfully updated.",
                    style: { marginTop: "10vh" },
                  });
                });
              }}
              icon={
                checkingForUpdate ? (
                  <LoadingOutlined style={{ color: "white" }} />
                ) : (
                  <DatabaseOutlined style={{ color: "white" }} />
                )
              }>
              Update datasources
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
    </>
  );
};
