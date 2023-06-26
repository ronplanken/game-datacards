import { Col, List, Row, Space, Typography } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { AddCard } from "../../../Icons/AddCard";
import { useMobileList } from "../useMobileList";

export const ListAdd = ({ setShowList }) => {
  const { addDatacard } = useMobileList();
  const { activeCard } = useCardStorage();

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setShowList(false);
      }}>
      <div
        onClick={() => setShowList(false)}
        style={{
          display: "block",
          position: "absolute",
          height: "100vh",
          width: "100vw",
          top: "0px",
          bottom: "0px",
          zIndex: 888,
        }}
      />
      <div
        style={{
          display: "block",
          backgroundColor: "#FFFFFF",
          height: "auto",
          width: "100vw",
          position: "fixed",
          bottom: "48px",
          zIndex: "999",
          padding: "8px",
          borderTop: "2px solid #f0f2f5",
        }}>
        <Typography.Text>Add a unit</Typography.Text>
        <Space direction="vertical" style={{ width: "100%" }}>
          <List
            bordered
            dataSource={activeCard?.points
              ?.filter((p) => p.active)
              .map((point, index) => {
                return {
                  models: point.models,
                  cost: point.cost,
                  icon: <AddCard />,
                  onClick: () => {
                    addDatacard(activeCard, point);
                    setShowList(false);
                  },
                };
              })}
            renderItem={(item) => {
              return (
                <List.Item onClick={item.onClick}>
                  <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                    <Col span={2} style={{ color: "black" }}>
                      {item.icon}
                    </Col>
                    <Col span={9}>
                      <Typography.Text>{item.models} models</Typography.Text>
                    </Col>
                    <Col span={9}>
                      <Typography.Text>{item.cost} pts</Typography.Text>
                    </Col>
                  </Row>
                </List.Item>
              );
            }}></List>
        </Space>
      </div>
    </OutsideClickHandler>
  );
};
