import React, { useState, useCallback, useEffect, useMemo } from "react";
import { message, Input } from "antd";
import { Download, X, Hash } from "lucide-react";
import {
  createDatasourceExport,
  generateDatasourceFilename,
  generateIdFromName,
  countCardsByType,
  formatCardBreakdown,
} from "../../Helpers/customDatasource.helpers";
import "./ExportDatasourceModal.css";

export const ExportDatasourceModal = ({ isOpen, onClose, category }) => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [author, setAuthor] = useState("");
  const [headerColor, setHeaderColor] = useState("#1a1a1a");
  const [bannerColor, setBannerColor] = useState("#4a4a4a");

  // Initialize form with category data
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name || "");
      setId(generateIdFromName(category.name || ""));
      setVersion("1.0.0");
      setAuthor("");
      setHeaderColor("#1a1a1a");
      setBannerColor("#4a4a4a");
    }
  }, [isOpen, category]);

  // Auto-generate ID when name changes
  useEffect(() => {
    if (name) {
      setId(generateIdFromName(name));
    }
  }, [name]);

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

  const cards = category?.cards || [];
  const { counts, total } = useMemo(() => countCardsByType(cards), [cards]);
  const cardBreakdown = useMemo(() => formatCardBreakdown(counts), [counts]);

  const isValid = name.trim() && version.trim();

  const handleExport = () => {
    if (!isValid) return;

    try {
      const datasource = createDatasourceExport({
        name: name.trim(),
        id: id.trim() || generateIdFromName(name),
        version: version.trim(),
        author: author.trim() || undefined,
        cards,
        factionName: category.name,
        colours: {
          header: headerColor,
          banner: bannerColor,
        },
      });

      // Generate and download JSON file
      const json = JSON.stringify(datasource, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = generateDatasourceFilename(name);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success(`Datasource exported as ${filename}`);
      onClose();
    } catch (error) {
      message.error("Failed to export datasource");
      console.error("Export error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-ds-modal-overlay" onClick={handleOverlayClick}>
      <div className="export-ds-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-ds-header">
          <span className="export-ds-title">
            <Download size={18} />
            Export as Datasource
          </span>
          <button className="export-ds-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="export-ds-content">
          {/* Category Summary */}
          <div className="export-ds-summary">
            <p className="export-ds-category-name">
              Exporting category: <strong>{category?.name}</strong>
            </p>
            <p className="export-ds-card-count">
              Contains {total} card{total !== 1 ? "s" : ""}
              {cardBreakdown && ` (${cardBreakdown})`}
            </p>
          </div>

          {/* Form */}
          <div className="export-ds-form">
            <div className="export-ds-field">
              <label className="export-ds-label">
                Datasource Name <span className="export-ds-required">*</span>
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Custom Army" size="small" />
            </div>

            <div className="export-ds-row">
              <div className="export-ds-field export-ds-half">
                <label className="export-ds-label">
                  Version <span className="export-ds-required">*</span>
                </label>
                <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" size="small" />
              </div>
              <div className="export-ds-field export-ds-half">
                <label className="export-ds-label">Author</label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  size="small"
                />
              </div>
            </div>

            <div className="export-ds-field">
              <label className="export-ds-label">Datasource ID</label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="my-custom-army"
                size="small"
                prefix={<Hash size={14} style={{ color: "rgba(0,0,0,0.45)" }} />}
              />
              <span className="export-ds-help">Used for linking updates to this datasource</span>
            </div>

            <div className="export-ds-field">
              <label className="export-ds-label">Faction Colors</label>
              <div className="export-ds-color-row">
                <div className="export-ds-color-picker">
                  <span className="export-ds-color-label">Header</span>
                  <div className="export-ds-color-input-wrapper">
                    <input
                      type="color"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="export-ds-color-input"
                    />
                    <span className="export-ds-color-value">{headerColor}</span>
                  </div>
                </div>
                <div className="export-ds-color-picker">
                  <span className="export-ds-color-label">Banner</span>
                  <div className="export-ds-color-input-wrapper">
                    <input
                      type="color"
                      value={bannerColor}
                      onChange={(e) => setBannerColor(e.target.value)}
                      className="export-ds-color-input"
                    />
                    <span className="export-ds-color-value">{bannerColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="export-ds-footer">
          <button className="export-ds-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="export-ds-btn primary" onClick={handleExport} disabled={!isValid}>
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};
