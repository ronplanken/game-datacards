import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Package, X, Palette } from "lucide-react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import "./EditDatasourceMetadataModal.css";

export function EditDatasourceMetadataModal({ isOpen, onClose, datasource }) {
  const { updateDatasourceMetadata } = useCardStorage();

  const [formData, setFormData] = useState({
    name: "",
    version: "",
    author: "",
    datasourceId: "",
    headerColor: "#1a1a1a",
    bannerColor: "#4a4a4a",
  });

  // Initialize form with datasource data
  useEffect(() => {
    if (datasource && isOpen) {
      setFormData({
        name: datasource.name || "",
        version: datasource.version || "1.0.0",
        author: datasource.author || "",
        datasourceId: datasource.datasourceId || datasource.uuid || "",
        headerColor: datasource.colours?.header || "#1a1a1a",
        bannerColor: datasource.colours?.banner || "#4a4a4a",
      });
    }
  }, [datasource, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    updateDatasourceMetadata(datasource.uuid, {
      name: formData.name.trim(),
      version: formData.version.trim() || "1.0.0",
      author: formData.author.trim(),
      datasourceId: formData.datasourceId.trim() || datasource.uuid,
      colours: {
        header: formData.headerColor,
        banner: formData.bannerColor,
      },
    });

    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !datasource) return null;

  const cardCount = datasource.cards?.length || 0;

  return ReactDOM.createPortal(
    <div className="edit-ds-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-ds-modal">
        {/* Header */}
        <div className="edit-ds-header">
          <h2 className="edit-ds-title">
            <Package size={20} />
            Edit Datasource
          </h2>
          <button className="edit-ds-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="edit-ds-content">
          {/* Summary */}
          <div className="edit-ds-summary">
            <p className="edit-ds-card-count">{cardCount} cards in this datasource</p>
          </div>

          {/* Form */}
          <div className="edit-ds-form">
            {/* Name field */}
            <div className="edit-ds-field">
              <label className="edit-ds-label">
                Datasource Name <span className="edit-ds-required">*</span>
              </label>
              <input
                type="text"
                className="edit-ds-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="My Custom Datasource"
              />
            </div>

            {/* Version and Author row */}
            <div className="edit-ds-row">
              <div className="edit-ds-field edit-ds-half">
                <label className="edit-ds-label">Version</label>
                <input
                  type="text"
                  className="edit-ds-input"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
              <div className="edit-ds-field edit-ds-half">
                <label className="edit-ds-label">Author</label>
                <input
                  type="text"
                  className="edit-ds-input"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Datasource ID field */}
            <div className="edit-ds-field">
              <label className="edit-ds-label">Datasource ID</label>
              <input
                type="text"
                className="edit-ds-input"
                value={formData.datasourceId}
                onChange={(e) => handleInputChange("datasourceId", e.target.value)}
                placeholder="my-datasource-id"
              />
              <p className="edit-ds-help">Unique identifier used internally</p>
            </div>

            {/* Colors */}
            <div className="edit-ds-field">
              <label className="edit-ds-label">
                <Palette size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Card Colors
              </label>
              <div className="edit-ds-color-row">
                <div className="edit-ds-color-picker">
                  <span className="edit-ds-color-label">Header</span>
                  <div className="edit-ds-color-input-wrapper">
                    <input
                      type="color"
                      className="edit-ds-color-input"
                      value={formData.headerColor}
                      onChange={(e) => handleInputChange("headerColor", e.target.value)}
                    />
                    <span className="edit-ds-color-value">{formData.headerColor}</span>
                  </div>
                </div>
                <div className="edit-ds-color-picker">
                  <span className="edit-ds-color-label">Banner</span>
                  <div className="edit-ds-color-input-wrapper">
                    <input
                      type="color"
                      className="edit-ds-color-input"
                      value={formData.bannerColor}
                      onChange={(e) => handleInputChange("bannerColor", e.target.value)}
                    />
                    <span className="edit-ds-color-value">{formData.bannerColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="edit-ds-footer">
          <button className="edit-ds-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="edit-ds-btn primary" onClick={handleSave} disabled={!formData.name.trim()}>
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
