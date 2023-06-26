import { RedoOutlined, SettingOutlined, ShareAltOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Col, Row, Space } from "antd";
import { useState } from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { AddCard } from "../../Icons/AddCard";
import { ListAdd } from "./ListCreator/ListAdd";
import { ListOverview } from "./ListCreator/ListOverview";
import { useMobileList } from "./useMobileList";

export const MobileNav = ({ setSide, side, setMenuVisible, setSharingVisible }) => {
  const { activeCard } = useCardStorage();
  const { lists, selectedList } = useMobileList();
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
      {showList && <ListOverview setShowList={setShowList} />}
      {showAddCards && <ListAdd setShowList={setShowAddCards} />}
      <Row>
        <Col span={8} style={{ paddingLeft: "8px" }}>
          <Space.Compact block size="large">
            <Button
              type="ghost"
              size="large"
              className="button-bar"
              shape="round"
              onClick={() =>
                setShowList((val) => {
                  return showList ? false : true;
                })
              }>
              <span style={{ width: "48px" }}>
                {lists[selectedList].datacards.reduce((acc, val) => {
                  let cost = acc + Number(val.points.cost);
                  if (val.enhancement) {
                    cost = cost + Number(val.enhancement.cost);
                  }
                  return cost;
                }, 0)}{" "}
                pts
              </span>
            </Button>
            {activeCard && activeCard.points && (
              <Button
                icon={<AddCard />}
                type="ghost"
                size="large"
                shape="round"
                className="button-bar"
                onClick={() => setShowAddCards((val) => !val)}></Button>
            )}
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
