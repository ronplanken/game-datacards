import { Trash2, File, Inbox, Upload } from "lucide-react";
import { Button, Tooltip } from "antd";
import { compare } from "compare-versions";
import React, { useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useFirebase } from "../../Hooks/useFirebase";
import { v4 as uuidv4 } from "uuid";
import "./ImportExport.css";

const modalRoot = document.getElementById("modal-root");

export const Importer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { importCategory } = useCardStorage();
  const { logScreenView } = useFirebase();

  const handleClose = () => {
    setIsModalVisible(false);
    setUploadFile(null);
    setFileInfo(null);
    setFileError(false);
  };

  const handleImport = () => {
    if (!uploadFile) return;

    // Get sub-categories from export (if present)
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
      // Generate new UUIDs for sub-categories
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

  return (
    <>
      {isModalVisible &&
        ReactDOM.createPortal(
          <div className="import-export-modal-overlay" onClick={handleClose}>
            <div className="import-export-modal" onClick={(e) => e.stopPropagation()}>
              <div className="import-export-modal-header">
                <h2 className="import-export-modal-title">Import Game Datacards</h2>
              </div>
              <div className="import-export-modal-body">
                <div className="import-export-tabs">
                  <div className="import-export-tab active">Game-datacards</div>
                </div>
                <div className="import-export-content">
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
                    <p className="import-dropzone-text">Click or drag a file to this area to upload</p>
                    <p className="import-dropzone-hint">Support for a single file upload. Only .json files.</p>
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
                </div>
              </div>
              <div className="import-export-modal-footer">
                <button className="ie-btn" onClick={handleClose}>
                  Cancel
                </button>
                <button className="ie-btn-primary" onClick={handleImport} disabled={!uploadFile}>
                  Import
                </button>
              </div>
            </div>
          </div>,
          modalRoot
        )}
      <Tooltip title={"Import category from JSON"} placement="bottomLeft">
        <Button
          type={"text"}
          shape={"circle"}
          icon={<Upload size={14} />}
          onClick={() => {
            logScreenView("Import Category");
            setIsModalVisible(true);
          }}
        />
      </Tooltip>
    </>
  );
};
