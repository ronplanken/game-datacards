import {
  Trash2,
  File,
  Inbox,
  Upload,
  Link,
  Download,
  CheckCircle,
  AlertCircle,
  Settings,
  X,
  Users,
  FileJson,
  Gamepad2,
  Database,
  Swords,
} from "lucide-react";
import { Button } from "antd";
import { message } from "../Toast/message";
import { Tooltip } from "../Tooltip/Tooltip";
import { compare } from "compare-versions";
import React, { useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { v4 as uuidv4 } from "uuid";
import { validateCustomDatasource, countDatasourceCards } from "../../Helpers/customDatasource.helpers";
import { GwAppTab } from "./tabs/GwAppTab";
import { ListForgeTab } from "./tabs/ListForgeTab";
import "./ImportExport.css";

const modalRoot = document.getElementById("modal-root");

export const Importer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("json");

  // GDC JSON tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Datasource tab state
  const [dsUrl, setDsUrl] = useState("");
  const [dsFetching, setDsFetching] = useState(false);
  const [dsUrlError, setDsUrlError] = useState(null);
  const [dsFileInfo, setDsFileInfo] = useState(null);
  const [dsFileError, setDsFileError] = useState(null);
  const [dsPreview, setDsPreview] = useState(null);
  const [dsDragging, setDsDragging] = useState(false);
  const dsFileInputRef = useRef(null);

  // Post-import state
  const [showActivationPrompt, setShowActivationPrompt] = useState(false);
  const [importedDatasource, setImportedDatasource] = useState(null);

  // Footer slot for tab-rendered buttons
  const [footerNode, setFooterNode] = useState(null);

  const { importCategory } = useCardStorage();
  const { importCustomDatasource, dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const handleClose = () => {
    setIsModalVisible(false);
    setActiveTab("json");
    // Reset GDC JSON state
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
    // Reset Datasource state
    setDsUrl("");
    setDsUrlError(null);
    setDsFileInfo(null);
    setDsFileError(null);
    setDsPreview(null);
    setShowActivationPrompt(false);
    setImportedDatasource(null);
  };

  // Check if GW 40k App / List Forge tabs should be enabled
  const isGwAppEnabled = settings.selectedDataSource === "40k-10e";
  const isLfEnabled = settings.selectedDataSource === "40k-10e";

  // ===========================================
  // GDC JSON Tab Handlers
  // ===========================================

  const handleImport = () => {
    if (!uploadFile) return;

    const subCategories = uploadFile.subCategories || [];

    if (compare(uploadFile.version, "0.4.0", "=")) {
      importCategory({
        uuid: uuidv4(),
        name: "Imported Cards",
        cards: uploadFile.cards,
      });
    }
    if (compare(uploadFile.version, "0.5.0", ">=") && compare(uploadFile.version, "1.2.0", "<=")) {
      importCategory({
        ...uploadFile.category,
        cards: uploadFile.category.cards.map((card) => {
          return { ...card, source: "40k" };
        }),
      });
    }
    if (compare(uploadFile.version, "1.3.0", ">=")) {
      const importedSubCategories = subCategories.map((sub) => ({
        ...sub,
        uuid: uuidv4(),
        cards: sub.cards?.map((card) => ({ ...card, uuid: uuidv4() })),
      }));
      importCategory(uploadFile.category, importedSubCategories);
    }

    handleClose();
  };

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedJson = JSON.parse(event.target.result);
        if (importedJson.website && importedJson.website === "https://game-datacards.eu") {
          setFileInfo({
            name: `${file.name} [ver. ${importedJson.version}]`,
            size: file.size,
          });
          setUploadFile(importedJson);
          setFileError(false);
        } else {
          setFileInfo({
            name: file.name,
            size: file.size,
          });
          setUploadFile(null);
          setFileError(true);
        }
      } catch (e) {
        setFileInfo({
          name: file.name,
          size: file.size,
        });
        setUploadFile(null);
        setFileError(true);
      }
    };

    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".json")) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===========================================
  // Datasource Tab Handlers
  // ===========================================

  const handleFetchUrl = async () => {
    if (!dsUrl.trim()) {
      setDsUrlError("Please enter a URL");
      return;
    }

    setDsFetching(true);
    setDsUrlError(null);
    setDsPreview(null);
    setDsFileInfo(null);
    setDsFileError(null);

    try {
      const response = await fetch(dsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const validation = validateCustomDatasource(data);

      if (!validation.isValid) {
        setDsUrlError(validation.errors.join(", "));
        return;
      }

      setDsPreview({ data, sourceType: "url", sourceUrl: dsUrl });
    } catch (error) {
      setDsUrlError(error.message || "Failed to fetch datasource");
    } finally {
      setDsFetching(false);
    }
  };

  const processDsFile = (file) => {
    setDsFileError(null);
    setDsFileInfo(null);
    setDsPreview(null);
    setDsUrlError(null);

    if (!file.name.endsWith(".json")) {
      setDsFileError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const validation = validateCustomDatasource(data);

        if (!validation.isValid) {
          setDsFileError(validation.errors.join(", "));
          setDsFileInfo({ name: file.name, size: file.size, valid: false });
          return;
        }

        setDsFileInfo({ name: file.name, size: file.size, valid: true });
        setDsPreview({ data, sourceType: "local" });
      } catch (e) {
        setDsFileError("Invalid JSON file");
        setDsFileInfo({ name: file.name, size: file.size, valid: false });
      }
    };
    reader.readAsText(file);
  };

  const handleDsFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processDsFile(file);
    }
  };

  const handleDsDrop = (e) => {
    e.preventDefault();
    setDsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processDsFile(file);
    }
  };

  const handleDsDragOver = (e) => {
    e.preventDefault();
    setDsDragging(true);
  };

  const handleDsDragLeave = () => {
    setDsDragging(false);
  };

  const handleClearDsFile = () => {
    setDsFileInfo(null);
    setDsFileError(null);
    setDsPreview(null);
    setDsUrl("");
    setDsUrlError(null);
    if (dsFileInputRef.current) {
      dsFileInputRef.current.value = "";
    }
  };

  const handleImportDatasource = async () => {
    if (!dsPreview) return;

    const result = await importCustomDatasource(
      dsPreview.data,
      dsPreview.sourceType,
      dsPreview.sourceType === "url" ? dsPreview.sourceUrl : undefined,
    );

    if (result.success) {
      setImportedDatasource({
        id: result.id,
        name: dsPreview.data.name,
      });
      setShowActivationPrompt(true);
    } else {
      message.error(result.error || "Failed to import datasource");
    }
  };

  const handleActivateDatasource = () => {
    if (importedDatasource) {
      updateSettings({
        ...settings,
        selectedDataSource: importedDatasource.id,
      });
      message.success(`Switched to "${importedDatasource.name}"`);
    }
    handleClose();
  };

  const handleKeepCurrent = () => {
    message.success(`Datasource "${importedDatasource?.name}" imported successfully`);
    handleClose();
  };

  return (
    <>
      {isModalVisible &&
        ReactDOM.createPortal(
          <div className="import-export-modal-overlay" onClick={handleClose}>
            <div className="import-export-modal" onClick={(e) => e.stopPropagation()}>
              <div className="import-export-modal-header">
                <span className="import-export-modal-title">
                  <Upload size={18} />
                  Import
                </span>
                <button className="import-export-modal-close" onClick={handleClose}>
                  <X size={18} />
                </button>
              </div>
              <div className="import-export-modal-body">
                {/* Sidebar */}
                <nav className="import-export-sidebar">
                  <div
                    className={`import-export-nav-item ${activeTab === "json" ? "active" : ""}`}
                    onClick={() => setActiveTab("json")}>
                    <FileJson size={16} className="import-export-nav-icon" />
                    <span>GDC JSON</span>
                  </div>
                  <Tooltip content={!isGwAppEnabled ? "Only available for 10th Edition 40k" : ""} placement="right">
                    <div
                      className={`import-export-nav-item ${activeTab === "gwapp" ? "active" : ""} ${
                        !isGwAppEnabled ? "disabled" : ""
                      }`}
                      onClick={() => isGwAppEnabled && setActiveTab("gwapp")}>
                      <Gamepad2 size={16} className="import-export-nav-icon" />
                      <span>GW 40k App</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={!isLfEnabled ? "Only available for 10th Edition 40k" : ""} placement="right">
                    <div
                      className={`import-export-nav-item ${activeTab === "listforge" ? "active" : ""} ${
                        !isLfEnabled ? "disabled" : ""
                      }`}
                      onClick={() => isLfEnabled && setActiveTab("listforge")}>
                      <Swords size={16} className="import-export-nav-icon" />
                      <span>List Forge</span>
                    </div>
                  </Tooltip>
                  <div
                    className={`import-export-nav-item ${activeTab === "datasource" ? "active" : ""}`}
                    onClick={() => setActiveTab("datasource")}>
                    <Database size={16} className="import-export-nav-icon" />
                    <span>Datasource</span>
                  </div>
                </nav>

                {/* Content */}
                <div className="import-export-content">
                  {/* GDC JSON Tab */}
                  {activeTab === "json" && (
                    <>
                      <p className="import-export-description">
                        Import a category that was previously exported from GameDatacards.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                      <div
                        className={`import-dropzone ${isDragging ? "dragging" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}>
                        <div className="import-dropzone-icon">
                          <Inbox size={24} />
                        </div>
                        <p className="import-dropzone-text">Click or drag a file to upload</p>
                        <p className="import-dropzone-hint">Only .json files exported from GameDatacards.</p>
                      </div>

                      {fileInfo && (
                        <div className={`import-file-item ${fileError ? "error" : "success"}`}>
                          <File size={14} className="import-file-icon" />
                          <span className="import-file-name">{fileInfo.name}</span>
                          <span className="import-file-size">{Math.round(fileInfo.size / 1024)}KiB</span>
                          <button className="import-file-remove" onClick={handleRemoveFile}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      {fileError && (
                        <p className="import-file-error-text">This file cannot be read as a Game Datacards export.</p>
                      )}
                    </>
                  )}

                  {/* GW 40k App Tab */}
                  {activeTab === "gwapp" && (
                    <GwAppTab
                      dataSource={dataSource}
                      settings={settings}
                      importCategory={importCategory}
                      onClose={handleClose}
                      footerNode={footerNode}
                    />
                  )}

                  {/* List Forge Tab */}
                  {activeTab === "listforge" && (
                    <ListForgeTab
                      dataSource={dataSource}
                      settings={settings}
                      importCategory={importCategory}
                      onClose={handleClose}
                      footerNode={footerNode}
                    />
                  )}

                  {/* Datasource Tab */}
                  {activeTab === "datasource" && !showActivationPrompt && (
                    <div className="ie-datasource-import">
                      <input
                        type="file"
                        ref={dsFileInputRef}
                        accept=".json"
                        onChange={handleDsFileSelect}
                        style={{ display: "none" }}
                      />

                      {/* Show inputs only when no preview exists */}
                      {!dsPreview && (
                        <>
                          <p className="import-export-description">
                            Import a custom datasource from a URL or local file. Datasources provide card data for
                            custom factions or game systems.
                          </p>

                          {/* URL Input */}
                          <div className="ie-ds-url-section">
                            <div className="ie-ds-url-group">
                              <div className="ie-ds-url-input-wrapper">
                                <Link size={14} className="ie-ds-url-icon" />
                                <input
                                  type="text"
                                  className="ie-ds-url-input"
                                  placeholder="https://example.com/datasource.json"
                                  value={dsUrl}
                                  onChange={(e) => setDsUrl(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                                />
                              </div>
                              <button
                                className="ie-ds-fetch-btn"
                                onClick={handleFetchUrl}
                                disabled={dsFetching || !dsUrl.trim()}>
                                {dsFetching ? <span className="ie-loading-spinner" /> : <Download size={14} />}
                                Fetch
                              </button>
                            </div>
                            {dsUrlError && (
                              <div className="ie-ds-error">
                                <AlertCircle size={14} />
                                <span>{dsUrlError}</span>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="ie-import-divider">
                            <span>or</span>
                          </div>

                          {/* File Upload */}
                          <div
                            className={`import-dropzone ${dsDragging ? "dragging" : ""}`}
                            onClick={() => dsFileInputRef.current?.click()}
                            onDrop={handleDsDrop}
                            onDragOver={handleDsDragOver}
                            onDragLeave={handleDsDragLeave}>
                            <div className="import-dropzone-icon">
                              <Inbox size={24} />
                            </div>
                            <p className="import-dropzone-text">Click or drag a file to upload</p>
                            <p className="import-dropzone-hint">Only .json datasource files</p>
                          </div>

                          {dsFileError && <p className="import-file-error-text">{dsFileError}</p>}
                        </>
                      )}

                      {/* Show file info and preview when data is loaded */}
                      {dsPreview && (
                        <div className="ie-ds-file-selected">
                          <div className={`ie-ds-file-item success`}>
                            <span className="ie-ds-file-icon">
                              <CheckCircle size={16} />
                            </span>
                            <div className="ie-ds-file-details">
                              <span className="ie-ds-file-name">{dsFileInfo?.name || dsPreview.data.name}</span>
                              <span className="ie-ds-file-meta">
                                {dsPreview.sourceType === "url" ? "External URL" : "Local File"}
                              </span>
                            </div>
                            <button className="ie-ds-file-remove" onClick={handleClearDsFile} title="Remove">
                              <X size={14} />
                            </button>
                          </div>

                          <div className="ie-ds-preview">
                            <div className="ie-ds-preview-header">
                              <CheckCircle size={16} className="ie-ds-preview-icon" />
                              <span>Ready to import</span>
                            </div>
                            <div className="ie-ds-preview-details">
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Name</span>
                                <span className="ie-ds-preview-value">{dsPreview.data.name}</span>
                              </div>
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Version</span>
                                <span className="ie-ds-preview-value">{dsPreview.data.version}</span>
                              </div>
                              <div className="ie-ds-preview-item">
                                <span className="ie-ds-preview-label">Cards</span>
                                <span className="ie-ds-preview-value">{countDatasourceCards(dsPreview.data)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activation Prompt */}
                  {activeTab === "datasource" && showActivationPrompt && (
                    <div className="ie-ds-activation">
                      <div className="ie-ds-activation-icon">
                        <CheckCircle size={48} />
                      </div>
                      <h3 className="ie-ds-activation-title">Datasource Imported</h3>
                      <p className="ie-ds-activation-name">&quot;{importedDatasource?.name}&quot;</p>
                      <p className="ie-ds-activation-text">Would you like to switch to this datasource now?</p>
                      <div className="ie-ds-activation-buttons">
                        <button className="ie-btn" onClick={handleKeepCurrent}>
                          Keep Current
                        </button>
                        <button className="ie-btn-primary" onClick={handleActivateDatasource}>
                          Switch Now
                        </button>
                      </div>
                      <a
                        href="#"
                        className="ie-ds-settings-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClose();
                        }}>
                        <Settings size={12} />
                        Manage datasources in Settings
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="import-export-modal-footer">
                {!showActivationPrompt && (
                  <>
                    <button className="ie-btn" onClick={handleClose}>
                      Cancel
                    </button>
                    {activeTab === "json" && (
                      <button className="ie-btn-primary" onClick={handleImport} disabled={!uploadFile}>
                        Import
                      </button>
                    )}
                    {/* GW App and List Forge footer buttons are rendered via portal by their tab components */}
                    <div ref={setFooterNode} style={{ display: "contents" }} />
                    {activeTab === "datasource" && (
                      <button className="ie-btn-primary" onClick={handleImportDatasource} disabled={!dsPreview}>
                        Import Datasource
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <Tooltip content="Import cards, lists, or datasources" placement="bottom-start">
        <Button
          type="text"
          icon={<Upload size={16} />}
          onClick={() => {
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
