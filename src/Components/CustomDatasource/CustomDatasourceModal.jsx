import React, { useState, useCallback, useRef, useEffect } from "react";
import { message } from "antd";
import {
  Database,
  X,
  Link,
  Download,
  CheckCircle,
  AlertCircle,
  Globe,
  FileJson,
  Trash2,
  RefreshCw,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { validateCustomDatasource } from "../../Helpers/customDatasource.helpers";
import "./CustomDatasourceModal.css";

export const CustomDatasourceModal = ({ isOpen, onClose }) => {
  const { settings } = useSettingsStorage();
  const { importCustomDatasource, removeCustomDatasource, checkCustomDatasourceUpdate, applyCustomDatasourceUpdate } =
    useDataSourceStorage();

  const [activeTab, setActiveTab] = useState("url");

  // URL Import State
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [urlPreview, setUrlPreview] = useState(null);
  const [urlError, setUrlError] = useState(null);

  // File Import State
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  // Manage Tab State
  const [checkingUpdateId, setCheckingUpdateId] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setUrlPreview(null);
      setUrlError(null);
      setFileInfo(null);
      setFileData(null);
      setFileError(null);
      setUpdateAvailable(null);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ==========================================
  // URL Import Handlers
  // ==========================================

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      setUrlError("Please enter a URL");
      return;
    }

    // Validate URL format and protocol
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setUrlError("URL must use HTTP or HTTPS protocol");
        return;
      }
    } catch {
      setUrlError("Please enter a valid URL");
      return;
    }

    setIsFetching(true);
    setUrlError(null);
    setUrlPreview(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const validation = validateCustomDatasource(data);

      if (!validation.isValid) {
        setUrlError(validation.errors.join(", "));
        return;
      }

      setUrlPreview(data);
    } catch (error) {
      // CORS errors appear as TypeError with "Failed to fetch" message
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setUrlError("Could not download file. The external server may not allow cross-origin requests (CORS).");
      } else {
        setUrlError(error.message || "Failed to fetch datasource");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleImportUrl = async () => {
    if (!urlPreview) return;

    const result = await importCustomDatasource(urlPreview, "url", url);

    if (result.success) {
      message.success(`Datasource "${urlPreview.name}" imported successfully`);
      onClose();
    } else {
      message.error(result.error || "Failed to import datasource");
    }
  };

  // ==========================================
  // File Import Handlers
  // ==========================================

  const processFile = (file) => {
    setFileError(null);
    setFileInfo(null);
    setFileData(null);

    if (!file.name.endsWith(".json")) {
      setFileError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const validation = validateCustomDatasource(data);

        if (!validation.isValid) {
          setFileError(validation.errors.join(", "));
          setFileInfo({ name: file.name, size: file.size, valid: false });
          return;
        }

        setFileInfo({ name: file.name, size: file.size, valid: true });
        setFileData(data);
      } catch (e) {
        setFileError("Invalid JSON file");
        setFileInfo({ name: file.name, size: file.size, valid: false });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImportFile = async () => {
    if (!fileData) return;

    const result = await importCustomDatasource(fileData, "local");

    if (result.success) {
      message.success(`Datasource "${fileData.name}" imported successfully`);
      onClose();
    } else {
      message.error(result.error || "Failed to import datasource");
    }
  };

  const clearFile = () => {
    setFileInfo(null);
    setFileData(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // Manage Tab Handlers
  // ==========================================

  const handleCheckUpdate = async (datasourceId) => {
    setCheckingUpdateId(datasourceId);
    setUpdateAvailable(null);

    const result = await checkCustomDatasourceUpdate(datasourceId);

    setCheckingUpdateId(null);

    if (result.error) {
      message.error(result.error);
      return;
    }

    if (result.hasUpdate) {
      setUpdateAvailable({
        datasourceId,
        currentVersion: settings.customDatasources.find((ds) => ds.id === datasourceId)?.version,
        newVersion: result.newVersion,
        newData: result.newData,
      });
    } else {
      message.info("No updates available");
    }
  };

  const handleApplyUpdate = async () => {
    if (!updateAvailable) return;

    const result = await applyCustomDatasourceUpdate(updateAvailable.datasourceId, updateAvailable.newData);

    if (result.success) {
      message.success(`Updated to version ${updateAvailable.newVersion}`);
      setUpdateAvailable(null);
    } else {
      message.error(result.error || "Failed to apply update");
    }
  };

  const handleDelete = async (datasourceId, name) => {
    await removeCustomDatasource(datasourceId);
    message.success(`Datasource "${name}" removed`);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  const customDatasources = settings.customDatasources || [];

  return (
    <div className="cd-modal-overlay" onClick={handleOverlayClick}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cd-modal-header">
          <span className="cd-modal-title">
            <Database size={18} />
            Custom Datasources
          </span>
          <button className="cd-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="cd-tabs">
          <button className={`cd-tab ${activeTab === "url" ? "active" : ""}`} onClick={() => setActiveTab("url")}>
            Import URL
          </button>
          <button className={`cd-tab ${activeTab === "file" ? "active" : ""}`} onClick={() => setActiveTab("file")}>
            Import File
          </button>
          <button className={`cd-tab ${activeTab === "manage" ? "active" : ""}`} onClick={() => setActiveTab("manage")}>
            Manage
            {customDatasources.length > 0 && <span className="cd-tab-badge">{customDatasources.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="cd-modal-content">
          {/* URL Tab */}
          {activeTab === "url" && (
            <div className="cd-url-section">
              <p className="cd-description">
                Enter a URL to a JSON datasource file. The file will be fetched and stored locally. You can check for
                updates later.
              </p>

              <div className="cd-url-input-group">
                <div className="cd-url-input-wrapper">
                  <Link size={14} className="cd-url-input-icon" />
                  <input
                    type="text"
                    className="cd-url-input"
                    placeholder="https://example.com/datasource.json"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                  />
                </div>
                <button className="cd-fetch-btn" onClick={handleFetchUrl} disabled={isFetching || !url.trim()}>
                  {isFetching ? <span className="cd-loading-spinner" /> : <Download size={14} />}
                  Fetch
                </button>
              </div>

              {urlPreview && (
                <div className="cd-preview-card">
                  <div className="cd-preview-header">
                    <CheckCircle size={16} className="cd-preview-icon success" />
                    <span>Valid datasource detected</span>
                  </div>
                  <div className="cd-preview-details">
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Name</span>
                      <span className="cd-preview-value">{urlPreview.name}</span>
                    </div>
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Version</span>
                      <span className="cd-preview-value">{urlPreview.version}</span>
                    </div>
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Faction</span>
                      <span className="cd-preview-value">{urlPreview.data[0]?.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {urlError && (
                <div className="cd-error-card">
                  <AlertCircle size={16} />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
          )}

          {/* File Tab */}
          {activeTab === "file" && (
            <div className="cd-file-section">
              <p className="cd-description">
                Upload a JSON datasource file from your computer. Local files cannot be updated automatically.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              <div
                className={`cd-dropzone ${isDragging ? "dragging" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}>
                <div className="cd-dropzone-icon">
                  <Inbox size={24} />
                </div>
                <p className="cd-dropzone-text">Click or drag a file to this area to upload</p>
                <p className="cd-dropzone-hint">Support for a single file upload. Only .json files.</p>
              </div>

              {fileInfo && (
                <div className={`cd-file-item ${fileInfo.valid ? "success" : "error"}`}>
                  <span className="cd-file-icon">
                    {fileInfo.valid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </span>
                  <span className="cd-file-name">{fileInfo.name}</span>
                  <span className="cd-file-size">{formatFileSize(fileInfo.size)}</span>
                  <button className="cd-file-remove" onClick={clearFile}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {fileError && <p className="cd-file-error-text">{fileError}</p>}

              {fileData && (
                <div className="cd-preview-card">
                  <div className="cd-preview-header">
                    <CheckCircle size={16} className="cd-preview-icon success" />
                    <span>Valid datasource detected</span>
                  </div>
                  <div className="cd-preview-details">
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Name</span>
                      <span className="cd-preview-value">{fileData.name}</span>
                    </div>
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Version</span>
                      <span className="cd-preview-value">{fileData.version}</span>
                    </div>
                    <div className="cd-preview-item">
                      <span className="cd-preview-label">Faction</span>
                      <span className="cd-preview-value">{fileData.data[0]?.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === "manage" && (
            <div className="cd-manage-section">
              {customDatasources.length === 0 ? (
                <div className="cd-empty-state">
                  <Database size={32} className="cd-empty-icon" />
                  <p>No custom datasources imported yet</p>
                  <span>Import from URL or upload a file to get started</span>
                </div>
              ) : (
                <div className="cd-datasource-list">
                  {customDatasources.map((ds, index) => (
                    <div className="cd-datasource-item" key={ds.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="cd-datasource-info">
                        <div className="cd-datasource-name">
                          {ds.sourceType === "url" ? <Globe size={14} /> : <FileJson size={14} />}
                          {ds.name}
                        </div>
                        <div className="cd-datasource-meta">
                          <span className="cd-count-badge">
                            {ds.cardCount || 0} card{ds.cardCount !== 1 ? "s" : ""}
                          </span>
                          <span className="cd-version">v{ds.version}</span>
                          {ds.author && <span className="cd-author">by {ds.author}</span>}
                        </div>
                      </div>
                      <div className="cd-datasource-actions">
                        {ds.sourceType === "url" && (
                          <button
                            className="cd-action-btn"
                            onClick={() => handleCheckUpdate(ds.id)}
                            disabled={checkingUpdateId === ds.id}
                            title="Check for updates">
                            {checkingUpdateId === ds.id ? (
                              <span className="cd-loading-spinner small" />
                            ) : (
                              <RefreshCw size={14} />
                            )}
                          </button>
                        )}
                        <button
                          className="cd-action-btn danger"
                          onClick={() => handleDelete(ds.id, ds.name)}
                          title="Delete datasource">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Update Available Modal */}
              {updateAvailable && (
                <div className="cd-update-preview">
                  <div className="cd-update-header">
                    <RefreshCw size={20} className="cd-update-icon" />
                    <span>Update Available</span>
                  </div>
                  <div className="cd-update-comparison">
                    <div className="cd-update-version">
                      <span className="cd-update-label">Current</span>
                      <span className="cd-update-value">v{updateAvailable.currentVersion}</span>
                    </div>
                    <ArrowRight size={16} className="cd-update-arrow" />
                    <div className="cd-update-version new">
                      <span className="cd-update-label">New</span>
                      <span className="cd-update-value">v{updateAvailable.newVersion}</span>
                    </div>
                  </div>
                  <div className="cd-update-actions">
                    <button className="cd-btn secondary" onClick={() => setUpdateAvailable(null)}>
                      Skip
                    </button>
                    <button className="cd-btn primary" onClick={handleApplyUpdate}>
                      Apply Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cd-modal-footer">
          <button className="cd-btn secondary" onClick={onClose}>
            Cancel
          </button>
          {activeTab === "url" && (
            <button className="cd-btn primary" onClick={handleImportUrl} disabled={!urlPreview}>
              Import
            </button>
          )}
          {activeTab === "file" && (
            <button className="cd-btn primary" onClick={handleImportFile} disabled={!fileData}>
              Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
