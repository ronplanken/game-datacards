import React, { useState, useCallback, useRef, useEffect } from "react";
import { message } from "../Toast/message";
import { Database, X, Link, Download, CheckCircle, AlertCircle, Inbox, Globe, FileUp } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { validateCustomDatasource } from "../../Helpers/customDatasource.helpers";
import "./CustomDatasourceModal.css";

export const CustomDatasourceModal = ({ isOpen, onClose }) => {
  const { importCustomDatasource } = useDataSourceStorage();

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setUrlPreview(null);
      setUrlError(null);
      setFileInfo(null);
      setFileData(null);
      setFileError(null);
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

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

        {/* Body with Sidebar */}
        <div className="cd-modal-body">
          {/* Sidebar */}
          <nav className="cd-sidebar">
            <div className={`cd-nav-item ${activeTab === "url" ? "active" : ""}`} onClick={() => setActiveTab("url")}>
              <Globe size={16} className="cd-nav-icon" />
              <span>Import URL</span>
            </div>
            <div className={`cd-nav-item ${activeTab === "file" ? "active" : ""}`} onClick={() => setActiveTab("file")}>
              <FileUp size={16} className="cd-nav-icon" />
              <span>Import File</span>
            </div>
          </nav>

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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {/* Show dropzone only when no file is selected */}
                {!fileInfo && (
                  <>
                    <p className="cd-description">
                      Upload a JSON datasource file from your computer. Local files cannot be updated automatically.
                    </p>
                    <div
                      className={`cd-dropzone ${isDragging ? "dragging" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}>
                      <Inbox size={20} className="cd-dropzone-icon" />
                      <p className="cd-dropzone-text">Click or drag a .json file to upload</p>
                    </div>
                  </>
                )}

                {/* Show file info and preview when file is selected */}
                {fileInfo && (
                  <div className="cd-file-selected">
                    <div className={`cd-file-item ${fileInfo.valid ? "success" : "error"}`}>
                      <span className="cd-file-icon">
                        {fileInfo.valid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      </span>
                      <div className="cd-file-details">
                        <span className="cd-file-name">{fileInfo.name}</span>
                        <span className="cd-file-size">{formatFileSize(fileInfo.size)}</span>
                      </div>
                      <button className="cd-file-remove" onClick={clearFile} title="Remove file">
                        <X size={14} />
                      </button>
                    </div>

                    {fileError && <p className="cd-file-error-text">{fileError}</p>}

                    {fileData && (
                      <div className="cd-preview-card">
                        <div className="cd-preview-header">
                          <CheckCircle size={16} className="cd-preview-icon success" />
                          <span>Ready to import</span>
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
              </div>
            )}
          </div>
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
