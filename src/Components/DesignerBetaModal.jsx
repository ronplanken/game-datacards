import React, { useState } from "react";
import * as ReactDOM from "react-dom";
import { FlaskConical, ArrowLeft, ArrowRight } from "lucide-react";
import "../Components/WelcomeWizard/WelcomeWizard.css";

export const DesignerBetaModal = ({ visible, onAccept, onDecline }) => {
  const [isExiting, setIsExiting] = useState(false);

  if (!visible) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  const handleAccept = () => {
    setIsExiting(true);
    setTimeout(() => {
      onAccept();
    }, 200);
  };

  const handleDecline = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDecline();
    }, 200);
  };

  return ReactDOM.createPortal(
    <div className={`wz-overlay ${isExiting ? "wz-overlay--exiting" : ""}`}>
      <div className="wz-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wz-header">
          <div className="wz-header-content">
            <div>
              <div className="wz-title-row">
                <h2 className="wz-title">Card Designer</h2>
                <span className="wz-step-badge">Beta</span>
              </div>
              <p className="wz-subtitle">Please read before continuing</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="wz-body" style={{ flexDirection: "column" }}>
          <div className="wz-content">
            <div className="wz-step-content" style={{ animation: "wzFadeSlideIn 0.4s ease-out" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div className="wz-welcome-logo" style={{ background: "rgba(250, 140, 22, 0.15)", boxShadow: "none" }}>
                  <FlaskConical size={36} style={{ color: "#fa8c16" }} />
                </div>
              </div>

              <p className="wz-step-description" style={{ textAlign: "center", marginBottom: 16 }}>
                {
                  "The Card Designer is an early feature that's still actively being developed. Things may change, break, or work differently in future updates."
                }
              </p>

              <p className="wz-step-description" style={{ textAlign: "center", marginBottom: 16 }}>
                {
                  "Templates you create during the beta are not guaranteed to remain compatible with future versions. We can't restore or fix templates that stop working after an update."
                }
              </p>

              <div
                style={{
                  textAlign: "center",
                  padding: "14px 18px",
                  background: "rgba(250, 140, 22, 0.05)",
                  border: "1px solid rgba(250, 140, 22, 0.15)",
                  borderRadius: "var(--wz-radius-xs)",
                  fontSize: 13,
                  color: "var(--wz-text-muted)",
                }}>
                By continuing, you accept that this feature is provided as-is and that template compatibility may change
                without notice.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wz-footer">
          <div className="wz-footer-left">
            <button className="wz-btn wz-btn--ghost" onClick={handleDecline}>
              <ArrowLeft size={16} />
              Go back
            </button>
          </div>
          <div className="wz-footer-right">
            <button className="wz-btn wz-btn--primary" onClick={handleAccept}>
              {"I understand, let's go"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
