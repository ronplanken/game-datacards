import { Col, Divider, Input, List, Row, Select } from "antd";
import classNames from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataSourceType } from "../../Helpers/cardstorage.helpers";
import { getListFactionId } from "../../Helpers/treeview.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";

export const DesktopUnitList = () => {
  const { dataSource, selectedFactionIndex, selectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const [searchText, setSearchText] = useState(undefined);

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
        if (card.type !== "header") {
          return (
            <List.Item
              key={`list-${card.id}`}
              onClick={() => {
                navigate(
                  `/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name
                    .replaceAll(" ", "-")
                    .toLowerCase()}`
                );
                setActiveCard(card);
              }}
              className={classNames({
                "list-item": true,
                selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
                legends: card.legends,
              })}>
              <div className={getListFactionId(card, selectedFaction)}>{card.name}</div>
            </List.Item>
          );
        }
      }}
    />
  );
};
