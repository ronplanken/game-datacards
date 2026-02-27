import { useState, useEffect } from "react";
import { Link, Image, Share2, RefreshCw, Check, Loader } from "lucide-react";
import { BottomSheet } from "./Mobile/BottomSheet";
import { useMobileList } from "./useMobileList";
import { useCategorySharing } from "../../Hooks/useCategorySharing";
import { useAuth } from "../../Premium";
import "./MobileSharingMenu.css";

export const MobileSharingMenu = ({ isVisible, setIsVisible, shareFullCard, shareMobileCard, shareLink }) => {
  const { lists, selectedList } = useMobileList();
  const { shareAnonymous, shareOwned, updateShare, getExistingShare, isSharing } = useCategorySharing();
  const { isAuthenticated } = useAuth();

  const [shareResult, setShareResult] = useState(null);
  const [existingShare, setExistingShare] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  const category = lists[selectedList];

  // Check for existing share when opening (authenticated only)
  useEffect(() => {
    if (isVisible && isAuthenticated && category?.uuid) {
      setCheckingExisting(true);
      getExistingShare(category.uuid)
        .then((share) => setExistingShare(share))
        .finally(() => setCheckingExisting(false));
    }
  }, [isVisible, isAuthenticated, category?.uuid, getExistingShare]);

  const handleClose = () => {
    setIsVisible(false);
    setShareResult(null);
    setExistingShare(null);
    setIsPublic(true);
    setCopied(false);
  };

  const handleShareLink = () => {
    shareLink();
    handleClose();
  };

  const handleShareFullCard = () => {
    shareFullCard();
    handleClose();
  };

  const handleShareMobileCard = () => {
    shareMobileCard();
    handleClose();
  };

  const handleShareCategory = async () => {
    if (!category) return;
    let result;
    if (isAuthenticated) {
      result = await shareOwned(category, isPublic);
    } else {
      result = await shareAnonymous(category);
    }
    if (result.success) {
      setShareResult(result.shareId);
    }
  };

  const handleUpdateCategory = async () => {
    if (!category || !existingShare?.share_id) return;
    const result = await updateShare(existingShare.share_id, category);
    if (result.success) {
      setShareResult(existingShare.share_id);
    }
  };

  const handleCopyShareLink = () => {
    const id = shareResult || existingShare?.share_id;
    if (!id) return;
    navigator.clipboard.writeText(`${import.meta.env.VITE_URL}/shared/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentShareId = shareResult || existingShare?.share_id;
  const shareUrl = currentShareId ? `${import.meta.env.VITE_URL}/shared/${currentShareId}` : null;

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Share">
      <div className="share-options">
        <button className="share-option" onClick={handleShareLink}>
          <Link size={20} />
          <span>Copy link</span>
        </button>
        <button className="share-option" onClick={handleShareFullCard}>
          <Image size={20} />
          <span>Full datacard image</span>
        </button>
        <button className="share-option" onClick={handleShareMobileCard}>
          <Image size={20} />
          <span>Mobile datacard image</span>
        </button>
      </div>

      {/* Category Sharing */}
      {category && (
        <>
          <div className="share-divider" />
          <div className="share-category-section">
            <div className="share-category-header">
              <Share2 size={16} />
              <span>Share List</span>
            </div>
            <div className="share-category-info">
              <span className="share-category-name">{category.name}</span>
              <span className="share-category-meta">
                {category.cards?.length || 0} {category.cards?.length === 1 ? "card" : "cards"}
              </span>
            </div>

            {/* Visibility toggle (authenticated, before sharing) */}
            {isAuthenticated && !shareResult && !existingShare && (
              <div className="share-visibility">
                <span className="share-visibility-label">Public link</span>
                <button
                  className={`share-visibility-toggle ${isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(!isPublic)}
                  role="switch"
                  aria-checked={isPublic}>
                  <span className="share-visibility-thumb" />
                </button>
              </div>
            )}

            {/* Share result */}
            {shareUrl && (
              <div className="share-result">
                <span className="share-result-url">{shareUrl}</span>
                <button className="share-result-copy" onClick={handleCopyShareLink}>
                  {copied ? <Check size={16} /> : <Link size={16} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}

            {/* Actions */}
            {checkingExisting ? (
              <div className="share-category-loading">
                <Loader size={16} className="share-spinner" />
                <span>Checking...</span>
              </div>
            ) : existingShare && !shareResult ? (
              <div className="share-category-actions">
                <button className="share-category-btn" onClick={handleUpdateCategory} disabled={isSharing}>
                  {isSharing ? <Loader size={16} className="share-spinner" /> : <RefreshCw size={16} />}
                  <span>{isSharing ? "Updating..." : "Update Existing Share"}</span>
                </button>
                <button
                  className="share-category-btn share-category-btn--secondary"
                  onClick={handleShareCategory}
                  disabled={isSharing}>
                  <span>Create New Share</span>
                </button>
              </div>
            ) : !shareResult ? (
              <button className="share-category-btn" onClick={handleShareCategory} disabled={isSharing}>
                {isSharing ? <Loader size={16} className="share-spinner" /> : <Share2 size={16} />}
                <span>{isSharing ? "Generating..." : isAuthenticated ? "Share" : "Generate Link"}</span>
              </button>
            ) : (
              <button className="share-category-btn" onClick={handleCopyShareLink}>
                {copied ? <Check size={16} /> : <Link size={16} />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
};
