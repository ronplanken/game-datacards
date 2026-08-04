import { ChevronDown, Menu } from "lucide-react";
import { Button, Col, Image, List, Row, Typography } from "antd";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import logo from "../../Images/logo.png";

export const MobileHeader = ({ setOpen, padding }) => {
  const navigate = useNavigate();

  const dropdown = useRef();
  const list = useRef();

  const handlers = useSwipeable({
    onSwiped: (eventData) => {
      if (eventData.dir === "Down" && list.current.scrollTop === 0) {
        dropdown.current.style.height = "0px";
      }
    },
    delta: { up: 20, down: 100 },
  });

  const refPassthrough = (el) => {
    handlers.ref(el);
    list.current = el;
  };

  const { selectedFaction, dataSource } = useDataSourceStorage();
  const { faction } = useParams();

  return (
    <>
      {createPortal(
        <div
          ref={dropdown}
          style={{
            position: "fixed",
            bottom: 64,
            left: 0,
            backgroundColor: "white",
            width: "100%",
            height: "0px",
          }}
          className="slide-up">
          <div {...handlers} ref={refPassthrough} style={{ height: "100%", overflow: "auto" }}>
            <List
              bordered
              className="mobile-menu"
              dataSource={dataSource.data}
              renderItem={(item) => {
                return (
                  <List.Item
                    onClick={() => {
                      dropdown.current.style.height = "0px";
                      navigate(
                        `/mobile/${dataSource.data
                          .find((faction) => faction.id === item.id)
                          ?.name?.toLowerCase()
                          .replaceAll(" ", "-")}`,
                      );
                    }}
                    className={selectedFaction?.id === item?.id ? "selected" : ""}>
                    <Row style={{ width: "100%", fontSize: "1.0rem" }}>
                      <Col span={24}>
                        <Typography.Text>{item.name}</Typography.Text>
                      </Col>
                    </Row>
                  </List.Item>
                );
              }}></List>
          </div>
        </div>,
        document.body,
      )}
      <Row
        style={{
          justifyContent: "space-between",
          position: "fixed",
          width: `calc(100vw - ${padding})`,
        }}>
        <Col style={{ display: "flex", alignItems: "center" }} span={20}>
          <Image
            preview={false}
            src={logo}
            width={42}
            onClick={() => {
              dropdown.current.style.height = "0px";
              navigate(`/mobile/${selectedFaction?.name?.toLowerCase().replaceAll(" ", "-") || ""}`);
            }}
            style={{ width: 42 }}
          />
          <Button
            type="text"
            style={{ color: "white", fontSize: "1.4rem", overflow: "hidden", textOverflow: "ellipsis" }}
            size="large"
            onClick={() => {
              const node = dropdown.current;
              if (node.style.height === "calc(100dvh - 128px)") {
                node.style.height = "0px";
              } else {
                node.style.height = "calc(100dvh - 128px)";
              }
            }}>
            {faction ? selectedFaction?.name : "Game Datacards"} <ChevronDown size={16} color="white" />
          </Button>
        </Col>
        <Col style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* User indicator - hidden for now, will be implemented with auth later */}
          <Button
            type="text"
            style={{ color: "white" }}
            size="large"
            className="mobile-icon-button"
            onClick={() => setOpen(true)}
            icon={<Menu size={14} />}
          />
        </Col>
      </Row>
    </>
  );
};
