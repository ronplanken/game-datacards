import { Layout } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppHeader } from "../Components/AppHeader";
import "../Components/DatasourceEditor/DatasourceEditor.css";

const { Content } = Layout;

export const DatasourceEditorPage = () => {
  return (
    <Layout className="datasource-editor-layout">
      <AppHeader showModals={false} showNav={true} showActions={false} />
      <Content className="datasource-editor-content">
        <PanelGroup direction="horizontal" autoSaveId="datasourceEditorLayout">
          <Panel defaultSize={18} minSize={12} maxSize={30} order={1}>
            <div className="designer-layer-panel">
              <div className="designer-empty-state">
                <span className="designer-empty-state-text">Left panel</span>
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={52} minSize={30} order={2}>
            <div style={{ height: "100%", background: "var(--designer-bg-deep)" }}>
              <div className="designer-empty-state">
                <span className="designer-empty-state-text">Center panel</span>
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={22} minSize={15} maxSize={35} order={3}>
            <div className="designer-properties-panel props-panel">
              <div className="props-empty">
                <span className="props-empty-text">Right panel</span>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
};
