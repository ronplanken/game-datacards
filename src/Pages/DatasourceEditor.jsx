import { Layout } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppHeader } from "../Components/AppHeader";
import { EditorLeftPanel } from "../Components/DatasourceEditor/EditorLeftPanel";
import { EditorCenterPanel } from "../Components/DatasourceEditor/EditorCenterPanel";
import { EditorRightPanel } from "../Components/DatasourceEditor/EditorRightPanel";
import "../Components/DatasourceEditor/DatasourceEditor.css";

const { Content } = Layout;

export const DatasourceEditorPage = () => {
  return (
    <Layout className="datasource-editor-layout">
      <AppHeader showModals={false} showNav={true} showActions={false} />
      <Content className="datasource-editor-content">
        <PanelGroup direction="horizontal" autoSaveId="datasourceEditorLayout">
          <Panel defaultSize={18} minSize={12} maxSize={30} order={1}>
            <EditorLeftPanel />
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={52} minSize={30} order={2}>
            <EditorCenterPanel />
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={22} minSize={15} maxSize={35} order={3}>
            <EditorRightPanel />
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
};
