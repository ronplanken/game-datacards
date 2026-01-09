import { Link, Share2, X, Check, Info } from "lucide-react";
import { Tooltip } from "./Tooltip/Tooltip";
import React, { useEffect, useCallback } from "react";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";
import "./ShareModal.css";

export const ShareModal = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [shareId, setShareId] = React.useState();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showCopyToast, setShowCopyToast] = React.useState(false);

  const { shareCategory, logScreenView } = useFirebase();
  const { activeCategory } = useCardStorage();

  // Handle escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isModalVisible) {
        handleClose();
      }
    },
    [isModalVisible],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setShareId(undefined);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const docId = await shareCategory(activeCategory);
    setShareId(docId.id);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${process.env.REACT_APP_URL}/shared/${shareId}`);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const shareUrl = shareId ? `${process.env.REACT_APP_URL}/shared/${shareId}` : null;

  return (
    <>
      {isModalVisible && (
        <div className="share-modal-overlay" onClick={handleOverlayClick}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="share-modal-header">
              <span className="share-modal-title">
                <Share2 size={18} />
                Share {activeCategory?.type === "list" ? "List" : "Category"}
              </span>
              <button className="share-modal-close" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="share-modal-content">
              {/* Category Info */}
              <div className="share-category-info">
                <span className="share-category-name">{activeCategory?.name}</span>
                <span className="share-category-meta">
                  {activeCategory?.type === "list" ? "List" : "Category"} · {activeCategory?.cards?.length || 0}{" "}
                  {activeCategory?.cards?.length === 1 ? "card" : "cards"}
                </span>
              </div>

              <p className="share-modal-description">
                Share your datacard set with others by generating and sharing the following link. When sharing your
                datacard set only active sections will be saved.
              </p>

              <div className="share-link-container">
                <div className={`share-link-field ${shareUrl ? "has-link" : ""}`}>
                  {shareUrl ? (
                    <a className="share-link-text" href={shareUrl} target="_blank" rel="noreferrer">
                      {shareUrl}
                    </a>
                  ) : (
                    <span className="share-link-placeholder">Click generate for a link...</span>
                  )}
                </div>

                {shareUrl ? (
                  <button className="share-btn" onClick={handleCopy}>
                    <Link size={14} />
                    Copy
                  </button>
                ) : (
                  <button className="share-btn" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <span className="share-btn-spinner" /> : null}
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                )}
              </div>

              <div className="share-modal-note">
                <Info size={16} />
                <p className="share-modal-note-text">
                  Please note that the link is a snapshot of the current set and will not be automatically updated.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="share-modal-footer">
              <button className="share-btn share-btn-secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy toast notification */}
      <div className={`share-copy-toast ${showCopyToast ? "visible" : ""}`}>
        <Check size={16} />
        Link copied to clipboard
      </div>

      <Tooltip content="Share category" placement="bottom-start">
        <button
          className="app-header-icon-btn app-header-icon-btn-with-text"
          onClick={() => {
            logScreenView("Share category");
            setIsModalVisible(true);
          }}>
          <Share2 size={16} />
          Share
        </button>
      </Tooltip>
    </>
  );
};
