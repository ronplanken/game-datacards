import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Input } from "antd";
import { message } from "../Toast/message";
import { Package, X, Hash, AlertCircle } from "lucide-react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSync } from "../../Hooks/useSync";
import { generateIdFromName, countCardsByType, formatCardBreakdown } from "../../Helpers/customDatasource.helpers";
import "./ConvertToDatasourceModal.css";

export const ConvertToDatasourceModal = ({ isOpen, onClose, category }) => {
  const { convertCategoryToDatasource, getSubCategories } = useCardStorage();
  const { deleteFromCloud } = useSync();

  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [author, setAuthor] = useState("");
  const [headerColor, setHeaderColor] = useState("#1a1a1a");
  const [bannerColor, setBannerColor] = useState("#4a4a4a");

  // Check for sub-categories
  const subCategories = useMemo(() => {
    if (!category) return [];
    return getSubCategories(category.uuid);
  }, [category, getSubCategories]);

  const hasSubCategories = subCategories.length > 0;
  const isSynced = category?.syncEnabled;

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

  const isValid = name.trim() && version.trim() && !hasSubCategories;

  const handleConvert = async () => {
    if (!isValid) return;

    const result = convertCategoryToDatasource(category.uuid, {
      name: name.trim(),
      id: id.trim() || generateIdFromName(name),
      version: version.trim(),
      author: author.trim() || null,
      colours: {
        header: headerColor,
        banner: bannerColor,
      },
    });

    if (result.success) {
      // If the category was synced, delete it from cloud
      if (result.shouldDeleteFromCloud && result.categoryCloudId) {
        await deleteFromCloud(category.uuid);
      }

      const syncMessage = result.datasource.syncEnabled ? " Cloud sync has been enabled." : "";
      message.success(`"${name}" has been converted to a local datasource.${syncMessage}`);
      onClose();
    } else {
      message.error(result.error || "Failed to convert category");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="convert-ds-modal-overlay" onClick={handleOverlayClick}>
      <div className="convert-ds-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="convert-ds-header">
          <span className="convert-ds-title">
            <Package size={18} />
            Convert to Local Datasource
          </span>
          <button className="convert-ds-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="convert-ds-content">
          {/* Warnings */}
          {hasSubCategories && (
            <div className="convert-ds-warning error">
              <AlertCircle size={16} />
              <div>
                <strong>Cannot convert</strong>
                <p>
                  This category has {subCategories.length} sub-categor{subCategories.length === 1 ? "y" : "ies"}. Please
                  move or delete sub-categories first.
                </p>
              </div>
            </div>
          )}

          {isSynced && !hasSubCategories && (
            <div className="convert-ds-warning info">
              <AlertCircle size={16} />
              <div>
                <strong>Category will be converted to synced datasource</strong>
                <p>The synced category will be removed from cloud and replaced with a new synced datasource.</p>
              </div>
            </div>
          )}

          {/* Category Summary */}
          <div className="convert-ds-summary">
            <p className="convert-ds-category-name">
              Converting category: <strong>{category?.name}</strong>
            </p>
            <p className="convert-ds-card-count">
              Contains {total} card{total !== 1 ? "s" : ""}
              {cardBreakdown && ` (${cardBreakdown})`}
            </p>
          </div>

          {/* Form */}
          <div className="convert-ds-form">
            <div className="convert-ds-field">
              <label className="convert-ds-label">
                Datasource Name <span className="convert-ds-required">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Army"
                size="small"
                disabled={hasSubCategories}
              />
            </div>

            <div className="convert-ds-row">
              <div className="convert-ds-field convert-ds-half">
                <label className="convert-ds-label">
                  Version <span className="convert-ds-required">*</span>
                </label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  size="small"
                  disabled={hasSubCategories}
                />
              </div>
              <div className="convert-ds-field convert-ds-half">
                <label className="convert-ds-label">Author</label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  size="small"
                  disabled={hasSubCategories}
                />
              </div>
            </div>

            <div className="convert-ds-field">
              <label className="convert-ds-label">Datasource ID</label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="my-custom-army"
                size="small"
                prefix={<Hash size={14} style={{ color: "rgba(0,0,0,0.45)" }} />}
                disabled={hasSubCategories}
              />
              <span className="convert-ds-help">Used for linking updates to this datasource</span>
            </div>

            <div className="convert-ds-field">
              <label className="convert-ds-label">Faction Colors</label>
              <div className="convert-ds-color-row">
                <div className="convert-ds-color-picker">
                  <span className="convert-ds-color-label">Header</span>
                  <div className="convert-ds-color-input-wrapper">
                    <input
                      type="color"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="convert-ds-color-input"
                      disabled={hasSubCategories}
                    />
                    <span className="convert-ds-color-value">{headerColor}</span>
                  </div>
                </div>
                <div className="convert-ds-color-picker">
                  <span className="convert-ds-color-label">Banner</span>
                  <div className="convert-ds-color-input-wrapper">
                    <input
                      type="color"
                      value={bannerColor}
                      onChange={(e) => setBannerColor(e.target.value)}
                      className="convert-ds-color-input"
                      disabled={hasSubCategories}
                    />
                    <span className="convert-ds-color-value">{bannerColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="convert-ds-footer">
          <button className="convert-ds-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="convert-ds-btn primary" onClick={handleConvert} disabled={!isValid}>
            <Package size={14} />
            Convert to Datasource
          </button>
        </div>
      </div>
    </div>
  );
};
