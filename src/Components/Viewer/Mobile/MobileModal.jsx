import { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import "./MobileModal.css";

export const MobileModal = ({ isOpen, onClose, title, children, zIndex = 1000 }) => {
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

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <>
      <div className="mobile-modal-backdrop" onClick={onClose} style={{ zIndex: zIndex + 1 }} />
      <div className="mobile-modal" style={{ zIndex: zIndex + 2 }}>
        <div className="mobile-modal-header">
          <span className="mobile-modal-title">{title}</span>
          <button className="mobile-modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <div className="mobile-modal-content">{children}</div>
      </div>
    </>,
    modalRoot,
  );
};
