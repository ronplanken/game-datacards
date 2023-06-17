import { DatabaseOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Space, message } from "antd";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

export const MobileMenu = ({ isVisible, setIsVisible }) => {
  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);
  const { dataSource, checkForUpdate } = useDataSourceStorage();
  return (
    <Col
      style={{
        display: isVisible ? "block" : "none",
        backgroundColor: "#001529",
        height: "15%",
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
            type="default"
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
