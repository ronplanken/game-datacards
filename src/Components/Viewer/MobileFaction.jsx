import { Col, Collapse, Select, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";
import { StratagemCard } from "../Warhammer40k-10e/StratagemCard";

const { Option } = Select;

export const MobileFaction = () => {
  const { selectedFaction } = useDataSourceStorage();
  const [selectedDetachment, setSelectedDetachment] = useState();
  const { settings, updateSettings } = useSettingsStorage();

  useEffect(() => {
    if (settings?.selectedDetachment?.[selectedFaction?.id]) {
      setSelectedDetachment(settings?.selectedDetachment?.[selectedFaction?.id]);
    } else {
      setSelectedDetachment(selectedFaction?.detachments?.[0]);
    }
  }, [selectedFaction, settings]);

  return (
    <Col
      className="mobile-faction"
      style={{
        width: "100dvw",
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      <div className="stratagems">
        {selectedFaction?.detachments?.length > 1 && (
          <>
            <div className="heading">
              <div className="title">Detachment</div>
            </div>
            <Select
              style={{ width: "100%" }}
              onChange={(value) => {
                setSelectedDetachment(value);
                updateSettings({
                  ...settings,
                  selectedDetachment: { ...settings.selectedDetachment, [selectedFaction.id]: value },
                });
              }}
              value={selectedDetachment}>
              {selectedFaction?.detachments?.map((d) => {
                return (
                  <Option value={d} key={d}>
                    {d}
                  </Option>
                );
              })}
            </Select>
          </>
        )}
        <div className="heading">
          <div className="title">Stratagems</div>
        </div>
        <Tabs
          defaultActiveKey={settings.defaultStratagemTab || 1}
          centered
          onChange={(key) => {
            updateSettings({ ...settings, defaultStratagemTab: key });
          }}
          style={{ padding: 0 }}
          tabBarStyle={{ marginBottom: 0 }}
          size="small"
          items={[
            {
              label: `FACTION`,
              key: "1",
              children: (
                <>
                  {selectedFaction?.stratagems?.filter(
                    (stratagem) =>
                      stratagem?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() ||
                      !stratagem.detachment
                  ).length > 0 ? (
                    <Collapse
                      style={{ margin: 16 }}
                      defaultActiveKey={settings.selectedStratagem?.[selectedFaction.id]}
                      onChange={(val) => {
                        updateSettings({
                          ...settings,
                          selectedStratagem: { ...settings.selectedStratagem, [selectedFaction.id]: val },
                        });
                      }}>
                      {selectedFaction?.stratagems
                        ?.filter(
                          (stratagem) =>
                            stratagem?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() ||
                            !stratagem.detachment
                        )
                        .map((val) => (
                          <Collapse.Panel
                            key={val.name}
                            header={
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>{val.name}</span>
                                <span
                                  style={{
                                    fontSize: "0.90rem",
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
                                  <strong>{val.cost}</strong> CP
                                </span>
                              </div>
                            }>
                            <div className="data-40k-10e">
                              <StratagemCard stratagem={val} paddingTop={"0"} className={"mobile"} />
                            </div>
                          </Collapse.Panel>
                        ))}
                    </Collapse>
                  ) : (
                    <div
                      style={{
                        fontSize: "16px",
                        textAlign: "center",
                        margin: 8,
                        padding: 8,
                        backgroundColor: "white",
                        fontWeight: 400,
                      }}>
                      No stratagems founds for detachment
                    </div>
                  )}
                </>
              ),
            },
            {
              label: `CORE`,
              key: "2",
              children: (
                <Collapse
                  style={{ margin: 16 }}
                  defaultActiveKey={settings.selectedStratagem?.["core"]}
                  onChange={(val) => {
                    updateSettings({
                      ...settings,
                      selectedStratagem: { ...settings.selectedStratagem, core: val },
                    });
                  }}>
                  {selectedFaction?.basicStratagems?.map((val) => (
                    <Collapse.Panel
                      key={val.name}
                      header={
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{val.name}</span>
                          <span
                            style={{
                              fontSize: "0.90rem",
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
                            <strong>{val.cost}</strong> CP
                          </span>
                        </div>
                      }>
                      <div className="data-40k-10e">
                        <StratagemCard stratagem={val} paddingTop={"0"} className={"mobile"} />
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              ),
            },
          ]}
        />
      </div>
      <div className="enhancements">
        <div className="heading">
          <div className="title">Enhancements</div>
        </div>
        <>
          {selectedFaction?.enhancements?.filter(
            (enhancement) =>
              enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !enhancement.detachment
          ).length > 0 ? (
            <Collapse style={{ margin: 16 }}>
              {selectedFaction?.enhancements
                ?.filter(
                  (enhancement) =>
                    enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() ||
                    !enhancement.detachment
                )
                .map((val) => (
                  <Collapse.Panel
                    key={val.name}
                    header={
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{val.name}</span>
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
                          <strong>{val.cost}</strong> pts
                        </span>
                      </div>
                    }>
                    <MarkdownDisplay content={val.description.replaceAll("■", "\n\r ■")} />
                  </Collapse.Panel>
                ))}
            </Collapse>
          ) : (
            <div
              style={{
                fontSize: "16px",
                textAlign: "center",
                margin: 8,
                padding: 8,
                backgroundColor: "white",
                fontWeight: 400,
              }}>
              No enhancements founds for detachment
            </div>
          )}
        </>
      </div>
    </Col>
  );
};
