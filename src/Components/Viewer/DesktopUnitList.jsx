import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Col, Divider, Input, List, Row, Select } from "antd";
import classNames from "classnames";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDataSourceType } from "../../Helpers/cardstorage.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";
const { Option } = Select;
export const DesktopUnitList = () => {
  const { dataSource, selectedFactionIndex, selectedFaction } = useDataSourceStorage();
  const { activeCard, setActiveCard } = useCardStorage();
  const [searchText, setSearchText] = useState(undefined);
  const { settings, updateSettings } = useSettingsStorage();

  const { stratagem } = useParams();

  const [selectedContentType, setSelectedContentType] = useState(stratagem ? "stratagems" : "datasheets");

  const navigate = useNavigate();

  let unitList;

  if (selectedContentType === "datasheets") {
    unitList = useDataSourceType(searchText);
  }
  if (selectedContentType === "stratagems") {
    const filteredStratagems = selectedFaction?.stratagems.filter((stratagem) => {
      return !settings?.ignoredSubFactions?.includes(stratagem.subfaction_id);
    });
    const mainStratagems = searchText
      ? filteredStratagems?.filter((stratagem) => stratagem.name.toLowerCase().includes(searchText.toLowerCase()))
      : filteredStratagems;

    const basicStratagems = searchText
      ? selectedFaction.basicStratagems?.filter((stratagem) =>
          stratagem.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : selectedFaction.basicStratagems;

    unitList = [
      { type: "header", name: "Basic stratagems" },
      ...basicStratagems.map((s) => {
        return { ...s, faction_id: selectedFaction.id };
      }),
      { type: "header", name: "Faction stratagems" },
      ...mainStratagems,
    ];
  }
  if (selectedContentType === "battle_rules") {
    const filteredBattleRules = selectedFaction?.battle_rules.filter((battle_rule) => {
      return !settings?.ignoredSubFactions?.includes(battle_rule.subfaction_id);
    });
    const mainBattleRules = searchText
      ? filteredBattleRules?.filter((battle_rule) => battle_rule.name.toLowerCase().includes(searchText.toLowerCase()))
      : filteredBattleRules;

    if (settings.hideBasicBattleRules || settings?.noBattleRuleOptions) {
      unitList = mainBattleRules;
    } else {
      const basicBattleRules = searchText
        ? selectedFaction.basicBattleRules?.filter((battle_rule) =>
            battle_rule.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : selectedFaction.basicBattleRules ?? [{ name: "Update your datasources" }];

      unitList = [
        { type: "header", name: "Basic battle rules" },
        ...basicBattleRules,
        { type: "header", name: "Faction battle rules" },
        ...mainBattleRules,
      ];
    }
  }
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
          {selectedFaction && (
            <Row style={{ marginBottom: "4px" }}>
              <Col span={24}>
                <Select
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    setSelectedContentType(value);
                  }}
                  placeholder="Select a type"
                  value={selectedContentType}>
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
                  {selectedFaction?.battle_rules && selectedFaction?.battle_rules.length > 0 && (
                    <Option value={"battle_rules"} key={`battle_rules`}>
                      Battle rules
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
        let cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

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
              if (card.cardType === "stratagem") {
                navigate(
                  `/viewer/${cardFaction.name.toLowerCase().replaceAll(" ", "-")}/stratagem/${card.name
                    .replaceAll(" ", "-")
                    .toLowerCase()}`
                );
              }
              if (!card.cardType === "stratagem") {
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
              }

              setActiveCard(card);
            }}
            className={classNames({
              "list-item": true,
              selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
              legends: card.legends,
            })}>
            <div
              style={{ display: "flex", width: "100%", marginRight: "48px", justifyContent: "space-between" }}
              className={card.nonBase ? card.faction_id : ""}>
              <span>{card.name}</span>
            </div>
          </List.Item>
        );
      }}
    />
  );
};
