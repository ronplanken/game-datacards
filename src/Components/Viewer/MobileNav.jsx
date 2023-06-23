import { DeleteOutlined, RedoOutlined, SettingOutlined, ShareAltOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Col, Row, Space } from "antd";
import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { AddCard } from "../../Icons/AddCard";
import { useMobileList } from "./useMobileList";

export const MobileNav = ({ setSide, side, setMenuVisible, setSharingVisible }) => {
  const { activeCard } = useCardStorage();
  const { lists, selectedList, addDatacard, removeDatacard } = useMobileList();
  const [showAddCards, setShowAddCards] = useState(false);
  const [showList, setShowList] = useState(false);
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
      {showList && (
        <OutsideClickHandler
          onOutsideClick={() => {
            setShowList(false);
          }}>
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
              borderTop: "2px solid #f0f2f5",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarGutter: "stable",
            }}>
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
                    <Col span={14}>{line.card.name}</Col>
                    <Col span={4} style={{ fontSize: "0.8rem" }}>
                      {line.points.models} models
                    </Col>
                    <Col span={4} style={{ fontSize: "0.8rem" }}>
                      {line.points.cost} pts
                    </Col>
                    <Col span={2} style={{ fontSize: "0.8rem" }}>
                      <Button
                        type="text"
                        size="large"
                        onClick={() => removeDatacard(index)}
                        icon={<DeleteOutlined />}
                      />
                    </Col>
                  </Row>
                </div>
              );
            })}
          </div>
        </OutsideClickHandler>
      )}
      {showAddCards && (
        <OutsideClickHandler
          onOutsideClick={() => {
            setShowAddCards(false);
          }}>
          <div style={{ position: "absolute", bottom: "45px", left: "0px" }} className="points_table-container">
            <table className="point-tabel">
              <thead>
                <tr>
                  <th>Models</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {activeCard?.points
                  ?.filter((p) => p.active)
                  .map((point, index) => {
                    return (
                      <tr
                        className="points"
                        key={`points-${index}-${point.model}`}
                        onClick={() => {
                          addDatacard(activeCard, point);
                          setShowAddCards(false);
                        }}>
                        <td>{`${point.models}`}</td>
                        <td>{`${point.cost} pts`}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </OutsideClickHandler>
      )}
      <Row>
        <Col span={8} style={{ paddingLeft: "8px" }}>
          <Space.Compact block size="large">
            <Button
              type="ghost"
              size="large"
              className="button-bar"
              shape="round"
              onClick={() => setShowList((val) => !val)}>
              <span style={{ width: "48px" }}>
                {lists[selectedList].datacards.reduce((acc, val) => {
                  return acc + Number(val.points.cost);
                }, 0)}{" "}
                pts
              </span>
            </Button>
            <Button
              icon={<AddCard />}
              type="ghost"
              size="large"
              shape="round"
              className="button-bar"
              onClick={() => setShowAddCards((val) => !val)}></Button>
          </Space.Compact>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
            {activeCard && (
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
            )}
          </Space>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              type="text"
              style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
              size="large"
              onClick={() => setSharingVisible(true)}
              icon={<ShareAltOutlined />}
            />
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
