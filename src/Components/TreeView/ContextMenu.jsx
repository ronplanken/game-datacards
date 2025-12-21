import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  const handleItemClick = (item, e) => {
    e.stopPropagation();
    if (item.disabled) return;
    item.onClick?.();
    onClose();
  };

  const menu = (
    <div ref={menuRef} className="tree-context-menu" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
      {items.map((item, index) => {
        if (item.type === "divider") {
          return <div key={`divider-${index}`} className="tree-context-menu-divider" />;
        }

        return (
          <div
            key={item.key}
            className={`tree-context-menu-item ${item.danger ? "danger" : ""} ${item.disabled ? "disabled" : ""}`}
            onClick={(e) => handleItemClick(item, e)}>
            {item.icon && <span className="tree-context-menu-item-icon">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
};
