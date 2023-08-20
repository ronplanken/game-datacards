import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Col, Divider, Drawer, Input, List, Row, Select } from "antd";
import classNames from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { useDataSourceType } from "../../Helpers/cardstorage.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";

export const MobileDrawer = ({ open, setOpen }) => {
  const { dataSource, selectedFactionIndex, selectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [searchText, setSearchText] = useState(undefined);
  const unitList = useDataSourceType(searchText);

  const navigate = useNavigate();

  const handlers = useSwipeable({
    onSwiped: (eventData) => {
      if (eventData.dir === "Right") {
        setOpen(false);
      }
    },
    delta: { right: 100 },
  });

  return (
    <Drawer
      title="Unit selection"
      placement={"right"}
      closable={true}
      open={open}
      onClose={() => setOpen(false)}
      key={"drawer"}
      className="viewer-drawer"
      headerStyle={{ backgroundColor: "#001529", color: "white" }}
      style={{
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      <div {...handlers}>
        <List
          bordered
          size="small"
          dataSource={unitList}
          style={{ overflowY: "auto", height: "100%" }}
          locale={{
            emptyText: selectedFaction ? "No datasheets found" : "No faction selected",
          }}
          header={
            <>
              {dataSource.data.length > 1 && (
                <>
                  <Row style={{ marginBottom: "4px" }}>
                    <Col span={24}>
                      <Select
                        style={{
                          width: "100%",
                        }}
                        onChange={(value) => {
                          navigate(`/viewer/${value.toLowerCase().replaceAll(" ", "-")}`);
                        }}
                        placeholder="Select a faction"
                        value={dataSource?.data[selectedFactionIndex]?.name}>
                        {dataSource.data.map((faction, index) => (
                          <Select.Option value={faction.name} key={`${faction.id}-${faction.name}`}>
                            {faction.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Divider style={{ marginTop: 4, marginBottom: 8 }} />
                    </Col>
                  </Row>
                </>
              )}
              <Row style={{ marginBottom: "4px" }}>
                <Col span={24}>
                  <Input.Search
                    placeholder={"Search"}
                    onChange={(value) => {
                      if (value.target.value.length > 0) {
                        setSearchText(value.target.value);
                      } else {
                        setSearchText(undefined);
                      }
                    }}
                    allowClear={true}
                  />
                </Col>
              </Row>
            </>
          }
          renderItem={(card, index) => {
            if (card.type === "header") {
              return (
                <List.Item key={`list-header-${index}`} className={`list-header`} onClick={() => {}}>
                  {card.name}
                </List.Item>
              );
            }
            if (card.type === "category") {
              if (settings?.groupByFaction) {
                return (
                  <List.Item
                    key={`list-category-${index}`}
                    className={`list-category`}
                    onClick={() => {
                      let newClosedFactions = [...(settings?.mobile?.closedFactions || [])];
                      if (newClosedFactions.includes(card.id)) {
                        newClosedFactions.splice(newClosedFactions.indexOf(card.id), 1);
                      } else {
                        newClosedFactions.push(card.id);
                      }
                      updateSettings({
                        ...settings,
                        mobile: { ...settings.mobile, closedFactions: newClosedFactions },
                      });
                    }}>
                    <span className="icon">
                      {settings?.mobile?.closedFactions?.includes(card.id) ? <RightOutlined /> : <DownOutlined />}
                    </span>
                    <span className="name">{card.name}</span>
                  </List.Item>
                );
              }
              return <></>;
            }
            if (card.type === "allied") {
              return (
                <List.Item
                  key={`list-category-${index}`}
                  className={`list-category`}
                  onClick={() => {
                    console.log(card);
                    let newClosedFactions = [...(settings?.mobile?.closedFactions || [])];
                    if (newClosedFactions.includes(card.id)) {
                      newClosedFactions.splice(newClosedFactions.indexOf(card.id), 1);
                    } else {
                      newClosedFactions.push(card.id);
                    }
                    updateSettings({
                      ...settings,
                      mobile: { ...settings.mobile, closedFactions: newClosedFactions },
                    });
                  }}>
                  <span className="icon">
                    {settings?.mobile?.closedFactions?.includes(card.id) ? <RightOutlined /> : <DownOutlined />}
                  </span>
                  <span className="name">{card.name}</span>
                </List.Item>
              );
            }
            if (card.type === "role") {
              return (
                <List.Item
                  key={`list-role-${index}`}
                  className={`list-category`}
                  onClick={() => {
                    let newClosedRoles = [...(settings?.mobile?.closedRoles || [])];
                    if (newClosedRoles.includes(card.name)) {
                      newClosedRoles.splice(newClosedRoles.indexOf(card.name), 1);
                    } else {
                      newClosedRoles.push(card.name);
                    }
                    updateSettings({
                      ...settings,
                      mobile: { ...settings.mobile, closedRoles: newClosedRoles },
                    });
                  }}>
                  <span className="icon">
                    {settings?.mobile?.closedRoles?.includes(card.name) ? <RightOutlined /> : <DownOutlined />}
                  </span>
                  <span className="name">{card.name}</span>
                </List.Item>
              );
            }
            const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

            if (settings?.mobile?.closedFactions?.includes(card.faction_id) && card.allied) {
              return <></>;
            }
            if (settings?.mobile?.closedRoles?.includes(card.role)) {
              return <></>;
            }
            return (
              <List.Item
                key={`list-${card.id}`}
                onClick={() => {
                  if (!card.nonBase) {
                    navigate(
                      `/viewer/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name
                        .replaceAll(" ", "-")
                        .toLowerCase()}`
                    );
                  }
                  if (card.nonBase) {
                    navigate(
                      `/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/allied/${cardFaction.name
                        .toLowerCase()
                        .replaceAll(" ", "-")}/${card.name.replaceAll(" ", "-").toLowerCase()}`
                    );
                  }

                  setActiveCard(card);
                  setOpen(false);
                }}
                className={classNames({
                  "list-item": true,
                  selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
                  legends: card.legends,
                })}>
                <div
                  style={{ display: "flex", width: "100%", marginRight: "0px", justifyContent: "space-between" }}
                  className={card.nonBase ? card.faction_id : ""}>
                  <span>{card.name}</span>
                  {settings.showPointsInListview && card.points.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        border: "1px solid white",
                        backgroundColor: "var(--header-colour)",
                        color: "white",
                        paddingTop: "2px",
                        paddingbottom: "2px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        borderRadius: "6px",
                        textAlign: "center",
                      }}>
                      <strong>{card.points[0]?.cost}</strong> pts
                    </span>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </Drawer>
  );
};
