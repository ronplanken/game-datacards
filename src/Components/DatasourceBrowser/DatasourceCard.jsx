import React from "react";
import { Download, Users, Check, Database } from "lucide-react";
import { GAME_SYSTEMS } from "../../Hooks/useDatasourceSharing";
import "./DatasourceCard.css";

export const DatasourceCard = ({ datasource, onClick, compact = false }) => {
  const gameSystemLabel =
    GAME_SYSTEMS.find((gs) => gs.value === datasource.game_system)?.label || datasource.game_system;

  return (
    <div
      className={`dsc-card ${compact ? "compact" : ""} ${datasource.is_subscribed ? "subscribed" : ""}`}
      onClick={onClick}>
      <div className="dsc-card-header">
        <div className="dsc-card-icon">
          <Database size={compact ? 14 : 16} />
        </div>
        <div className="dsc-card-meta">
          {datasource.game_system && <span className="dsc-game-system">{gameSystemLabel}</span>}
          {datasource.is_featured && <span className="dsc-featured-badge">Featured</span>}
        </div>
      </div>

      <h3 className="dsc-card-title">{datasource.name}</h3>

      {!compact && datasource.description && <p className="dsc-card-description">{datasource.description}</p>}

      <div className="dsc-card-author">by {datasource.author_name || "Unknown"}</div>

      <div className="dsc-card-footer">
        <div className="dsc-card-stats">
          <span className="dsc-stat">
            <Download size={12} />
            {formatNumber(datasource.downloads || 0)}
          </span>
          <span className="dsc-stat">
            <Users size={12} />
            {formatNumber(datasource.subscriber_count || 0)}
          </span>
        </div>

        {datasource.is_subscribed && (
          <span className="dsc-subscribed-badge">
            <Check size={12} />
            Subscribed
          </span>
        )}
      </div>
    </div>
  );
};

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
