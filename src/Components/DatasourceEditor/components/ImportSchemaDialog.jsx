import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateSchema } from "../../../Helpers/customSchema.helpers";

/**
 * Dialog for importing a datasource schema from a JSON file.
 * Validates the file contents before allowing import.
 */
export const ImportSchemaDialog = ({ open, onImport, onCancel }) => {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | valid | invalid
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setParsed(null);
      setErrors([]);
      setStatus("idle");
      setDragOver(false);
    }
  }, [open]);

  // Escape key to cancel
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  const processFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setStatus("idle");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Validate the schema
        const validationErrors = [];

        if (!data.name || typeof data.name !== "string") {
          validationErrors.push("Missing or invalid 'name' field");
        }
        if (!data.version || typeof data.version !== "string") {
          validationErrors.push("Missing or invalid 'version' field");
        }

        if (data.schema) {
          const schemaResult = validateSchema(data.schema);
          if (!schemaResult.valid) {
            validationErrors.push(...schemaResult.errors);
          }
        } else {
          validationErrors.push("Missing 'schema' field — file does not contain a schema definition");
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setStatus("invalid");
          setParsed(null);
        } else {
          setErrors([]);
          setStatus("valid");
          setParsed(data);
        }
      } catch {
        setErrors(["Invalid JSON — could not parse the file"]);
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
        setErrors(["Please drop a JSON file"]);
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

  if (!open) return null;

  return (
    <div
      className="designer-confirm-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Import Schema">
      <div className="designer-confirm-dialog designer-import-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="designer-confirm-header">
          <Upload />
          <h3 className="designer-confirm-title">Import Schema</h3>
        </div>
        <div className="designer-confirm-body">
          <p className="designer-import-description">
            Select a datasource schema JSON file to import. The file will be validated before import.
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
              aria-label="Select schema file"
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
                <span>Valid schema</span>
              </div>
              <div className="designer-import-meta">
                <span>{parsed.name}</span>
                <span>v{parsed.version}</span>
                {parsed.schema?.cardTypes && (
                  <span>
                    {parsed.schema.cardTypes.length} card type{parsed.schema.cardTypes.length !== 1 ? "s" : ""}
                  </span>
                )}
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
          <button className="designer-btn" onClick={onCancel}>
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
