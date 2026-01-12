import { Link, Share2, Info } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";
import { message } from "./Toast/message";
import "./ShareModal.css";

export const ShareModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareId, setShareId] = useState();
  const [isGenerating, setIsGenerating] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { shareCategory, logScreenView } = useFirebase();
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    const docId = await shareCategory(activeCategory);
    setShareId(docId.id);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${import.meta.env.VITE_URL}/shared/${shareId}`);
    message.success("Link copied to clipboard");
  };

  const handleOpen = () => {
    logScreenView("Share category");
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

  const shareUrl = shareId ? `${import.meta.env.VITE_URL}/shared/${shareId}` : null;
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

                <button
                  className="share-action-btn"
                  onClick={shareUrl ? handleCopy : handleGenerate}
                  disabled={isGenerating}>
                  {isGenerating && <span className="share-btn-spinner" />}
                  {isGenerating ? "Generating..." : shareUrl ? "Copy Link" : "Generate Link"}
                </button>
              </div>

              <div className="share-dropdown-divider" />

              {/* Note */}
              <div className="share-dropdown-note">
                <Info size={14} />
                <span>Links are snapshots and won&apos;t auto-update</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
