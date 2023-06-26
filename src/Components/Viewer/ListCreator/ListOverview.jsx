import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useMobileList } from "../useMobileList";

export const ListOverview = ({ setShowList }) => {
  const { lists, selectedList, removeDatacard } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const navigate = useNavigate();

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
          position: "absolute",
          bottom: "48px",
          left: "0px",
          width: "100vw",
          minHeight: "250px",

          backgroundColor: "#FFFFFF",
          height: "24%",
          zIndex: "999",
          paddingTop: "8px",
          borderTop: "2px solid #001529",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
        }}>
        {lists[selectedList].datacards.length === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              width: "100vw",
              height: "100%",
              padding: "2px",
              paddingTop: "4px",
              paddingBottom: "4px",
              borderBottom: "2px solid #f0f2f5",
              paddingRight: "8px",
            }}>
            Your list is currently empty
          </div>
        )}
        {lists[selectedList].datacards.map((line, index) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "16px",
                width: "100vw",
                height: "36px",
                padding: "2px",
                paddingTop: "4px",
                paddingBottom: "4px",
                borderBottom: "2px solid #f0f2f5",
                paddingRight: "8px",
              }}
              key={line.card.name}>
              <Row style={{ width: "100%", alignItems: "center" }}>
                <Col
                  span={14}
                  style={{ paddingLeft: "16px" }}
                  onClick={() => {
                    const cardFaction = dataSource.data.find((faction) => faction.id === line.card?.faction_id);
                    navigate(
                      `/viewer/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${line.card.name
                        .replaceAll(" ", "-")
                        .toLowerCase()}`
                    );
                  }}>
                  {line.card.name}
                </Col>
                <Col span={4} style={{ fontSize: "0.8rem" }}>
                  {line.points.models} models
                </Col>
                <Col span={4} style={{ fontSize: "0.8rem" }}>
                  {line.points.cost} pts
                </Col>
                <Col span={2} style={{ fontSize: "0.8rem" }}>
                  <Button type="text" size="large" onClick={() => removeDatacard(index)} icon={<DeleteOutlined />} />
                </Col>
              </Row>
            </div>
          );
        })}
      </div>
    </OutsideClickHandler>
  );
};
