import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateCustomDatasource, countDatasourceCards } from "../../Helpers/customDatasource.helpers";

/**
 * Modal for importing a custom datasource JSON file (with cards).
 * Validates using the standard validateCustomDatasource validator
 * and calls onImport with the parsed data on success.
 */
export const ImportDatasourceModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | valid | invalid
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setParsed(null);
      setErrors([]);
      setStatus("idle");
      setDragOver(false);
    }
  }, [isOpen]);

  // Escape key to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const processFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setStatus("idle");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        const validation = validateCustomDatasource(data);

        if (!validation.isValid) {
          setErrors(validation.errors);
          setStatus("invalid");
          setParsed(null);
        } else {
          setErrors([]);
          setStatus("valid");
          setParsed(data);
        }
      } catch {
        setErrors(["Invalid JSON. The file could not be parsed."]);
        setStatus("invalid");
        setParsed(null);
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      processFile(e.target.files?.[0]);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile && (droppedFile.type === "application/json" || droppedFile.name.endsWith(".json"))) {
        processFile(droppedFile);
      } else if (droppedFile) {
        setErrors(["Only JSON files are supported. Please select a .json file."]);
        setStatus("invalid");
      }
    },
    [processFile],
  );

  const handleImport = useCallback(() => {
    if (parsed && status === "valid") {
      onImport?.(parsed);
    }
  }, [parsed, status, onImport]);

  if (!isOpen) return null;

  const cardCount = parsed ? countDatasourceCards(parsed) : 0;
  const factionCount = parsed?.data?.length || 0;

  return (
    <div
      className="designer-confirm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Import Datasource">
      <div className="designer-confirm-dialog designer-import-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="designer-confirm-header">
          <Upload />
          <h3 className="designer-confirm-title">Import Datasource</h3>
        </div>
        <div className="designer-confirm-body">
          <p className="designer-import-description">
            Select a datasource JSON file to import. The file must contain a name, version, and data array with at least
            one faction.
          </p>

          <div
            className={`designer-import-dropzone${dragOver ? " drag-over" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="designer-import-file-input"
              aria-label="Select datasource file"
            />
            {!file && (
              <>
                <FileText size={24} />
                <span>Click or drag a JSON file here</span>
              </>
            )}
            {file && <span className="designer-import-filename">{file.name}</span>}
          </div>

          {status === "valid" && parsed && (
            <div className="designer-import-preview">
              <div className="designer-import-status designer-import-status-valid">
                <CheckCircle2 size={14} />
                <span>Valid datasource</span>
              </div>
              <div className="designer-import-meta">
                <span>{parsed.name}</span>
                <span>v{parsed.version}</span>
                <span>
                  {factionCount} faction{factionCount !== 1 ? "s" : ""}
                </span>
                <span>
                  {cardCount} card{cardCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {status === "invalid" && errors.length > 0 && (
            <div className="designer-import-errors">
              <div className="designer-import-status designer-import-status-invalid">
                <AlertCircle size={14} />
                <span>Validation failed</span>
              </div>
              <ul className="designer-import-error-list">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="designer-confirm-footer">
          <button className="designer-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="designer-btn designer-btn-primary" onClick={handleImport} disabled={status !== "valid"}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
