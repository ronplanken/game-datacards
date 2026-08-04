import React from "react";
import { Share2 } from "lucide-react";

/**
 * StepSharing - Single step for v3.2.2 sharing rebuild
 *
 * @returns {JSX.Element} Sharing step content
 */
export const StepSharing = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Share2 size={28} />
      </div>
      <div>
        <h2 className="wnw-feature-title">Sharing, Rebuilt</h2>
      </div>
    </div>
    <p className="wnw-feature-description">Sharing has been rebuilt from the ground up for speed and reliability.</p>

    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>One-Click Sharing</strong>
          <p>Share any category or list with a single click. Generate a link and send it to anyone.</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Manage Your Shares</strong>
          <p>
            View, update, or remove your shared links from your account menu. Set links to public or private any time.
          </p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>A Fresh Start</strong>
          <p>
            We&apos;ve moved to a new backend to make sharing faster. Some older share links may no longer work — if
            you&apos;re missing anything, let us know on Discord and we&apos;ll help.
          </p>
        </div>
      </div>
    </div>

    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

export default StepSharing;
