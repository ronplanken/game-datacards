import { Link, Share2, Info, RefreshCw } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useCategorySharing } from "../Hooks/useCategorySharing";
import { useAuth } from "../Premium";
import { message } from "./Toast/message";
import "./ShareModal.css";

export const ShareModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareId, setShareId] = useState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingShare, setExistingShare] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { shareAnonymous, shareOwned, updateShare, getExistingShare } = useCategorySharing();
  const { isAuthenticated } = useAuth();
  const { activeCategory } = useCardStorage();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Check for existing share when modal opens (authenticated only)
  useEffect(() => {
    if (isOpen && isAuthenticated && activeCategory?.uuid) {
      getExistingShare(activeCategory.uuid).then((share) => {
        setExistingShare(share);
      });
    }
  }, [isOpen, isAuthenticated, activeCategory?.uuid, getExistingShare]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let result;
      if (isAuthenticated) {
        result = await shareOwned(activeCategory, isPublic);
      } else {
        result = await shareAnonymous(activeCategory);
      }

      if (result.success) {
        setShareId(result.shareId);
      } else {
        message.error(result.error || "Failed to share");
      }
    } catch {
      message.error("Failed to generate share link");
    }
    setIsGenerating(false);
  };

  const handleUpdate = async () => {
    if (!existingShare?.share_id) return;

    setIsGenerating(true);
    try {
      const result = await updateShare(existingShare.share_id, activeCategory);
      if (result.success) {
        setShareId(existingShare.share_id);
        message.success("Share updated successfully");
      } else {
        message.error(result.error || "Failed to update share");
      }
    } catch {
      message.error("Failed to update share");
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const id = shareId || existingShare?.share_id;
    navigator.clipboard.writeText(`${import.meta.env.VITE_URL}/shared/${id}`);
    message.success("Link copied to clipboard");
  };

  const handleOpen = () => {
    setShareId(null);
    setExistingShare(null);
    setIsPublic(true);
    setIsOpen(true);
  };

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const currentShareId = shareId || existingShare?.share_id;
  const shareUrl = currentShareId ? `${import.meta.env.VITE_URL}/shared/${currentShareId}` : null;
  const position = getDropdownPosition();

  return (
    <>
      <button ref={buttonRef} className={`share-btn-trigger ${isOpen ? "active" : ""}`} onClick={handleOpen}>
        <Share2 size={16} />
        <span className="share-btn-text">Share</span>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="share-dropdown-overlay">
            <div ref={dropdownRef} className="share-dropdown" style={{ top: position.top, right: position.right }}>
              {/* Header */}
              <div className="share-dropdown-header">
                <Share2 size={16} />
                <span>Share {activeCategory?.type === "list" ? "List" : "Category"}</span>
              </div>

              <div className="share-dropdown-divider" />

              {/* Category Info */}
              <div className="share-dropdown-section">
                <div className="share-category-info">
                  <span className="share-category-name">{activeCategory?.name}</span>
                  <span className="share-category-meta">
                    {activeCategory?.cards?.length || 0} {activeCategory?.cards?.length === 1 ? "card" : "cards"}
                  </span>
                </div>
              </div>

              {/* Visibility toggle (authenticated only) */}
              {isAuthenticated && !shareId && !existingShare && (
                <div className="share-dropdown-section">
                  <div className="share-visibility-toggle">
                    <span className="share-visibility-label">Public link</span>
                    <button
                      className={`share-toggle ${isPublic ? "active" : ""}`}
                      onClick={() => setIsPublic(!isPublic)}
                      role="switch"
                      aria-checked={isPublic}>
                      <span className="share-toggle-thumb" />
                    </button>
                  </div>
                </div>
              )}

              {/* Link Section */}
              <div className="share-dropdown-section">
                <div className={`share-link-field ${shareUrl ? "has-link" : ""}`}>
                  {shareUrl ? (
                    <>
                      <a className="share-link-text" href={shareUrl} target="_blank" rel="noreferrer">
                        {shareUrl}
                      </a>
                      <button className="share-link-copy-btn" onClick={handleCopy}>
                        <Link size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="share-link-placeholder">Click generate for a link...</span>
                  )}
                </div>

                {/* Existing share: show update + new buttons */}
                {existingShare && !shareId ? (
                  <div className="share-action-group">
                    <button
                      className="share-action-btn share-action-btn--update"
                      onClick={handleUpdate}
                      disabled={isGenerating}>
                      {isGenerating && <span className="share-btn-spinner" />}
                      <RefreshCw size={14} />
                      {isGenerating ? "Updating..." : "Update Existing Share"}
                    </button>
                    <button
                      className="share-action-btn share-action-btn--secondary"
                      onClick={handleGenerate}
                      disabled={isGenerating}>
                      Create New Share
                    </button>
                  </div>
                ) : (
                  <button
                    className="share-action-btn"
                    onClick={shareUrl ? handleCopy : handleGenerate}
                    disabled={isGenerating}>
                    {isGenerating && <span className="share-btn-spinner" />}
                    {isGenerating
                      ? "Generating..."
                      : shareUrl
                        ? "Copy Link"
                        : isAuthenticated
                          ? "Share"
                          : "Generate Link"}
                  </button>
                )}
              </div>

              <div className="share-dropdown-divider" />

              {/* Note */}
              <div className="share-dropdown-note">
                <Info size={14} />
                <span>
                  {isAuthenticated
                    ? "You can update this share later from your account menu"
                    : "Links are snapshots and won\u0027t auto-update"}
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
