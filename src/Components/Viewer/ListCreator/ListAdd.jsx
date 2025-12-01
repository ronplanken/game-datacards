import { X } from "lucide-react";
import { Button, Col, List, Row, Select, Space, Typography, message } from "antd";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { AddCard } from "../../../Icons/AddCard";
import { useMobileList } from "../useMobileList";

const { Option } = Select;

export const ListAdd = ({ setIsVisible }) => {
  const { lists, selectedList, addDatacard } = useMobileList();
  const { activeCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedEnhancement, setSelectedEnhancement] = useState();
  const [isWarlord, setIsWarlord] = useState(false);
  const [selectedUnitSize, setSelectedUnitSize] = useState(() => {
    if (activeCard?.points?.length === 1) {
      return activeCard.points[0];
    }
    return undefined;
  });

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);
  const warlordAlreadyAdded = lists[selectedList]?.datacards?.find((card) => card.warlord);
  const epicHeroAlreadyAdded = lists[selectedList]?.datacards?.find((card) => {
    return activeCard?.keywords?.includes("Epic Hero") && activeCard.id === card.card.id;
  });

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  const [selectedDetachment, setSelectedDetachment] = useState();

  useEffect(() => {
    if (settings?.selectedDetachment?.[activeCard?.faction_id]) {
      setSelectedDetachment(settings?.selectedDetachment?.[activeCard?.faction_id]);
    } else {
      setSelectedDetachment(cardFaction?.detachments?.[0]);
    }
  }, [cardFaction, settings]);

  return (
    <>
      <div
        className="mobile-modal-background"
        style={{
          display: "block",
          position: "absolute",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#00000099",
          top: "0px",
          bottom: "0px",
          zIndex: 888,
        }}
        onClick={(e) => {
          if (e.target.getAttribute("class") === "mobile-modal-background") {
            setIsVisible(false);
          }
        }}
      />
      <Col
        style={{
          display: "block",
          backgroundColor: "#FFFFFF",
          height: "auto",
          width: "100vw",
          position: "fixed",
          bottom: "0px",
          zIndex: "999",
          padding: "8px",
          paddingBottom: "32px",
          borderTop: "2px solid #f0f2f5",
        }}
        className="mobile-menu">
        <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
          <Typography.Title level={4}>Add {activeCard.name}</Typography.Title>
          <Button
            style={{ fontSize: "20px" }}
            type="ghost"
            shape="circle"
            icon={<X size={14} />}
            onClick={() => {
              setIsVisible(false);
            }}
          />
        </Space>
        <Typography.Text style={{ paddingTop: "8px" }}>Select unit size</Typography.Text>
        <Space direction="vertical" style={{ width: "100%" }}>
          <List
            bordered
            dataSource={activeCard?.points
              ?.filter((p) => p.active)
              .map((point, index) => {
                return {
                  models: point.models,
                  keyword: point.keyword,
                  cost: point.cost,
                  icon: <AddCard />,
                  onClick: () => {
                    setSelectedUnitSize(point);
                  },
                };
              })}
            renderItem={(item) => {
              return (
                <List.Item
                  onClick={item.onClick}
                  className={
                    selectedUnitSize?.models === item?.models && selectedUnitSize.keyword === item.keyword
                      ? "selected"
                      : ""
                  }>
                  <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                    <Col span={9}>
                      <Typography.Text>
                        {item.models} models {item.keyword ? `(${item.keyword})` : ""}
                      </Typography.Text>
                    </Col>
                    <Col span={9}>
                      <Typography.Text>{item.cost} pts</Typography.Text>
                    </Col>
                  </Row>
                </List.Item>
              );
            }}></List>
        </Space>
        {(activeCard?.keywords?.includes("Character") || activeCard?.keywords?.includes("Epic Hero")) && (
          <>
            <div style={{ paddingTop: "16px" }}>
              <Typography.Text>Warlord</Typography.Text>
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <List bordered>
                <List.Item
                  onClick={() => {
                    if (!warlordAlreadyAdded) {
                      setIsWarlord((val) => !val);
                    }
                  }}
                  className={classNames({
                    listitem: true,
                    selected: isWarlord,
                    disabled: warlordAlreadyAdded,
                  })}>
                  <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                    {warlordAlreadyAdded ? (
                      <Col span={24}>
                        <Typography.Text>You already have a warlord</Typography.Text>
                      </Col>
                    ) : (
                      <Col span={24}>
                        <Typography.Text>Warlord</Typography.Text>
                      </Col>
                    )}
                  </Row>
                </List.Item>
              </List>
            </Space>
          </>
        )}
        {activeCard?.keywords?.includes("Character") && !activeCard?.keywords?.includes("Epic Hero") && (
          <>
            {cardFaction?.detachments?.length > 1 && (
              <>
                <div style={{ paddingTop: "16px" }}>
                  <Typography.Text>Detachment</Typography.Text>
                </div>
                <Select
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    setSelectedDetachment(value);
                    updateSettings({
                      ...settings,
                      selectedDetachment: { ...settings.selectedDetachment, [activeCard.faction_id]: value },
                    });
                  }}
                  value={selectedDetachment}>
                  {cardFaction?.detachments?.map((d) => {
                    return (
                      <Option value={d} key={d}>
                        {d}
                      </Option>
                    );
                  })}
                </Select>
              </>
            )}
            <div style={{ paddingTop: "16px" }}>
              <Typography.Text>Enhancements</Typography.Text>
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <List
                bordered
                dataSource={cardFaction.enhancements
                  ?.filter(
                    (enhancement) =>
                      enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() ||
                      !enhancement.detachment
                  )
                  ?.filter((enhancement) => {
                    let isActiveEnhancement = false;
                    enhancement.keywords.forEach((keyword) => {
                      if (activeCard?.keywords?.includes(keyword)) {
                        isActiveEnhancement = true;
                      }
                      if (activeCard?.factions?.includes(keyword)) {
                        isActiveEnhancement = true;
                      }
                    });
                    enhancement?.excludes?.forEach((exclude) => {
                      if (activeCard?.keywords?.includes(exclude)) {
                        isActiveEnhancement = false;
                      }
                      if (activeCard?.factions?.includes(exclude)) {
                        isActiveEnhancement = false;
                      }
                    });
                    return isActiveEnhancement;
                  })
                  .map((enhancement, index) => {
                    return {
                      name: enhancement.name,
                      cost: enhancement.cost,
                      description: enhancement.description,
                      onClick: () => {
                        selectEnhancement(enhancement);
                      },
                      disabled: () => {
                        let isDisabled = false;
                        lists[selectedList].datacards.forEach((card) => {
                          if (card?.enhancement?.name === enhancement?.name) {
                            isDisabled = true;
                          }
                        });
                        return isDisabled;
                      },
                    };
                  })}
                renderItem={(item) => {
                  return (
                    <List.Item
                      onClick={!item.disabled() ? item.onClick : undefined}
                      className={classNames({
                        listitem: true,
                        selected: selectedEnhancement?.name === item?.name,
                        disabled: item.disabled(),
                      })}>
                      <Row style={{ width: "100%", fontSize: "1.0rem" }}>
                        <Col span={20}>
                          <Typography.Text>{item.name}</Typography.Text>
                        </Col>
                        <Col span={4} style={{ textAlign: "right" }}>
                          <Typography.Text>{item.cost} pts</Typography.Text>
                        </Col>
                      </Row>
                    </List.Item>
                  );
                }}></List>
            </Space>
          </>
        )}
        <Button
          size="large"
          type="primary"
          block
          onClick={() => {
            addDatacard(activeCard, selectedUnitSize, selectedEnhancement, isWarlord);
            setIsVisible(false);
            message.success(`${activeCard.name} added to list.`);
          }}
          icon={<AddCard />}
          disabled={!selectedUnitSize || epicHeroAlreadyAdded}
          style={{ marginTop: "16px" }}>
          Add unit to list
        </Button>
      </Col>
    </>
  );
};
