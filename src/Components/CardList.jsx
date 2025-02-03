import React from "react";
import { List, Input, Select, Row, Col, Divider } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { FactionSettingsModal } from "./FactionSettingsModal";

const { Option } = Select;

const CardList = ({
  dataSourceType,
  isLoading,
  selectedFaction,
  settings,
  searchText,
  activeCard,
  setActiveCard,
  updateSettings,
  dataSource,
  updateSelectedFaction,
  selectedFactionIndex,
}) => {
  return (
    <List
      bordered
      size="small"
      loading={isLoading}
      dataSource={dataSourceType}
      style={{ overflowY: "auto", height: "calc(100% - 36px)" }}
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
                    loading={isLoading}
                    style={{
                      width: "calc(100% - 32px)",
                    }}
                    onChange={(value) => {
                      updateSelectedFaction(dataSource.data.find((faction) => faction.id === value));
                    }}
                    placeholder="Select a faction"
                    value={dataSource?.data[selectedFactionIndex]?.name}>
                    {dataSource.data.map((faction, index) => (
                      <Option value={faction.id} key={`${faction.id}-${index}`}>
                        {faction.name}
                      </Option>
                    ))}
                  </Select>
                  {!dataSource?.noFactionOptions && <FactionSettingsModal />}
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
              <Input.Search placeholder={"Search"} onSearch={(value) => searchText(value)} allowClear={true} />
            </Col>
          </Row>
          {selectedFaction && (
            <Row style={{ marginBottom: "4px" }}>
              <Col span={24}>
                <Select
                  loading={isLoading}
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    //setSelectedContentType(value); // Needs to be passed as prop if still needed here or handle in parent
                  }}
                  placeholder="Select a type"
                  //value={selectedContentType} // Needs to be passed as prop if still needed here or handle in parent
                >
                  {selectedFaction?.datasheets && selectedFaction?.datasheets.length > 0 && (
                    <Option value={"datasheets"} key={`datasheets`}>
                      Datasheets
                    </Option>
                  )}
                  {selectedFaction?.stratagems && selectedFaction?.stratagems.length > 0 && (
                    <Option value={"stratagems"} key={`stratagems`}>
                      Stratagems
                    </Option>
                  )}
                  {selectedFaction?.secondaries && selectedFaction?.secondaries.length > 0 && (
                    <Option value={"secondaries"} key={`secondaries`}>
                      Secondaries
                    </Option>
                  )}
                  {selectedFaction?.psychicpowers && selectedFaction?.psychicpowers.length > 0 && (
                    <Option value={"psychicpowers"} key={`psychicpowers`}>
                      Psychic powers
                    </Option>
                  )}
                </Select>
              </Col>
            </Row>
          )}
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
              setActiveCard(card);
            }}
            className={classNames({
              "list-item": true,
              selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
              legends: card.legends,
            })}>
            <div
              style={{
                display: "flex",
                width: "100%",
                marginRight: "24px",
                justifyContent: "space-between",
              }}
              className={card.nonBase ? card.faction_id : ""}>
              <span style={{ flexDirection: "column", display: "flex" }}>
                {card.name}
                {card.detachment !== "core" && <span style={{ fontSize: "0.7rem" }}>{card.detachment}</span>}
              </span>
              {settings.showPointsInListview && card?.points?.length > 0 && (
                <span className="list-cost">
                  <strong>{card.points[0]?.cost}</strong> pts
                </span>
              )}
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default CardList;
