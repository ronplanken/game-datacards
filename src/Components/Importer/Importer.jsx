import { Trash2, File, Inbox, Upload, X, Users, FileJson, Gamepad2, Swords } from "lucide-react";
import { Button } from "antd";
import { message } from "../Toast/message";
import { Tooltip } from "../Tooltip/Tooltip";
import { compare } from "compare-versions";
import React, { useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { v4 as uuidv4 } from "uuid";
import { useUmami } from "../../Hooks/useUmami";
import { GwAppTab } from "./tabs/GwAppTab";
import { ListForgeTab } from "./tabs/ListForgeTab";
import "./ImportExport.css";

const modalRoot = document.getElementById("modal-root");

export const Importer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("json");
  const [urlPayload, setUrlPayload] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // GDC JSON tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Footer slot for tab-rendered buttons
  const [footerNode, setFooterNode] = useState(null);

  const { importCategory } = useCardStorage();
  const { dataSource } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const { trackEvent } = useUmami();

  // Consume ListForge URL payload from router state.
  // Deps: only listForgePayload — navigate is stable, location.pathname won't change here.
  useEffect(() => {
    const payload = location.state?.listForgePayload;
    if (payload) {
      navigate(location.pathname, { replace: true, state: {} });
      setUrlPayload(payload);
      setActiveTab("listforge");
      setIsModalVisible(true);
    }
  }, [location.state?.listForgePayload]);

  const handleClose = () => {
    setIsModalVisible(false);
    setActiveTab("json");
    // Reset GDC JSON state
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
    setUrlPayload(null);
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

    trackEvent("import-file", { format: "gdc-json" });
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
          trackEvent("import-error", { type: "invalid-file" });
        }
      } catch (e) {
        setFileInfo({
          name: file.name,
          size: file.size,
        });
        setUploadFile(null);
        setFileError(true);
        trackEvent("import-error", { type: "invalid-file" });
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
                      initialData={urlPayload}
                    />
                  )}
                </div>
              </div>
              <div className="import-export-modal-footer">
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
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <Tooltip content="Import cards or lists" placement="bottom-start">
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
