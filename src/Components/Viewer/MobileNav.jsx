import { Settings, Share2 } from "lucide-react";
import { Button, Col, Row, Space } from "antd";
import { useState } from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { AddCard } from "../../Icons/AddCard";
import { ListOverview } from "./ListCreator/ListOverview";
import { useMobileList } from "./useMobileList";

export const MobileNav = ({ setMenuVisible, setSharingVisible, setAddListvisible }) => {
  const { activeCard } = useCardStorage();
  const { lists, selectedList } = useMobileList();

  const [showList, setShowList] = useState(false);

  return (
    <div
      style={{
        height: "64px",
        position: "fixed",
        backgroundColor: "#001529",
        bottom: "0px",
        paddingTop: "4px",
        width: "100vw",
        display: "flex",
        alignItems: "center",
      }}>
      <ListOverview isVisible={showList} setIsVisible={setShowList} />
      <Row style={{ width: "100%" }}>
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
              <span ref={parent}>
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
          </Space.Compact>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
            {activeCard && activeCard.points && (
              <Button
                icon={<AddCard />}
                type="ghost"
                size="large"
                shape="round"
                className="button-bar mobile-icon-button"
                onClick={() => setAddListvisible((val) => !val)}></Button>
            )}
          </Space>
        </Col>
        <Col span={8}>
          <Space align="center" style={{ width: "100%", justifyContent: "flex-end" }}>
            {activeCard && (
              <Button
                type="text"
                style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
                size="large"
                className="mobile-icon-button"
                onClick={() => setSharingVisible(true)}
                icon={<Share2 size={14} />}
              />
            )}
            <Button
              type="text"
              style={{ color: "white", paddingRight: "8px", paddingBottom: "8px" }}
              size="large"
              className="mobile-icon-button"
              onClick={() => setMenuVisible(true)}
              icon={<Settings size={14} />}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};
