import React from "react";
import * as ReactDOM from "react-dom";
import { confirmable, createConfirmation } from "react-confirm";
import "./ConfirmChangesModal.css";

const modalRoot = document.getElementById("modal-root");

const ConfirmChangesModal = (props) => {
  if (!props.show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      props.proceed(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">{props.title}</h2>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-content">{props.content}</p>
        </div>
        <div className="confirm-modal-footer">
          <button
            className="confirm-btn confirm-btn-cancel"
            onClick={() => {
              props.proceed(false);
            }}>
            Cancel
          </button>
          <button
            className="confirm-btn confirm-btn-discard"
            onClick={() => {
              props.handleDiscard();
              props.proceed(true);
            }}>
            Discard changes
          </button>
          <button
            className="confirm-btn confirm-btn-save"
            onClick={() => {
              props.handleSave();
              props.proceed(true);
            }}>
            Save
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export const confirmDialog = createConfirmation(confirmable(ConfirmChangesModal));
