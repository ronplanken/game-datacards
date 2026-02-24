import React from "react";
import ReactDOM from "react-dom/client";
import { Check, X, Info, AlertTriangle } from "lucide-react";
import "./message.css";

let toastContainer = null;
let toastRoot = null;
let toasts = [];
let toastId = 0;

const ICONS = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const getContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
    toastRoot = ReactDOM.createRoot(toastContainer);
  }
  return toastRoot;
};

const renderToasts = () => {
  const root = getContainer();
  root.render(
    <>
      {toasts.map((toast, index) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.visible ? "visible" : ""}`}
            style={{ "--toast-index": toasts.length - 1 - index }}>
            <Icon size={16} />
            <span>{toast.content}</span>
          </div>
        );
      })}
    </>,
  );
};

const removeToast = (id) => {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts[index].visible = false;
    renderToasts();

    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      renderToasts();
    }, 300);
  }
};

const showToast = (type, contentOrConfig, duration = 2.5) => {
  const id = ++toastId;

  // Handle both string and object config
  let content;
  let actualDuration = duration;

  if (typeof contentOrConfig === "object" && contentOrConfig !== null) {
    content = contentOrConfig.content || contentOrConfig.message || "";
    if (contentOrConfig.duration !== undefined) {
      actualDuration = contentOrConfig.duration;
    }
  } else {
    content = contentOrConfig;
  }

  const toast = {
    id,
    type,
    content,
    visible: false,
  };

  toasts.push(toast);
  renderToasts();

  // Trigger animation
  requestAnimationFrame(() => {
    toast.visible = true;
    renderToasts();
  });

  // Auto remove
  if (actualDuration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, actualDuration * 1000);
  }

  return () => removeToast(id);
};

export const message = {
  success: (content, duration) => showToast("success", content, duration),
  error: (content, duration) => showToast("error", content, duration),
  info: (content, duration) => showToast("info", content, duration),
  warning: (content, duration) => showToast("warning", content, duration),
  warn: (content, duration) => showToast("warning", content, duration),
};

export default message;
