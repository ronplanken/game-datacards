import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Col, Divider, Input, List, Row, Select } from "antd";
import classNames from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataSourceType } from "../../Helpers/cardstorage.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";

export const DesktopUnitList = () => {
  const { dataSource, selectedFactionIndex, selectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const [searchText, setSearchText] = useState(undefined);
  const { settings, updateSettings } = useSettingsStorage();

  const navigate = useNavigate();

  const unitList = useDataSourceType(searchText);

  return (
    <List
      bordered
      size="small"
      dataSource={unitList}
      style={{ overflowY: "auto", height: "calc(100vh - 64px)" }}
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
                      width: dataSource?.noFactionOptions ? "100%" : "calc(100% - 32px)",
                    }}
                    onChange={(value) => {
                      navigate(`/viewer/${value.toLowerCase().replaceAll(" ", "-")}`);
                    }}
                    placeholder="Select a faction"
                    value={dataSource?.data[selectedFactionIndex]?.name}>
                    {dataSource.data.map((faction, index) => (
                      <Select.Option value={faction.name} key={`${faction.id}`}>
                        {faction.name}
                      </Select.Option>
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
              <Input.Search
                placeholder={"Search"}
                onSearch={(value) => {
                  if (value.length > 0) {
                    setSearchText(value);
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
            <List.Item key={`list-header-${index}`} className={`list-header`}>
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
        const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

        if (settings?.groupByFaction && settings?.mobile?.closedFactions?.includes(card.faction_id)) {
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
            }}
            className={classNames({
              "list-item": true,
              selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
              legends: card.legends,
            })}>
            <div className={card.nonBase ? card.faction_id : ""}>{card.name}</div>
          </List.Item>
        );
      }}
    />
  );
};
