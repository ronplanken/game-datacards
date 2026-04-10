import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, X, Plus, Settings, HelpCircle } from "lucide-react";

const AUTO_DISMISS_MS = 15000;

export const PostCreateBanner = ({ datasourceName, onDismiss, onAddCardType, onSelectDatasource }) => {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <div className={`designer-post-create-banner${exiting ? " exiting" : ""}`}>
      <div className="designer-post-create-header">
        <CheckCircle2 size={20} />
        <span>&ldquo;{datasourceName}&rdquo; created</span>
        <button onClick={handleDismiss} aria-label="Dismiss" className="designer-post-create-close">
          <X size={14} />
        </button>
      </div>
      <p>Here are some things to try next:</p>
      <div className="designer-post-create-actions">
        <button className="designer-btn designer-btn-sm" onClick={onAddCardType}>
          <Plus size={12} />
          Add another card type
        </button>
        <button className="designer-btn designer-btn-sm" onClick={onSelectDatasource}>
          <Settings size={12} />
          Edit datasource settings
        </button>
        <Link to="/help/datasource-editor/getting-started" className="designer-btn designer-btn-sm">
          <HelpCircle size={12} />
          Read the docs
        </Link>
      </div>
    </div>
  );
};
