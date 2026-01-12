import React from "react";
import { CheckCircle, Search, FolderPlus, Settings } from "lucide-react";
import { GAME_SYSTEMS } from "../constants";

/**
 * Completion step with quick actions
 */
export const StepComplete = ({ selectedGameSystem, onAction }) => {
  const selectedSystem = GAME_SYSTEMS.find((s) => s.id === selectedGameSystem);

  return (
    <div className="wz-complete">
      <div className="wz-complete-icon">
        <CheckCircle />
      </div>

      <h2 className="wz-complete-title">You&apos;re All Set!</h2>

      <p className="wz-complete-subtitle">
        Your workspace is ready. Start browsing units, create your first category, or dive into settings to customize
        your experience.
      </p>

      {selectedSystem && (
        <div className="wz-complete-game" style={{ "--game-color": selectedSystem.color }}>
          <div className="wz-complete-game-dot" />
          <span className="wz-complete-game-name">
            {selectedSystem.title}
            {selectedSystem.subtitle && ` ${selectedSystem.subtitle}`}
          </span>
        </div>
      )}

      <div className="wz-complete-actions">
        <button className="wz-action-btn wz-action-btn--primary" onClick={() => onAction?.("browse")}>
          <Search />
          Browse Units
        </button>
        <button className="wz-action-btn" onClick={() => onAction?.("create")}>
          <FolderPlus />
          Create Category
        </button>
        <button className="wz-action-btn" onClick={() => onAction?.("settings")}>
          <Settings />
          Open Settings
        </button>
      </div>

      <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wz-discord-link">
        <img
          src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"
          alt="Join our Discord"
        />
      </a>
    </div>
  );
};
