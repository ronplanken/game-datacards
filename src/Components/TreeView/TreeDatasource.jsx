import React, { useState } from "react";
import { ChevronRight, Trash2, Package, Share2, RefreshCw, Settings2, Cloud } from "lucide-react";
import { message } from "../Toast/message";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useAuth } from "../../Hooks/useAuth";
import { useSync } from "../../Hooks/useSync";
import { ContextMenu } from "./ContextMenu";
import { RenameModal } from "./RenameModal";
import { confirmDialog } from "../ConfirmChangesModal";
import { deleteConfirmDialog } from "../DeleteConfirmModal";
import { DatasourceSyncIcon } from "../Sync/DatasourceSyncIcon";
import { DatasourcePublishIcon } from "../Sync/DatasourcePublishIcon";
import { EditDatasourceMetadataModal } from "../CustomDatasource";
import { PublishDatasourceModal } from "../DatasourcePublish/PublishDatasourceModal";
import "./TreeView.css";

export function TreeDatasource({ datasource, selectedTreeIndex, setSelectedTreeIndex, children }) {
  const {
    setActiveCard,
    setActiveCategory,
    removeLocalDatasource,
    saveActiveCard,
    cardUpdated,
    updateCategory,
    updateDatasourceMetadata,
    updateDatasourceCloudState,
  } = useCardStorage();
  const { user } = useAuth();
  const { deleteLocalDatasourceFromCloud } = useSync();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const handleRename = (newName) => {
    updateDatasourceMetadata(datasource.uuid, { name: newName });
    setIsRenameModalOpen(false);
    message.success("Datasource has been renamed.");
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    // If datasource is uploaded/synced, offer to delete from cloud as well
    if (datasource.isUploaded || datasource.cloudId) {
      const cloudMessage = datasource.isPublished
        ? "This datasource is published. Do you want to delete it from the cloud as well? Subscribers will lose access."
        : "This datasource is synced to cloud. Do you want to delete it from the cloud as well?";

      confirmDialog({
        title: "Delete datasource?",
        content: cloudMessage,
        saveText: "Delete from cloud",
        discardText: "Keep in cloud",
        handleSave: async () => {
          // Delete from cloud first, then local
          if (datasource.cloudId) {
            await deleteLocalDatasourceFromCloud(datasource);
          }
          removeLocalDatasource(datasource.uuid);
          message.success("Datasource deleted from cloud and locally.");
        },
        handleDiscard: () => {
          // Delete locally only
          removeLocalDatasource(datasource.uuid);
          message.success("Datasource deleted locally. Cloud copy retained.");
        },
        handleCancel: () => {},
      });
    } else {
      // Local-only datasource - simple delete confirmation
      deleteConfirmDialog({
        title: "Are you sure you want to delete this datasource?",
        content: "This action cannot be undone and will delete all cards in this datasource.",
        onConfirm: async () => {
          removeLocalDatasource(datasource.uuid);
          message.success("Datasource has been removed.");
        },
      });
    }
  };

  const handleToggleSync = () => {
    if (datasource.syncEnabled) {
      updateDatasourceCloudState(datasource.uuid, {
        syncEnabled: false,
        syncStatus: "local",
      });
      message.success("Cloud sync disabled.");
    } else {
      if (!user) {
        message.error("Please sign in to enable cloud sync.");
        return;
      }
      updateDatasourceCloudState(datasource.uuid, {
        syncEnabled: true,
        syncStatus: "pending",
      });
      message.success("Cloud sync enabled.");
    }
  };

  const handleOpenPublishModal = () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishSuccess = (shareCode, newVersion) => {
    if (shareCode) {
      message.success(`Published! Share code: ${shareCode}`);
    } else if (newVersion) {
      message.success(`Update pushed (version ${newVersion})`);
    }
  };

  const handleEditMetadata = () => {
    setIsEditMetadataModalOpen(true);
  };

  // Build context menu items based on datasource state
  const contextMenuItems = [
    // Cloud sync option (only show when user is logged in and datasource is uploaded)
    ...(user && datasource.isUploaded
      ? [
          {
            key: "toggle-sync",
            label: datasource.syncEnabled ? "Disable Cloud Sync" : "Enable Cloud Sync",
            icon: <Cloud size={14} />,
            onClick: handleToggleSync,
          },
          {
            type: "divider",
          },
        ]
      : []),
    // Publish option (only show when uploaded but not published)
    ...(user && datasource.isUploaded && !datasource.isPublished
      ? [
          {
            key: "publish",
            label: "Publish",
            icon: <Share2 size={14} />,
            onClick: handleOpenPublishModal,
          },
          {
            type: "divider",
          },
        ]
      : []),
    // Push update option (only show when published)
    ...(user && datasource.isPublished
      ? [
          {
            key: "push-update",
            label: "Push Update to Subscribers",
            icon: <RefreshCw size={14} />,
            onClick: handleOpenPublishModal,
          },
          {
            type: "divider",
          },
        ]
      : []),
    {
      key: "edit-metadata",
      label: "Edit Metadata",
      icon: <Settings2 size={14} />,
      onClick: handleEditMetadata,
    },
    {
      key: "rename",
      label: "Rename",
      onClick: () => setIsRenameModalOpen(true),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  const onSelect = () => {
    if (selectedTreeIndex === `ds-${datasource.uuid}`) {
      setSelectedTreeIndex(null);
      setActiveCard(null);
      setActiveCategory(null);
    } else {
      setSelectedTreeIndex(`ds-${datasource.uuid}`);
      setActiveCard(null);
      setActiveCategory(datasource);
    }
  };

  const handleClick = () => {
    if (cardUpdated) {
      confirmDialog({
        title: "You have unsaved changes",
        content: "Do you want to save before switching?",
        handleSave: () => {
          saveActiveCard();
          onSelect();
        },
        handleDiscard: () => {
          onSelect();
        },
        handleCancel: () => {},
      });
    } else {
      onSelect();
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    updateCategory({ ...datasource, closed: !datasource.closed }, datasource.uuid);
  };

  const isSelected = selectedTreeIndex === `ds-${datasource.uuid}`;

  const datasourceClasses = ["tree-datasource", isSelected ? "selected" : ""].filter(Boolean).join(" ");

  return (
    <>
      <div className={datasourceClasses} onClick={handleClick} onContextMenu={handleContextMenu}>
        <div className={`tree-datasource-toggle ${!datasource.closed ? "expanded" : ""}`} onClick={handleToggle}>
          <ChevronRight size={10} />
        </div>
        <div className="tree-datasource-icon">
          <Package size={14} />
        </div>
        <span className="tree-datasource-name">{datasource.name}</span>
        <DatasourceSyncIcon datasource={datasource} />
        <DatasourcePublishIcon datasource={datasource} onPublish={handleOpenPublishModal} />
        {datasource.isPublished && <span className="tree-datasource-badge published">Published</span>}
      </div>

      {!datasource.closed && children}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      <RenameModal
        isOpen={isRenameModalOpen}
        title="Rename datasource"
        initialValue={datasource.name}
        onConfirm={handleRename}
        onCancel={() => setIsRenameModalOpen(false)}
      />

      <EditDatasourceMetadataModal
        isOpen={isEditMetadataModalOpen}
        onClose={() => setIsEditMetadataModalOpen(false)}
        datasource={datasource}
      />

      <PublishDatasourceModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        datasource={datasource}
        onSuccess={handlePublishSuccess}
      />
    </>
  );
}
