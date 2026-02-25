import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Toolbar } from "../Toolbar/Toolbar";
import { CategoryTree } from "./CategoryTree";
import { DataSourcePanel } from "./DataSourcePanel";

export const LeftPanel = ({ selectedTreeIndex, setSelectedTreeIndex, onAddToCategory }) => {
  return (
    <>
      <Toolbar />
      <PanelGroup direction="vertical" autoSaveId="toolbarLayout">
        <Panel defaultSize={30} minSize={20} maxSize={80}>
          <CategoryTree selectedTreeIndex={selectedTreeIndex} setSelectedTreeIndex={setSelectedTreeIndex} />
        </Panel>
        <PanelResizeHandle className="horizontal-resizer" />
        <Panel defaultSize={50} minSize={20} maxSize={80}>
          <DataSourcePanel setSelectedTreeIndex={setSelectedTreeIndex} onAddToCategory={onAddToCategory} />
        </Panel>
      </PanelGroup>
    </>
  );
};
