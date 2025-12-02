import { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import "./BottomSheet.css";

export const BottomSheet = ({ isOpen, onClose, title, children, maxHeight = "80vh" }) => {
  const sheetRef = useRef(null);

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

  // Swipe handlers for drag-to-dismiss
  const swipeHandlers = useSwipeable({
    onSwipedDown: (eventData) => {
      if (eventData.velocity > 0.3 || eventData.deltaY > 100) {
        onClose();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
  });

  // Don't render if not open (but keep in DOM for animation)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className={`bottom-sheet-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} />

      {/* Sheet */}
      <div ref={sheetRef} className={`bottom-sheet ${isOpen ? "open" : ""}`} style={{ maxHeight }} {...swipeHandlers}>
        {/* Drag handle */}
        <div className="bottom-sheet-handle-container">
          <div className="bottom-sheet-handle" />
        </div>

        {/* Header */}
        {title && <div className="bottom-sheet-header">{title}</div>}

        {/* Content */}
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </>
  );
};
