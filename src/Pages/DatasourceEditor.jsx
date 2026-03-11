import { useState, useCallback } from "react";
import { Layout } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppHeader } from "../Components/AppHeader";
import { EditorLeftPanel } from "../Components/DatasourceEditor/EditorLeftPanel";
import { EditorCenterPanel } from "../Components/DatasourceEditor/EditorCenterPanel";
import { EditorRightPanel } from "../Components/DatasourceEditor/EditorRightPanel";
import { DatasourceWizard } from "../Components/DatasourceWizard";
import { useDatasourceEditorState } from "../Components/DatasourceEditor/hooks/useDatasourceEditorState";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import "../Components/DatasourceEditor/DatasourceEditor.css";

const { Content } = Layout;

export const DatasourceEditorPage = () => {
  const {
    datasources,
    activeDatasource,
    selectedItem,
    openDatasource,
    selectDatasource,
    selectCardType,
    updateDatasource,
    setCreatedDatasource,
  } = useDatasourceEditorState();

  const { createCustomDatasource, getCustomDatasourceData } = useDataSourceStorage();

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState(null); // "create" | "add-card-type"

  const handleNewDatasource = useCallback(() => {
    setWizardMode("create");
    setWizardOpen(true);
  }, []);

  const handleAddCardType = useCallback(() => {
    if (!activeDatasource) return;
    setWizardMode("add-card-type");
    setWizardOpen(true);
  }, [activeDatasource]);

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setWizardMode(null);
  }, []);

  const handleWizardComplete = useCallback(
    async (result) => {
      setWizardOpen(false);
      setWizardMode(null);

      if (wizardMode === "create") {
        // Create mode: result has { name, version, author, schema }
        const { name, version, author, schema } = result;
        const createResult = await createCustomDatasource({ name, version, author }, schema);
        if (createResult.success) {
          // Load the newly created datasource and set it as active
          const data = await getCustomDatasourceData(createResult.id);
          if (data) {
            setCreatedDatasource(data);
          }
        }
      } else if (wizardMode === "add-card-type" && activeDatasource) {
        // Add-card-type mode: result is a single card type entry
        const updatedDatasource = {
          ...activeDatasource,
          schema: {
            ...activeDatasource.schema,
            cardTypes: [...(activeDatasource.schema?.cardTypes || []), result],
          },
        };
        await updateDatasource(updatedDatasource);
      }
    },
    [
      wizardMode,
      activeDatasource,
      createCustomDatasource,
      getCustomDatasourceData,
      setCreatedDatasource,
      updateDatasource,
    ],
  );

  return (
    <Layout className="datasource-editor-layout">
      <AppHeader showModals={false} showNav={true} showActions={false} />
      <Content className="datasource-editor-content">
        <PanelGroup direction="horizontal" autoSaveId="datasourceEditorLayout">
          <Panel defaultSize={18} minSize={12} maxSize={30} order={1}>
            <EditorLeftPanel
              datasources={datasources}
              activeDatasource={activeDatasource}
              selectedItem={selectedItem}
              onSelectDatasource={selectDatasource}
              onSelectCardType={selectCardType}
              onOpenDatasource={openDatasource}
              onNewDatasource={handleNewDatasource}
              onAddCardType={handleAddCardType}
            />
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={52} minSize={30} order={2}>
            <EditorCenterPanel selectedItem={selectedItem} activeDatasource={activeDatasource} />
          </Panel>
          <PanelResizeHandle className="designer-resizer vertical" />
          <Panel defaultSize={22} minSize={15} maxSize={35} order={3}>
            <EditorRightPanel
              selectedItem={selectedItem}
              activeDatasource={activeDatasource}
              onUpdateDatasource={updateDatasource}
            />
          </Panel>
        </PanelGroup>
      </Content>
      <DatasourceWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
        existingDatasource={wizardMode === "add-card-type" ? activeDatasource : undefined}
      />
    </Layout>
  );
};
