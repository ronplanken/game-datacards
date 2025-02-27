import { Layout } from "antd";
import "antd/dist/antd.min.css";
import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "./App.css";
import { AppHeader } from "./Components/AppHeader";
import { CardDisplayPanel } from "./Components/MainLayout/CardDisplayPanel";
import { CardEditorPanel } from "./Components/MainLayout/CardEditorPanel";
import { TreeView } from "./Components/MainLayout/TreeView";
import { Toolbar } from "./Components/Toolbar";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { useSettingsStorage } from "./Hooks/useSettingsStorage";
import "./style.less";

const { Content } = Layout;

function App() {
  const { dataSource } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const [selectedContentType, setSelectedContentType] = useState("datasheets");
  const [searchText, setSearchText] = useState(undefined);
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);
  const { activeCard } = useCardStorage();

  // Find card faction details for styling and metadata
  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);

  return (
    <Layout>
      <AppHeader />
      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel defaultSize={18} order={1}>
            <Toolbar selectedTreeKey={selectedTreeIndex} setSelectedTreeKey={setSelectedTreeIndex} />
            <PanelGroup direction="vertical" autoSaveId="toolbarLayout">
              <TreeView
                selectedTreeIndex={selectedTreeIndex}
                setSelectedTreeIndex={setSelectedTreeIndex}
                searchText={searchText}
                setSearchText={setSearchText}
                selectedContentType={selectedContentType}
                setSelectedContentType={setSelectedContentType}
              />
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={41} order={2}>
            {activeCard && (
              <CardDisplayPanel
                activeCard={activeCard}
                cardFaction={cardFaction}
                setSelectedTreeIndex={setSelectedTreeIndex}
              />
            )}
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={20} order={3}>
            <CardEditorPanel activeCard={activeCard} />
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
}

export default App;
