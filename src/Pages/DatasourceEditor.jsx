import { useState, useCallback } from "react";
import { Layout } from "antd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppHeader } from "../Components/AppHeader";
import { EditorLeftPanel } from "../Components/DatasourceEditor/EditorLeftPanel";
import { EditorCenterPanel } from "../Components/DatasourceEditor/EditorCenterPanel";
import { EditorRightPanel } from "../Components/DatasourceEditor/EditorRightPanel";
import { ConfirmDialog, ImportSchemaDialog } from "../Components/DatasourceEditor/components";
import { DatasourceWizard } from "../Components/DatasourceWizard";
import { useDatasourceEditorState } from "../Components/DatasourceEditor/hooks/useDatasourceEditorState";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSync } from "../Premium";
import {
  exportDatasourceSchema,
  downloadJsonFile,
  generateDatasourceFilename,
} from "../Helpers/customDatasource.helpers";
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
    selectCard,
    addCard,
    updateCard,
    deleteCard,
    updateDatasource,
    setCreatedDatasource,
  } = useDatasourceEditorState();

  const { createCustomDatasource, getCustomDatasourceData, removeCustomDatasource } = useDataSourceStorage();
  const { deleteLocalDatasourceFromCloud } = useSync();

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState(null); // "create" | "add-card-type"
  const [wizardKey, setWizardKey] = useState(0);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDatasourceTarget, setDeleteDatasourceTarget] = useState(null);

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);

  const handleNewDatasource = useCallback(() => {
    setWizardMode("create");
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  }, []);

  const handleAddCardType = useCallback(() => {
    if (!activeDatasource) return;
    setWizardMode("add-card-type");
    setWizardKey((k) => k + 1);
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

  const handleDeleteCardType = useCallback((cardType) => {
    setDeleteTarget(cardType);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || !activeDatasource) return;
    const updatedDatasource = {
      ...activeDatasource,
      schema: {
        ...activeDatasource.schema,
        cardTypes: (activeDatasource.schema?.cardTypes || []).filter((ct) => ct.key !== deleteTarget.key),
      },
    };
    await updateDatasource(updatedDatasource);
    // If the deleted card type was selected, clear selection to datasource level
    if (selectedItem?.type === "cardType" && selectedItem?.key === deleteTarget.key) {
      selectDatasource(activeDatasource);
    }
    setDeleteTarget(null);
  }, [deleteTarget, activeDatasource, updateDatasource, selectedItem, selectDatasource]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteDatasource = useCallback((datasource) => {
    setDeleteDatasourceTarget(datasource);
  }, []);

  const handleConfirmDeleteDatasource = useCallback(async () => {
    if (!deleteDatasourceTarget) return;
    const result = await removeCustomDatasource(deleteDatasourceTarget.id);
    // If the datasource was synced to cloud, trigger cloud cleanup
    if (result?.cloudId && result?.syncEnabled) {
      deleteLocalDatasourceFromCloud({ cloudId: result.cloudId });
    }
    setDeleteDatasourceTarget(null);
  }, [deleteDatasourceTarget, removeCustomDatasource, deleteLocalDatasourceFromCloud]);

  const handleCancelDeleteDatasource = useCallback(() => {
    setDeleteDatasourceTarget(null);
  }, []);

  const handleExportDatasource = useCallback((datasource) => {
    if (!datasource) return;
    const schemaExport = exportDatasourceSchema(datasource);
    const filename = generateDatasourceFilename(datasource.name).replace("-datasource.json", "-schema.json");
    downloadJsonFile(schemaExport, filename);
  }, []);

  const handleOpenImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  const handleImportSchema = useCallback(
    async (importedData) => {
      setImportOpen(false);
      if (!activeDatasource) return;

      // Merge imported schema into the active datasource
      const updatedDatasource = {
        ...activeDatasource,
        name: importedData.name || activeDatasource.name,
        version: importedData.version || activeDatasource.version,
        author: importedData.author || activeDatasource.author,
        schema: importedData.schema || activeDatasource.schema,
      };

      // Merge faction colours if present
      if (importedData.factions && Array.isArray(importedData.factions) && activeDatasource.data) {
        updatedDatasource.data = activeDatasource.data.map((faction, i) => {
          const importedFaction = importedData.factions[i];
          if (importedFaction?.colours) {
            return { ...faction, colours: importedFaction.colours };
          }
          return faction;
        });
      }

      await updateDatasource(updatedDatasource);
    },
    [activeDatasource, updateDatasource],
  );

  const handleCancelImport = useCallback(() => {
    setImportOpen(false);
  }, []);

  const handleReorderCardTypes = useCallback(
    async (reorderedCardTypes) => {
      if (!activeDatasource) return;
      const updatedDatasource = {
        ...activeDatasource,
        schema: {
          ...activeDatasource.schema,
          cardTypes: reorderedCardTypes,
        },
      };
      await updateDatasource(updatedDatasource);
    },
    [activeDatasource, updateDatasource],
  );

  return (
    <Layout className="datasource-editor-layout">
      <AppHeader showModals={false} showNav={true} showActions={false} showSyncStatus={true} />
      <Content className="datasource-editor-content">
        <PanelGroup direction="horizontal" autoSaveId="datasourceEditorLayout">
          <Panel defaultSize={18} minSize={12} maxSize={30} order={1}>
            <EditorLeftPanel
              datasources={datasources}
              activeDatasource={activeDatasource}
              selectedItem={selectedItem}
              onSelectDatasource={selectDatasource}
              onSelectCardType={selectCardType}
              onSelectCard={selectCard}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onOpenDatasource={openDatasource}
              onNewDatasource={handleNewDatasource}
              onAddCardType={handleAddCardType}
              onDeleteCardType={handleDeleteCardType}
              onReorderCardTypes={handleReorderCardTypes}
              onExportDatasource={handleExportDatasource}
              onImportSchema={handleOpenImport}
              onDeleteDatasource={handleDeleteDatasource}
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
              onUpdateCard={updateCard}
            />
          </Panel>
        </PanelGroup>
      </Content>
      <DatasourceWizard
        key={wizardKey}
        open={wizardOpen}
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
        existingDatasource={wizardMode === "add-card-type" ? activeDatasource : undefined}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Card Type"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This will remove the card type definition from this datasource. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ConfirmDialog
        open={!!deleteDatasourceTarget}
        title="Delete Datasource"
        message={`Are you sure you want to delete "${deleteDatasourceTarget?.name}"? This will permanently remove the datasource and all its data. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteDatasource}
        onCancel={handleCancelDeleteDatasource}
      />
      <ImportSchemaDialog open={importOpen} onImport={handleImportSchema} onCancel={handleCancelImport} />
    </Layout>
  );
};
