import { Link, Image } from "lucide-react";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileSharingMenu.css";

export const MobileSharingMenu = ({ isVisible, setIsVisible, shareFullCard, shareMobileCard, shareLink }) => {
  const handleClose = () => setIsVisible(false);

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
    </BottomSheet>
  );
};
