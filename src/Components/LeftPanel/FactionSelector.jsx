import React from "react";
import { Col, Row, Select, Divider } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";

const { Option } = Select;

export const FactionSelector = ({ isLoading }) => {
  const { dataSource, selectedFactionIndex, updateSelectedFaction } = useDataSourceStorage();

  if (dataSource.data.length <= 1) {
    return null;
  }

  return (
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
  );
};
