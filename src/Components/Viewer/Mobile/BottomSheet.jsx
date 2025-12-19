import { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import "./BottomSheet.css";

export const BottomSheet = ({ isOpen, onClose, title, headerRight, children, maxHeight = "80vh" }) => {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);

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
      // Only close if content is scrolled to top (prevents closing when user is scrolling)
      const isAtTop = !contentRef.current || contentRef.current.scrollTop <= 0;
      if (isAtTop && (eventData.velocity > 0.3 || eventData.deltaY > 100)) {
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
        {(title || headerRight) && (
          <div className="bottom-sheet-header">
            <span className="bottom-sheet-title">{title}</span>
            {headerRight && <div className="bottom-sheet-header-right">{headerRight}</div>}
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>
  );
};
