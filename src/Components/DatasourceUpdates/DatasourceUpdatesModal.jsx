import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { useDatasourceUpdates } from "./useDatasourceUpdates";
import { DatasourceUpdatesBody, plural } from "./DatasourceUpdatesBody";

export const DatasourceUpdatesModal = ({
  isOpen,
  onClose,
  title = "Compare with datasource",
  cards = [],
  dataSource,
  selectedDataSource,
  language = "en",
  onApply,
}) => {
  const state = useDatasourceUpdates({ isOpen, cards, dataSource, selectedDataSource, language });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <div className="ucm-overlay" onClick={onClose} data-testid="dsu-overlay">
      <div className="ucm-modal dsu-modal" onClick={(e) => e.stopPropagation()} data-testid="dsu-modal">
        <div className="ucm-header">
          <h3 className="ucm-title">{title}</h3>
          <button className="ucm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="ucm-content">
          <DatasourceUpdatesBody state={state} language={language} />
        </div>

        <div className="ucm-footer">
          {state.changed.length > 0 ? (
            <button
              className="ucm-submit"
              onClick={() => onApply(state.results, state.selectedUuids)}
              type="button"
              disabled={state.selectedUuids.length === 0}>
              Update {plural(state.selectedUuids.length, "card")}
            </button>
          ) : (
            <button className="ucm-submit" onClick={onClose} type="button">
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
