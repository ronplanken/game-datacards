import { RedoOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";

export const MobileNav = ({ setSide, side }) => {
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
    </div>
  );
};
