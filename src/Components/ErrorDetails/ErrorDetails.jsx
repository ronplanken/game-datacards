import { useMemo, useState } from "react";
import { buildErrorReport, formatErrorReport } from "../../Helpers/errorReport.helpers";
import "./ErrorDetails.css";

const copyText = async (text) => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Copy failed");
};

export const ErrorDetails = ({ error, componentStack = null, variant = "light" }) => {
  const report = useMemo(() => buildErrorReport({ error, componentStack }), [error, componentStack]);
  const [copyState, setCopyState] = useState("idle");

  const handleCopy = async () => {
    try {
      await copyText(formatErrorReport(report));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "failed"
        ? "Copy failed, select the text below"
        : "Copy error details";

  return (
    <div className={`error-details error-details--${variant}`}>
      <p className="error-details-hint">When you report this on Discord, paste these details with your message.</p>
      <button type="button" className="error-details-copy" onClick={handleCopy}>
        {copyLabel}
      </button>
      <dl className="error-details-fields">
        {report.fields.map(([label, value]) => (
          <div className="error-details-field" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <details className="error-details-technical" open={copyState === "failed" ? true : undefined}>
        <summary>Technical details</summary>
        <pre>{formatErrorReport(report)}</pre>
      </details>
    </div>
  );
};
