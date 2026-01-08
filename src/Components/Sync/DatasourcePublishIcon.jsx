import React from "react";
import { Upload } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import { useAuth } from "../../Hooks/useAuth";
import "./DatasourcePublishIcon.css";

export function DatasourcePublishIcon({ datasource, onPublish }) {
  const { user } = useAuth();

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const { isUploaded, isPublished } = datasource;

  // Only show when datasource is uploaded to cloud
  if (!isUploaded) {
    return null;
  }

  // Handle click on publish icon
  const handleClick = (e) => {
    e.stopPropagation();
    onPublish?.();
  };

  // Determine icon styling based on publish state
  const getIconConfig = () => {
    if (isPublished) {
      return {
        className: "datasource-publish-icon published",
        tooltip: "Published - click to push update",
      };
    }

    return {
      className: "datasource-publish-icon not-published",
      tooltip: "Click to publish",
    };
  };

  const config = getIconConfig();

  return (
    <div className="datasource-publish-icon-wrapper">
      <Tooltip content={config.tooltip} placement="top">
        <button className={config.className} onClick={handleClick} aria-label={config.tooltip}>
          <Upload size={12} />
        </button>
      </Tooltip>
    </div>
  );
}
