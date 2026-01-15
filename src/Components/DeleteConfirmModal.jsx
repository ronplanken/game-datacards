import React from "react";
import * as ReactDOM from "react-dom";
import { confirmable, createConfirmation } from "react-confirm";
import "./DeleteConfirmModal.css";

const modalRoot = document.getElementById("modal-root");

const DeleteConfirmModal = (props) => {
  if (!props.show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      props.proceed(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2 className="delete-modal-title">{props.title}</h2>
        </div>
        <div className="delete-modal-body">
          <p className="delete-modal-content">{props.content}</p>
        </div>
        <div className="delete-modal-footer">
          <button className="delete-modal-btn delete-modal-btn-cancel" onClick={() => props.proceed(false)}>
            Cancel
          </button>
          <button
            className="delete-modal-btn delete-modal-btn-delete"
            onClick={() => {
              props.onConfirm();
              props.proceed(true);
            }}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export const deleteConfirmDialog = createConfirmation(confirmable(DeleteConfirmModal));
